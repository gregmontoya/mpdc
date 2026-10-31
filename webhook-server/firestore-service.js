/**
 * MPDC Unified Firestore Service
 * Replaces Supabase completely with direct, authenticated Firebase Firestore communication.
 * Compatible with both Admin SDK and REST API fallback.
 */

const API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyBSxrgaNnTzRMqo-9C47vZfnTTDRqyyb10";
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "mpdc-website-32dae";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "boolean") return { booleanValue: val };
    if (typeof val === "number") {
        return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    }
    if (typeof val === "string") return { stringValue: val };
    if (val instanceof Date) return { timestampValue: val.toISOString() };
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(toFirestoreValue) } };
    }
    if (typeof val === "object") {
        const fields = {};
        for (const [k, v] of Object.entries(val)) {
            fields[k] = toFirestoreValue(v);
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
}

function fromFirestoreValue(valObj) {
    if (!valObj) return null;
    if ("nullValue" in valObj) return null;
    if ("booleanValue" in valObj) return valObj.booleanValue;
    if ("integerValue" in valObj) return parseInt(valObj.integerValue, 10);
    if ("doubleValue" in valObj) return valObj.doubleValue;
    if ("stringValue" in valObj) return valObj.stringValue;
    if ("timestampValue" in valObj) return valObj.timestampValue;
    if ("arrayValue" in valObj) return (valObj.arrayValue.values || []).map(fromFirestoreValue);
    if ("mapValue" in valObj) {
        const res = {};
        const fields = valObj.mapValue.fields || {};
        for (const [k, v] of Object.entries(fields)) {
            res[k] = fromFirestoreValue(v);
        }
        return res;
    }
    return null;
}

function parseDoc(doc) {
    if (!doc || !doc.fields) return null;
    const data = {};
    for (const [k, v] of Object.entries(doc.fields)) {
        data[k] = fromFirestoreValue(v);
    }
    const docId = doc.name ? doc.name.split('/').pop() : null;
    return { id: docId, _rawName: doc.name, ...data };
}

/**
 * Find a single prospect by email
 */
async function getProspect(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const query = {
        structuredQuery: {
            from: [{ collectionId: "prospects" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "email" },
                    op: "EQUAL",
                    value: { stringValue: normalized }
                }
            },
            limit: 1
        }
    };

    try {
        const res = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query)
        });
        const results = await res.json();
        if (Array.isArray(results) && results[0] && results[0].document) {
            return parseDoc(results[0].document);
        }
    } catch (e) {
        console.error("Firestore getProspect error:", e.message);
    }
    return null;
}

/**
 * Upsert a prospect by email (updates existing doc or creates a new one)
 */
async function upsertProspect(email, data = {}) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const existing = await getProspect(normalized);

    const merged = {
        email: normalized,
        ...data,
        updated_at: new Date().toISOString()
    };

    if (!existing) {
        merged.created_at = merged.created_at || new Date().toISOString();
        merged.timestamp = merged.timestamp || new Date().toISOString();
    }

    const fields = {};
    for (const [k, v] of Object.entries(merged)) {
        fields[k] = toFirestoreValue(v);
    }

    try {
        if (existing && existing._rawName) {
            // PATCH existing document
            const updateMaskParams = Object.keys(merged)
                .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
                .join('&');
            const patchUrl = `https://firestore.googleapis.com/v1/${existing._rawName}?key=${API_KEY}&${updateMaskParams}`;
            const res = await fetch(patchUrl, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields })
            });
            const updatedDoc = await res.json();
            return parseDoc(updatedDoc);
        } else {
            // CREATE new document in collection
            const postUrl = `${BASE_URL}/prospects?key=${API_KEY}`;
            const res = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields })
            });
            const createdDoc = await res.json();
            return parseDoc(createdDoc);
        }
    } catch (e) {
        console.error("Firestore upsertProspect error:", e.message);
        return null;
    }
}

/**
 * Get all prospects (for CRM or batch automation)
 */
async function listProspects(pageSize = 300) {
    try {
        const res = await fetch(`${BASE_URL}/prospects?pageSize=${pageSize}&key=${API_KEY}`);
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
            return data.documents.map(parseDoc);
        }
    } catch (e) {
        console.error("Firestore listProspects error:", e.message);
    }
    return [];
}

/**
 * Get a profile (member/student) by email
 */
async function getProfile(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const query = {
        structuredQuery: {
            from: [{ collectionId: "profiles" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "email" },
                    op: "EQUAL",
                    value: { stringValue: normalized }
                }
            },
            limit: 1
        }
    };

    try {
        const res = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query)
        });
        const results = await res.json();
        if (Array.isArray(results) && results[0] && results[0].document) {
            return parseDoc(results[0].document);
        }
    } catch (e) {
        console.error("Firestore getProfile error:", e.message);
    }
    return null;
}

/**
 * Upsert member profile
 */
async function upsertProfile(email, data = {}) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const existing = await getProfile(normalized);

    const merged = {
        email: normalized,
        ...data,
        updatedAt: new Date().toISOString()
    };

    const fields = {};
    for (const [k, v] of Object.entries(merged)) {
        fields[k] = toFirestoreValue(v);
    }

    try {
        if (existing && existing._rawName) {
            const updateMaskParams = Object.keys(merged)
                .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
                .join('&');
            const patchUrl = `https://firestore.googleapis.com/v1/${existing._rawName}?key=${API_KEY}&${updateMaskParams}`;
            const res = await fetch(patchUrl, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields })
            });
            const updatedDoc = await res.json();
            return parseDoc(updatedDoc);
        } else {
            const postUrl = `${BASE_URL}/profiles?key=${API_KEY}`;
            const res = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields })
            });
            const createdDoc = await res.json();
            return parseDoc(createdDoc);
        }
    } catch (e) {
        console.error("Firestore upsertProfile error:", e.message);
        return null;
    }
}

module.exports = {
    getProspect,
    upsertProspect,
    listProspects,
    getProfile,
    upsertProfile,
    parseDoc,
    toFirestoreValue,
    fromFirestoreValue
};

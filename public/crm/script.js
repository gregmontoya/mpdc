
// -------------------------------------------------------------------------
// Global Leads Engine (HUBSPOT EDITION + AI)
// -------------------------------------------------------------------------

const setupKanban = (leads) => {
    console.log('[HUBSPOT] Syncing board with', leads.length, 'contacts');

    const ids = ['col-web-leads', 'col-email', 'col-id-manual', 'col-new', 'col-convo', 'col-qualifying', 'col-course-sent', 'col-booked'];
    const cols = ids.map(id => document.getElementById(id));
    cols.forEach(el => { if (el) el.innerHTML = ''; });

    leads.forEach(lead => {
        const timeAgo = lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'New';
        const isEmail = (lead.source || '').toLowerCase().includes('email') || (lead.email && !lead.instagram_handle);

        const sourceDetail = lead.source_detail ? `<span class="tag tag-blue" style="font-size:0.6rem; margin-left:4px;">${lead.source_detail}</span>` : '';
        const sourceIcon = (lead.source || '').toLowerCase().includes('manychat') ? '<i class="fa-solid fa-robot"></i>' :
            (lead.source || '').toLowerCase().includes('legacy') ? '<i class="fa-solid fa-file-import"></i>' :
                '<i class="fa-solid fa-envelope"></i>';

        const cardHTML = `
            <div class="kanban-card" data-id="${lead.id}" data-source="${lead.source}" draggable="true">
                <div class="card-header">
                    <span class="contact-name">${lead.name || 'Anonymous'}</span>
                </div>
                <div class="card-deal-value">$${parseFloat(lead.deal_value || 0).toLocaleString()}</div>
                <div class="tags">
                    <span class="tag tag-purple">${sourceIcon} ${lead.source}</span>
                    ${sourceDetail}
                    ${lead.pain_point ? `<span class="tag tag-red">${lead.pain_point}</span>` : ''}
                </div>
                <div class="card-footer">
                    <span class="time-badge"><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
                    <div class="avatar-xs">${(lead.name || 'U').charAt(0).toUpperCase()}</div>
                </div>
            </div>
        `;

        const status = (lead.status || 'new').toLowerCase();
        const source = (lead.source || '').toLowerCase();
        let targetId = 'col-new';

        if (status === 'convo') targetId = 'col-convo';
        else if (status === 'qualifying') targetId = 'col-qualifying';
        else if (status === 'course_sent') targetId = 'col-course-sent';
        else if (status === 'booked') targetId = 'col-booked';
        else if (status === 'abandoned') targetId = 'col-web-leads';
        else if (status === 'prospect') targetId = 'col-email';
        else {
            if (source.match(/checkout|abandoned|landing|website/)) targetId = 'col-web-leads';
            else if (isEmail) targetId = 'col-email';
        }

        const container = document.getElementById(targetId);
        if (container) container.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Stats Updating
    const updateColumnStats = (colId) => {
        const matchingLeads = leads.filter(l => {
            const status = (l.status || 'new').toLowerCase();
            const source = (l.source || '').toLowerCase();
            const isEmail = (l.source || '').toLowerCase().includes('email') || (l.email && !l.instagram_handle);
            let tid = 'col-new';
            if (status === 'convo') tid = 'col-convo';
            else if (status === 'qualifying') tid = 'col-qualifying';
            else if (status === 'course_sent') tid = 'col-course-sent';
            else if (status === 'booked') tid = 'col-booked';
            else if (status === 'abandoned') tid = 'col-web-leads';
            else if (status === 'prospect') tid = 'col-email';
            else {
                if (source.match(/checkout|abandoned|landing|website/)) tid = 'col-web-leads';
                else if (isEmail) tid = 'col-email';
            }
            return tid === colId;
        });

        const countEl = document.getElementById(`count-${colId.replace('col-', '')}`);
        const valueEl = document.getElementById(`value-${colId.replace('col-', '')}`);
        const totalValue = matchingLeads.reduce((sum, l) => sum + parseFloat(l.deal_value || 0), 0);

        if (countEl) countEl.innerText = matchingLeads.length;
        if (valueEl) valueEl.innerText = '$' + totalValue.toLocaleString();
        return totalValue;
    };

    let grandTotal = 0;
    ids.forEach(id => { grandTotal += updateColumnStats(id); });
    const totalEl = document.getElementById('pipeline-total');
    if (totalEl) totalEl.innerText = '$' + grandTotal.toLocaleString();

    // Re-init Sortable
    if (typeof Sortable !== 'undefined') {
        cols.forEach(el => {
            if (!el || el.sortable) return; // Prevent double-init
            el.sortable = new Sortable(el, {
                group: 'kanban',
                animation: 200,
                onEnd: async (evt) => {
                    const leadId = evt.item.getAttribute('data-id');
                    const statusMap = { 'col-new': 'new', 'col-convo': 'convo', 'col-qualifying': 'qualifying', 'col-course-sent': 'course_sent', 'col-booked': 'booked', 'col-web-leads': 'abandoned', 'col-email': 'prospect' };
                    const newStatus = statusMap[evt.to.id] || 'new';
                    if (window.updateLeadStatus) {
                        await window.updateLeadStatus(leadId, newStatus);
                        const freshData = await window.fetchLeads();
                        setupKanban(freshData);
                    }
                }
            });
        });
    }

    // Card Clicks
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('click', () => {
            const lid = card.getAttribute('data-id');
            const data = leads.find(l => l.id === lid);
            if (window.openLeadPanel) window.openLeadPanel(data);
        });
    });
};

// AI Hook Utils
const generateHook = (name, painPoint) => {
    const hooks = [
        `Hey ${name}, saw you were looking into ${painPoint}. Just wanted to reach out—you're not alone in this. Ready to chat?`,
        `${name}, regarding the ${painPoint} situation... I have a specific strategy that might help. Do you have 2 minutes?`,
        `Hi ${name}! I noticed you're dealing with ${painPoint}. We've helped hundreds of guys navigate this exact spot. Should I send over our latest guide?`
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
};

window.openLeadPanel = function (data) {
    const panel = document.getElementById('leadSidePanel');
    const overlay = document.getElementById('sidePanelOverlay');
    if (!panel) return;

    panel.classList.add('active');
    overlay.classList.add('active');

    document.getElementById('panelLeadName').innerText = data.name;
    document.getElementById('panelNameTitle').innerText = data.name;
    document.getElementById('panelHandle').innerHTML = (data.instagram_handle ? `<i class="fa-brands fa-instagram" style="color:#E1306C; margin-right:4px;"></i> ${data.instagram_handle}` : '') + (data.email ? ` <i class="fa-regular fa-envelope" style="margin-right:4px; margin-left: ${data.instagram_handle ? '10px' : '0'};"></i> ${data.email}` : '');
    document.getElementById('panelAvatar').innerText = (data.name || 'U').charAt(0).toUpperCase();
    document.getElementById('editDealValue').value = data.deal_value;
    document.getElementById('editPainPoint').value = data.pain_point || 'General';
    document.getElementById('aiHookOutput').innerText = "Click generate to create outreach...";

    window.currentLeadId = data.id;
    window.currentLeadData = data;

    // Reset Enrichment UI
    const btn = document.getElementById('runEnrichmentBtn');
    const status = document.getElementById('enrichmentStatus');
    const block = document.getElementById('enrichedDataBlock');
    if (btn && status && block) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-radar"></i> Run Data Scrape';
        status.innerHTML = 'Ready to extract public data.';
        status.style.display = 'block';
        block.style.display = 'none';
    }

    const statusEl = document.getElementById('activeSequenceStatus');
    if (statusEl) {
        if (data.active_sequence) {
            statusEl.innerHTML = `<div style="color:#00a4bd; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Enrolled in: ${data.active_sequence.replace('_', ' ').toUpperCase()}</div><p style="font-size:0.7rem; margin-top:4px;">Emails are triggering automatically.</p>`;
        } else {
            statusEl.innerHTML = `No active sequence enrollment.`;
        }
    }

    const timeline = document.getElementById('leadTimeline');
    if (timeline) {
        timeline.innerHTML = `<div class="timeline-item"><p class="task-title" style="font-weight:600; font-size: 0.85rem;">${data.notes}</p><p class="task-meta">Recent History</p></div>`;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const refreshData = async () => {
        if (window.fetchLeads) {
            const data = await window.fetchLeads();
            setupKanban(data);
        }
    };

    await refreshData();

    // Closing
    document.getElementById('closeSidePanel')?.addEventListener('click', () => {
        document.getElementById('leadSidePanel')?.classList.remove('active');
        document.getElementById('sidePanelOverlay')?.classList.remove('active');
    });

    // Add Lead Modal Logic
    const addModal = document.getElementById('addLeadModalOverlay');
    document.getElementById('addLeadBtn')?.addEventListener('click', () => {
        addModal.classList.add('active');
    });

    const closeAddModal = () => {
        addModal.classList.remove('active');
        // Clear inputs
        document.getElementById('newLeadHandle').value = '';
        document.getElementById('newLeadName').value = '';
        document.getElementById('newLeadNote').value = '';
    };

    document.getElementById('closeAddLeadModal')?.addEventListener('click', closeAddModal);
    document.getElementById('cancelAddLead')?.addEventListener('click', closeAddModal);

    document.getElementById('saveNewLeadBtn')?.addEventListener('click', async () => {
        const handle = document.getElementById('newLeadHandle').value.trim();
        const name = document.getElementById('newLeadName').value.trim();
        const pain = document.getElementById('newLeadPainPoint').value;
        const notes = document.getElementById('newLeadNote').value.trim();
        const btn = document.getElementById('saveNewLeadBtn');

        if (!handle) {
            alert('Please enter an IG Handle!');
            return;
        }

        btn.innerText = 'SAVING...';
        btn.disabled = true;

        if (window.createSocialLead) {
            const success = await window.createSocialLead(handle, name, pain, notes);
            if (success) {
                btn.innerText = 'SAVED! ✅';
                setTimeout(() => {
                    closeAddModal();
                    btn.innerText = 'Save to CRM';
                    btn.disabled = false;
                    refreshData();
                }, 1000);
            } else {
                btn.innerText = 'ERROR ❌';
                btn.disabled = false;
                setTimeout(() => btn.innerText = 'Save to CRM', 2000);
            }
        }
    });

    // Tab Switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const section = tab.getAttribute('data-tab');
            document.getElementById('activitySection').style.display = section === 'activity' ? 'block' : 'none';
            document.getElementById('aiSection').style.display = section === 'ai' ? 'block' : 'none';
            document.getElementById('notesSection').style.display = section === 'notes' ? 'block' : 'none';
            document.getElementById('sequencesSection').style.display = section === 'sequences' ? 'block' : 'none';
        });
    });

    // Enrollment logic
    document.getElementById('enrollBtn')?.addEventListener('click', async () => {
        const seq = document.getElementById('sequenceSelect').value;
        const btn = document.getElementById('enrollBtn');
        if (seq && window.currentLeadId && window.enrollInSequence) {
            btn.innerText = 'ENROLLING...';
            btn.disabled = true;
            const success = await window.enrollInSequence(window.currentLeadId, seq);
            if (success) {
                btn.innerText = 'ENROLLED! ✅';
                // Refresh data and panel
                const data = (await window.fetchLeads()).find(l => l.id === window.currentLeadId);
                if (data) window.openLeadPanel(data);
            } else { btn.innerText = 'ERROR ❌'; }
            setTimeout(() => { btn.innerText = 'Enroll Lead in Sequence'; btn.disabled = false; }, 2000);
        }
    });

    // Save Logic
    document.getElementById('saveValueBtn')?.addEventListener('click', async () => {
        const val = document.getElementById('editDealValue').value;
        const pain = document.getElementById('editPainPoint').value;
        const btn = document.getElementById('saveValueBtn');
        if (window.currentLeadId && window.updateWorkInfo) {
            btn.innerText = 'SAVING...';
            btn.disabled = true;
            const success = await window.updateWorkInfo(window.currentLeadId, val, pain);
            if (success) {
                btn.innerText = 'SAVED! ✅';
                await refreshData();
            } else { btn.innerText = 'ERROR ❌'; }
            setTimeout(() => { btn.innerText = 'Update Deal'; btn.disabled = false; }, 2000);
        }
    });

    document.getElementById('saveNoteBtn')?.addEventListener('click', async () => {
        const notes = document.getElementById('noteInput').value.trim();
        const btn = document.getElementById('saveNoteBtn');
        if (notes && window.currentLeadId && window.updateLeadNotes) {
            btn.innerText = 'SAVING...';
            btn.disabled = true;
            const success = await window.updateLeadNotes(window.currentLeadId, notes);
            if (success) {
                btn.innerText = 'SAVED! ✅';
                document.getElementById('noteInput').value = '';
                await refreshData();
                const data = (await window.fetchLeads()).find(l => l.id === window.currentLeadId);
                if (data) window.openLeadPanel(data);
            } else { btn.innerText = 'ERROR ❌'; }
            setTimeout(() => { btn.innerText = 'Save Note'; btn.disabled = false; }, 2000);
        }
    });

    document.getElementById('markCourseSentBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('markCourseSentBtn');
        if (window.currentLeadId && window.updateLeadStatus && window.updateLeadNotes) {
            btn.innerText = 'MARKING...';
            btn.disabled = true;

            // 1. Update Status
            await window.updateLeadStatus(window.currentLeadId, 'course_sent');

            // 2. Add System Note
            const stamp = new Date().toLocaleString();
            await window.updateLeadNotes(window.currentLeadId, `🎁 Course access link sent via DM manually at ${stamp}.`);

            btn.innerText = 'SENT! ✅';
            setTimeout(async () => {
                document.getElementById('leadSidePanel')?.classList.remove('active');
                document.getElementById('sidePanelOverlay')?.classList.remove('active');
                btn.innerText = 'Mark Course Sent';
                btn.disabled = false;
                if (window.fetchLeads) {
                    const data = await window.fetchLeads();
                    setupKanban(data);
                }
            }, 1000);
        }
    });

    // Data Enrichment (Clay Integration: APIFY & CLEARBIT)
    document.getElementById('runEnrichmentBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('runEnrichmentBtn');
        const status = document.getElementById('enrichmentStatus');
        const block = document.getElementById('enrichedDataBlock');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initializing Waterfall...';
        status.innerHTML = 'Connecting to data sources...';
        status.style.display = 'block';
        block.style.display = 'none';

        const lead = window.currentLeadData;
        const igHandle = lead.instagram_handle ? lead.instagram_handle.replace('@', '') : null;
        const email = lead.email;

        // --- IMPORTANT: Paste your API keys here ---
        const APIFY_TOKEN = 'apify_api_U4kJL5rJsLAxCbtVOhGv8g91tVPUXo4pled5';
        const CLEARBIT_KEY = 'YOUR_CLEARBIT_API_KEY_HERE';

        let enrichedData = { location: '--', bio: '--', topic: '--' };

        try {
            // STEP 1: If we have an IG Handle -> Use Apify Instagram Scraper API
            if (igHandle) {
                status.innerHTML = `Extracting Instagram data for @${igHandle} via Apify...`;
                const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

                if (APIFY_TOKEN !== 'YOUR_APIFY_API_TOKEN_HERE') {
                    const response = await fetch(apifyUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usernames: [igHandle] })
                    });
                    const data = await response.json();
                    if (data && data.length > 0) {
                        enrichedData.bio = data[0].biography || 'No bio found';
                        enrichedData.topic = `Followers: ${data[0].followersCount} | Posts: ${data[0].postsCount}`;
                    }
                } else {
                    // Demo Simulation when no API key is set
                    await new Promise(r => setTimeout(r, 2000));
                    enrichedData.bio = `[Apify Ready] Founder | Father of 2 | Fitness Enthusiast`;
                    enrichedData.topic = `Followers: 14.2K | Posts: 342`;
                }
            }

            // STEP 2: If we have an Email -> Use Clearbit API
            if (email && email.indexOf('@instagram.com') === -1) {
                status.innerHTML = `Extracting business data for ${email} via Clearbit...`;
                const clearbitUrl = `https://person.clearbit.com/v2/combined/find?email=${email}`;

                if (CLEARBIT_KEY !== 'YOUR_CLEARBIT_API_KEY_HERE') {
                    const response = await fetch(clearbitUrl, {
                        headers: { 'Authorization': `Bearer ${CLEARBIT_KEY}` }
                    });
                    const data = await response.json();
                    if (data.person) {
                        enrichedData.location = data.person.location || enrichedData.location;
                        enrichedData.bio = data.person.bio || enrichedData.bio;
                    }
                    if (data.company) {
                        enrichedData.topic = `Works at: ${data.company.name} (${data.company.domain})`;
                    }
                } else {
                    // Demo Simulation when no API key is set
                    await new Promise(r => setTimeout(r, 1500));
                    enrichedData.location = `Austin, TX`;
                    if (!igHandle) enrichedData.bio = `[Clearbit Ready] Strategy Consultant`;
                }
            }

            // Fallbacks
            if (enrichedData.location === '--') enrichedData.location = 'Location Hidden';
            if (enrichedData.bio === '--') enrichedData.bio = 'Private or Empty Bio';
            if (enrichedData.topic === '--') enrichedData.topic = 'No recent activity detected';

            // Display Results
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Data Enriched';
            status.style.display = 'none';
            block.style.display = 'block';

            document.getElementById('eLocation').innerText = enrichedData.location;
            document.getElementById('eBio').innerText = enrichedData.bio;
            document.getElementById('eTopic').innerText = enrichedData.topic;

        } catch (error) {
            console.error('Enrichment Error:', error);
            status.innerHTML = `<span style="color:red;">Error connecting to APIs. Check console.</span>`;
            btn.innerHTML = 'Error ❌';
        }

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-radar"></i> Re-Run Data Scrape';
        }, 4000);
    });

    document.getElementById('generateAIHook')?.addEventListener('click', () => {
        const hook = generateHook(window.currentLeadData?.name || 'there', document.getElementById('editPainPoint').value);
        document.getElementById('aiHookOutput').innerText = hook;
    });

    // BULK AUTO-ENRICHMENT LOGIC
    document.getElementById('bulkEnrichBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('bulkEnrichBtn');
        if (!window.fetchLeads) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning Pipeline...';

        try {
            // 1. Get all leads
            const allLeads = await window.fetchLeads();

            // 2. Identify leads with IG handles
            const igLeads = allLeads.filter(l => l.instagram_handle && l.instagram_handle.startsWith('@'));
            if (igLeads.length === 0) {
                btn.innerHTML = 'No IG Leads Found';
                setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-bolt" style="color:#f5c26b;"></i> Auto-Enrich List'; btn.disabled = false; }, 3000);
                return;
            }

            const usernamesToScrape = igLeads.map(l => l.instagram_handle.replace('@', ''));

            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enriching ${usernamesToScrape.length} Profiles...`;

            // 3. Send Bulk Request to Apify
            const APIFY_TOKEN = 'apify_api_U4kJL5rJsLAxCbtVOhGv8g91tVPUXo4pled5';
            const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

            const response = await fetch(apifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: usernamesToScrape }) // Send them all at once!
            });

            const scrapedData = await response.json();

            // 4. Update the DB for each one (Simulated mapping for now, to save your DB limits in testing)
            // In a full production build, we would map the Apify returned dataset back to the lead IDs and bulk update Supabase.
            console.log('[BULK ENRICHMENT] Received Data for:', scrapedData.length, 'profiles');
            console.log('[BULK ENRICHMENT] Example Data:', scrapedData[0]);

            btn.innerHTML = `<i class="fa-solid fa-check"></i> Enriched ${scrapedData.length} Leads`;

            // 5. Restore Button
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-bolt" style="color:#f5c26b;"></i> Auto-Enrich List';
                btn.disabled = false;
            }, 4000);

        } catch (e) {
            console.error('Bulk Enrich Error:', e);
            btn.innerHTML = 'Error ❌';
            setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-bolt" style="color:#f5c26b;"></i> Auto-Enrich List'; btn.disabled = false; }, 3000);
        }
    });

    // Source Filter Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const colId = btn.getAttribute('data-col');
            const filter = btn.getAttribute('data-filter');
            const col = document.getElementById(colId);
            const parentCol = btn.closest('.kanban-column');

            // Toggle Active UI
            parentCol.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter Cards
            col.querySelectorAll('.kanban-card').forEach(card => {
                const source = (card.getAttribute('data-source') || '').toLowerCase();
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    card.style.display = source.includes(filter.toLowerCase()) ? 'block' : 'none';
                }
            });
        });
    });
});

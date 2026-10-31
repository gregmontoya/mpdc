
// 🛡️ MPDC ADMIN AUTH GATEWAY
// This is a client-side gate. Real security happens on the server via API Secret.

function checkAuth() {
    const authKey = 'mpdc_admin_auth_status';
    const passKey = 'mpdc2026';

    if (localStorage.getItem(authKey) !== 'true') {
        const pass = prompt("🛡️ MPDC COMMAND CENTER\nEnter Admin Password:");
        if (pass === passKey) {
            localStorage.setItem(authKey, 'true');
            // Also set a local bypass token for dev if needed
            if (!localStorage.getItem('mpdc_admin_auth_token')) {
                localStorage.setItem('mpdc_admin_auth_token', 'local-dev-bypass');
            }
            return true;
        } else {
            document.body.innerHTML = `
                <div style="background:#0a0a0a; color:white; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;">
                    <h1 style="color:#ef4444; margin-bottom:10px;">🛑 ACCESS DENIED</h1>
                    <p style="opacity:0.6;">Invalid administrative credentials.</p>
                    <button onclick="location.reload()" style="margin-top:20px; background:#1e293b; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Retry</button>
                </div>
            `;
            return false;
        }
    }
    return true;
}

// Auto-check on load if needed, or export for manual call
if (window.location.pathname.startsWith('/crm') || window.location.pathname.startsWith('/admin')) {
    // We let the specific page call it to control timing, but we define it globally here
    window.checkAuth = checkAuth;
}

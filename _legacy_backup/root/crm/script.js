
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Navigation active state toggle
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // e.preventDefault(); // Allowed so links work
            document.querySelector('.nav-item.active')?.classList.remove('active');
            item.classList.add('active');
        });
    });

    // 2. Load Data from Supabase
    if (typeof fetchLeads === 'function') {
        const leads = await fetchLeads();
        renderLeads(leads);
    }

    // 3. Render Leads Logic
    function renderLeads(leads) {
        // Clear manual columns first (keeping headers)
        document.querySelectorAll('.kanban-cards').forEach(col => {
            if (col.id !== 'col-web-leads') col.innerHTML = '';
        });

        const webContainer = document.getElementById('col-web-leads');
        const manualCols = document.querySelectorAll('.kanban-column:not(:first-child) .kanban-cards'); // Assuming first is web leads now

        // Define column map based on existing structure (skipping web lead col)
        // 0: New DMs, 1: Convo, 2: Qualifying, 3: Booked
        // Actually, we have 5 columns now including Web Leads. Let's be specific by index or ID needed.
        // leads.html structure: 
        // Col 1: Web (id=col-web-leads)
        // Col 2: New DMs
        // Col 3: In Convo
        // Col 4: Qualifying
        // Col 5: Booked

        const colNew = manualCols[0];
        const colConvo = manualCols[1];
        const colQualifying = manualCols[2];
        const colBooked = manualCols[3];

        if (webContainer) webContainer.innerHTML = '';

        leads.forEach(lead => {
            const timeAgo = new Date(lead.created_at).toLocaleDateString();

            // TYPE 1: Web Abandonment (Source = checkout_button or similar)
            if (lead.source === 'checkout_button' || lead.source === 'landing_page') {
                if (!webContainer) return;
                const card = `
                <div class="kanban-card" style="border-left: 3px solid #C4613A;">
                    <div class="card-header">
                        <span class="contact-name">${lead.name || 'Visitor'}</span>
                        <span class="social-link"><i class="fa-solid fa-globe"></i> Website</span>
                    </div>
                    <p class="card-preview">Abandoned Checkout: ${lead.email}</p>
                    <div class="card-footer">
                        <span class="time-badge warning"><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
                        <div class="avatar-group">
                            <div class="avatar-xs" style="background:#C4613A;">WEB</div>
                        </div>
                    </div>
                </div>`;
                webContainer.insertAdjacentHTML('beforeend', card);
            }
            // TYPE 2: Instagram Manual Lead
            else {
                // Determine Column
                let targetCol = colNew;
                if (lead.status === 'convo') targetCol = colConvo;
                if (lead.status === 'qualifying') targetCol = colQualifying;
                if (lead.status === 'booked') targetCol = colBooked;

                if (!targetCol) return;

                const cardHTML = `
                    <div class="kanban-card">
                        <div class="card-header">
                            <span class="contact-name">${lead.name || 'New Lead'}</span>
                            <a href="#" class="social-link"><i class="fa-brands fa-instagram"></i> ${lead.instagram_handle || ''}</a>
                        </div>
                        <div class="tags">
                             ${lead.pain_point ? `<span class="tag tag-purple">${lead.pain_point}</span>` : ''}
                        </div>
                        <p class="card-preview">${lead.notes || ''}</p>
                        <div class="card-footer">
                            <span class="time-badge"><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
                            <div class="avatar-group">
                                <div class="avatar-xs">GM</div>
                            </div>
                        </div>
                    </div>
                `;
                targetCol.insertAdjacentHTML('beforeend', cardHTML);
            }
        });

        // Update counts (Leads Page)
        if (webContainer) {
            const count = leads.filter(l => l.source === 'checkout_button' || l.source === 'landing_page').length;
            const cntEl = document.getElementById('count-web-leads');
            if (cntEl) cntEl.innerText = count;
        }

        // 4. Update Dashboard (If present)
        const dashboardStats = document.getElementById('stat-abandoned');
        if (dashboardStats) {
            // Stats
            const abandonedCount = leads.filter(l => l.source === 'checkout_button' || l.source === 'landing_page').length;
            const newDMCount = leads.filter(l => l.status === 'new' && l.source !== 'checkout_button').length;

            document.getElementById('stat-abandoned').innerText = abandonedCount;
            document.getElementById('stat-new-dms').innerText = newDMCount;

            // Recent Table
            const listBody = document.getElementById('list-recent-leads');
            if (listBody && leads.length > 0) {
                listBody.innerHTML = '';
                // Show top 5
                leads.slice(0, 5).forEach(lead => {
                    const isWeb = lead.source === 'checkout_button' || lead.source === 'landing_page';
                    const icon = isWeb ? '<i class="fa-solid fa-globe"></i>' : '<i class="fa-brands fa-instagram"></i>';
                    const sourceText = isWeb ? 'Website' : 'Instagram';
                    const name = lead.name || 'Visitor';
                    const contact = isWeb ? lead.email : `<a href="https://instagram.com/${lead.instagram_handle?.replace('@', '')}" target="_blank">${lead.instagram_handle}</a>`;
                    const statusBadge = isWeb ? '<span class="status-badge new">Abandoned</span>' : `<span class="status-badge ${lead.status}">${lead.status}</span>`;

                    const row = `
                        <tr>
                            <td>
                                <div class="user-cell">
                                    <div class="avatar-sm" style="${isWeb ? 'background: #C4613A;' : ''}">${isWeb ? 'WEB' : 'IG'}</div>
                                    <div>
                                        <div class="font-medium">${name}</div>
                                        <div class="text-muted" style="font-size:0.75rem;">${contact}</div>
                                    </div>
                                </div>
                            </td>
                            <td>${icon} ${sourceText}</td>
                            <td>${statusBadge}</td>
                            <td>${new Date(lead.created_at).toLocaleDateString()}</td>
                            <td><button class="action-btn"><i class="fa-solid fa-ellipsis"></i></button></td>
                        </tr>
                    `;
                    listBody.insertAdjacentHTML('beforeend', row);
                });
            } else if (listBody) {
                listBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent activity.</td></tr>';
            }
        }
    }

    // Modal Handling
    const modal = document.getElementById('addLeadModal');
    const openBtn = document.getElementById('openNewLeadModal');
    const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const form = document.getElementById('addLeadForm');

    if (modal && openBtn) {
        openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
        closeBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.add('hidden')));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

        // Handle Add Lead
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const handle = form.querySelector('input[placeholder="@username"]').value;
                const name = form.querySelector('input[placeholder="First Last"]').value;
                const status = form.querySelector('select').value; // new, convo, qualifying, booked
                const painPoint = form.querySelectorAll('select')[1].value;
                const notes = form.querySelector('textarea').value;

                const newLead = {
                    handle,
                    name,
                    status,
                    painPoint,
                    notes
                };

                // Add to Supabase
                const savedLead = await addLead(newLead);

                if (savedLead) {
                    // Refresh Board
                    const allLeads = await fetchLeads();
                    renderLeads(allLeads);
                    form.reset();
                    modal.classList.add('hidden');
                }
            });
        }
    }
});

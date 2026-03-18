/**
 * Determines the user's role and loads the appropriate dashboard view.
 */
async function routeToDashboard() {
    // In a real app, get the user object from your auth state (e.g., localStorage).
    const user = getUserFromState(); // Mock function

    const dashboardContainer = document.getElementById('dashboard-container');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = ''; // Clear previous content

    switch (user.role) {
        case 'CITIZEN':
            dashboardContainer.innerHTML = await loadCitizenDashboard();
            break;
        case 'TRIAGE_OFFICER':
            dashboardContainer.innerHTML = await loadTriageDashboard();
            break;
        case 'ASSIGNED_OFFICER':
            dashboardContainer.innerHTML = await loadOfficerDashboard();
            break;
        case 'SYSTEM_ADMIN':
            dashboardContainer.innerHTML = await loadAdminDashboard();
            break;
        default:
            dashboardContainer.innerHTML = `<p class="error">Error: Unknown user role.</p>`;
            break;
    }
}

/**
 * Mock function to get user data.
 * In a real app, this would come from a JWT in localStorage.
 * Change the role to test different views.
 */
function getUserFromState() {
    // return { role: 'CITIZEN' };
    // return { role: 'TRIAGE_OFFICER' };
    // return { role: 'ASSIGNED_OFFICER' };
    return { role: 'SYSTEM_ADMIN' };
}

// --- Mock Dashboard Loaders ---
// These functions simulate fetching data and building HTML.
async function loadCitizenDashboard() {
    return `<h2>Citizen Reporting Portal</h2><p>Here you can start a new report.</p>`;
}

async function loadTriageDashboard() {
    // Real app: fetch('/api/reports/pending')
    return `<h2>Triage Queue</h2><p>List of pending reports for assignment.</p>`;
}

async function loadOfficerDashboard() {
    // Real app: fetch('/api/officer/my-cases')
    return `<h2>My Assigned Cases</h2><p>List of cases assigned to your Badge ID.</p>`;
}

async function loadAdminDashboard() {
    // Real app: render a table + filtering + pagination.
    let body = `<h2>System Logs</h2><p>Latest audit events.</p>`;
    try {
        const resp = await fetch('/api/admin/logs', { credentials: 'include' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const rows = (data.logs || []).slice(0, 50).map(l => {
            const when = new Date(l.created_at).toLocaleString();
            const details = l.details ? JSON.stringify(l.details) : '';
            return `<tr><td>${when}</td><td>${l.action}</td><td>${l.actor_user_id ?? ''}</td><td>${l.target_user_id ?? ''}</td><td><code>${details}</code></td></tr>`;
        }).join('');
        body += `<table border="1" cellpadding="6" cellspacing="0">
          <thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    } catch (e) {
        body += `<p class="error">Could not load audit logs. (${String(e.message || e)})</p>`;
    }
    return body;
}

// Initial load when the dashboard page is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard-container')) {
        routeToDashboard();
    }
});
const API = "/audit";
const AUDIT_PAGE_SIZE = 15;
let auditCurrentPage = 1;

function renderAuditRows(logs) {
    const tbody = document.getElementById("auditTableBody");

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No audit logs found.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${log.id}</td>
            <td>${log.user_id ?? "-"}</td>
            <td>${log.action}</td>
            <td>${log.module}</td>
            <td>${log.details ?? "-"}</td>
            <td>${log.created_at}</td>
        </tr>
    `).join("");
}

async function loadAudits(page = auditCurrentPage) {

    auditCurrentPage = page;
    const tbody = document.getElementById("auditTableBody");
    const prevBtn = document.getElementById("auditPrevPage");
    const nextBtn = document.getElementById("auditNextPage");
    const pageNum = document.getElementById("auditPageNum");

    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">Loading audit logs...</td></tr>`;

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API}?page=${page}&limit=${AUDIT_PAGE_SIZE}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok)
            throw new Error("Unable to fetch audit logs");

        const logs = await response.json();

        if (prevBtn) prevBtn.disabled = page === 1;
        if (nextBtn) nextBtn.disabled = logs.length < AUDIT_PAGE_SIZE;
        if (pageNum) pageNum.textContent = `Page ${page}`;

        renderAuditRows(logs);

    }

    catch (err) {

        console.error(err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-danger">Unable to load audit logs.</td></tr>`;

    }

}



async function searchAudit() {

    const id =
        document.getElementById("auditId").value;

    if (!id) {

        loadAudits(1);

        return;

    }

    const tbody = document.getElementById("auditTableBody");
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">Searching...</td></tr>`;

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(

            `${API}/${id}`,

            {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            }

        );

        if (!response.ok)
            throw new Error("Audit not found");

        const log = await response.json();

        document.getElementById("auditPrevPage").disabled = true;
        document.getElementById("auditNextPage").disabled = true;
        document.getElementById("auditPageNum").textContent = "Search result";

        renderAuditRows([log]);

    }

    catch {

        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No audit log found for that ID.</td></tr>`;

    }

}

function clearAuditSearch() {
    document.getElementById("auditId").value = "";
    loadAudits(1);
}

document.getElementById("auditPrevPage")?.addEventListener("click", () => {
    if (auditCurrentPage > 1) loadAudits(auditCurrentPage - 1);
});
document.getElementById("auditNextPage")?.addEventListener("click", () => {
    loadAudits(auditCurrentPage + 1);
});

loadAudits();

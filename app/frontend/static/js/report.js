// =======================================
// Reports Dashboard
// =======================================

let publicationChart = null;
let institutionChart = null;
let statusChart = null;

// =======================================
// Load Dashboard Data
// =======================================

async function loadDashboard() {

    try {

        const token = localStorage.getItem("access_token");

const response = await fetch("/reports/dashboard", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});

        if (!response.ok) {

            throw new Error("Unable to load dashboard");

        }

        const data = await response.json();

        // ================= Summary Cards =================
        // Graceful fallback ("—") instead of letting a missing summary
        // field either show a blank/"undefined" card or throw and pop an
        // error toast -- optional/missing values should never interrupt
        // the user.

        const setReportStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value ?? "—";
        };

        setReportStat("researchersCount", data.summary?.researchers);
        setReportStat("publicationsCount", data.summary?.publications);
        setReportStat("projectsCount", data.summary?.projects);
        setReportStat("collaborationsCount", data.summary?.collaborations);

        // ================= Charts =================

        createPublicationChart(data.publication_year);

        createInstitutionChart(data.institution);

        createStatusChart(data.publication_status);

        // ================= New Analytics Charts =================

        loadDepartmentChart();

        loadCollabYearChart();

        loadParticipationChart();

        // ================= Table =================

        loadInstitutionTable(data.top_institutions);

    }

    catch (error) {

        console.error(error);

        window.showToast("Error", "Unable to load dashboard.", "error");

    }

}

// =======================================
// Publications Chart
// =======================================

function createPublicationChart(data) {

    const ctx = document
        .getElementById("publicationYearChart")
        .getContext("2d");

    if (publicationChart) publicationChart.destroy();

    publicationChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: data.labels,

            datasets: [{

                label: "Publications",

                data: data.values,

                backgroundColor: "#0d6efd",

                borderRadius: 8,

                maxBarThickness: 25

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            layout: {

                padding: 10

            },

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}

// =======================================
// Institution Chart
// =======================================

function createInstitutionChart(data) {

    const ctx = document
        .getElementById("institutionChart")
        .getContext("2d");

    if (institutionChart) institutionChart.destroy();

    institutionChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: data.labels,

            datasets: [{

                label: "Researchers",

                data: data.values,

                backgroundColor: "#198754",

                borderRadius: 8,

                maxBarThickness: 25

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            layout: {

                padding: 10

            },

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}

// =======================================
// Status Chart
// =======================================

function createStatusChart(data) {

    const ctx = document
        .getElementById("statusChart")
        .getContext("2d");

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: data.labels,

            datasets: [{

                label: "Status",

                data: data.values,

                backgroundColor: "#ffc107",

                borderRadius: 8,

                maxBarThickness: 20

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            layout: {

                padding: 10

            },

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}

// =======================================
// Additional Analytics Charts (new read-only endpoints)
// =======================================

let departmentChart = null;
let collabYearChart = null;
let participationChart = null;

async function fetchAnalytics(path) {
    const token = localStorage.getItem("access_token");
    const response = await fetch(path, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Unable to load analytics");
    return response.json();
}

async function loadDepartmentChart() {
    try {
        const data = await fetchAnalytics("/analytics/researchers-by-department");
        const canvas = document.getElementById("departmentChart");
        if (!canvas) return;
        if (departmentChart) departmentChart.destroy();

        departmentChart = new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Researchers",
                    data: data.data,
                    backgroundColor: "#6f42c1",
                    borderRadius: 8,
                    maxBarThickness: 25
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 10 },
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadCollabYearChart() {
    try {
        const data = await fetchAnalytics("/analytics/collaborations-by-year");
        const canvas = document.getElementById("collabYearChart");
        if (!canvas) return;
        if (collabYearChart) collabYearChart.destroy();

        collabYearChart = new Chart(canvas.getContext("2d"), {
            type: "line",
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Collaborations",
                    data: data.data,
                    borderColor: "#0f766e",
                    backgroundColor: "rgba(15, 118, 110, 0.15)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 10 },
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadParticipationChart() {
    try {
        const data = await fetchAnalytics("/analytics/conference-participation");
        const canvas = document.getElementById("participationChart");
        if (!canvas) return;
        if (participationChart) participationChart.destroy();

        participationChart = new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Participants",
                    data: data.data,
                    backgroundColor: "#fd7e14",
                    borderRadius: 8,
                    maxBarThickness: 25
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                layout: { padding: 10 },
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// =======================================
// Institution Table
// =======================================

function loadInstitutionTable(data) {

    const table = document.getElementById("institutionTable");

    if (!data || data.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">No institution data available.</td></tr>`;
        return;
    }

    table.innerHTML = "";

    data.forEach((item, index) => {

        table.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${item.institution}</td>

                <td>

                    <span class="badge bg-primary">

                        ${item.researchers}

                    </span>

                </td>

                <td>

                    <span class="badge bg-light text-dark border">

                        ${item.publications ?? 0}

                    </span>

                </td>

                <td>

                    <span class="badge bg-light text-dark border">

                        ${item.collaborations ?? 0}

                    </span>

                </td>

            </tr>

        `;

    });

}

// =======================================
// Export PDF
// =======================================

document.getElementById("exportPDF").addEventListener("click", async () => {

    try {

        const { jsPDF } = window.jspdf;

        const report = document.querySelector(".workspace");

        const canvas = await html2canvas(report);

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF();

        pdf.addImage(imgData, "PNG", 10, 10, 180, 250);

        pdf.save("Research_Report.pdf");

    }

    catch (err) {

        console.error("PDF export error:", err);

        window.showToast("Error", "Unable to export the PDF report.", "error");

    }

});


// =======================================
// Downloadable Reports (CSV)
// =======================================

document.getElementById("dlResearchers")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.downloadFile("/reports/download/researchers", "scna_researchers.csv", e.currentTarget);
});
document.getElementById("dlPublications")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.downloadFile("/reports/download/publications", "scna_publications.csv", e.currentTarget);
});
document.getElementById("dlCollaborations")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.downloadFile("/reports/download/collaborations", "scna_collaborations.csv", e.currentTarget);
});
document.getElementById("dlInstitutions")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.downloadFile("/reports/download/institutions", "scna_institutions.csv", e.currentTarget);
});

// =======================================
// Refresh Dashboard
// =======================================

document
    .getElementById("refreshDashboard")
    .addEventListener("click", loadDashboard);

// =======================================
// Initial Load
// =======================================

loadDashboard();

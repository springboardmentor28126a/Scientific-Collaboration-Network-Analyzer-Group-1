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
        const response = await fetch("/reports/dashboard");

        if (!response.ok) {
            throw new Error("Unable to load dashboard");
        }

        const data = await response.json();

        // ================= Summary Cards =================

        document.getElementById("researchersCount").textContent =
            data.summary.researchers;

        document.getElementById("publicationsCount").textContent =
            data.summary.publications;

        document.getElementById("projectsCount").textContent =
            data.summary.projects;

        document.getElementById("collaborationsCount").textContent =
            data.summary.collaborations;

        // ================= Charts =================

        createPublicationChart(data.publication_year);

        createInstitutionChart(data.institution);

        createStatusChart(data.publication_status);

        // ================= Table =================

        loadInstitutionTable(data.top_institutions);

    } catch (error) {

        console.error(error);

        alert("Unable to load dashboard.");

    }
}

// =======================================
// Publications by Year
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

                maxBarThickness: 40

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

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
// Researchers by Institution
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

                maxBarThickness: 40

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

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
// Publications by Status
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

                maxBarThickness: 50

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

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
// Top Institutions Table
// =======================================

function loadInstitutionTable(data) {

    const table = document.getElementById("institutionTable");

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

            </tr>
        `;

    });

}

// =======================================
// Refresh Button
// =======================================

document
    .getElementById("refreshDashboard")
    .addEventListener("click", loadDashboard);

// =======================================
// Initial Load
// =======================================

loadDashboard();
document.getElementById("refreshDashboard")
    .addEventListener("click", loadDashboard);
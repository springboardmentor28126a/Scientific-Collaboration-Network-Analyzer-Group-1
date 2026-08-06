// ===========================================
// Collaboration Dashboard
// ===========================================

const dashboardURL = "/collaborations/dashboard";
const recentURL = "/collaborations/recent";

let collaborationChart = null;


// ===========================================
// Dashboard Summary
// ===========================================

async function loadDashboard() {

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(dashboardURL, {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        if (!response.ok) {

            throw new Error(await response.text());

        }

        const data = await response.json();

        document.getElementById("totalCollaborations").textContent =
            data.summary.total_collaborations;

        document.getElementById("activeResearchers").textContent =
            data.summary.connected_researchers;

        document.getElementById("collaborativePublications").textContent =
            Math.round(
                data.summary.connected_researchers *
                data.summary.average_authors
            );

    }

    catch (error) {

        console.error("Dashboard Error:", error);

    }

}



let lastCollaborationData = [];

function escapeHtmlCollab(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function renderCollaborationCards(data) {
    const container = document.getElementById("recentCollaborationList");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No collaboration records found.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="col-md-4 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtmlCollab(item.publication)}</h5>
                    <p class="card-text small text-muted mb-2">${escapeHtmlCollab(item.researcher)}</p>
                    <div class="d-flex gap-2">
                        <span class="badge bg-light text-dark border">Author Order: ${item.author_order ?? "-"}</span>
                        <span class="badge bg-secondary">${escapeHtmlCollab(item.contribution ?? "Contribution N/A")}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

function applyCollaborationSearchSort() {
    const query = document.getElementById("collabSearch")?.value.trim().toLowerCase() ?? "";
    const sortBy = document.getElementById("collabSortBy")?.value || "publication";

    let filtered = lastCollaborationData;
    if (query) {
        filtered = filtered.filter(item =>
            (item.publication ?? "").toLowerCase().includes(query) ||
            (item.researcher ?? "").toLowerCase().includes(query)
        );
    }

    filtered = [...filtered].sort((a, b) =>
        String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""))
    );

    renderCollaborationCards(filtered);
}

// ===========================================
// Recent Collaborations
// ===========================================

async function loadRecentCollaborations() {

    try {

        const token = localStorage.getItem("access_token");

        const container = document.getElementById("recentCollaborationList");
        if (container) {
            container.innerHTML = Array.from({ length: 6 }, () => `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 placeholder-glow">
                        <div class="card-body">
                            <h5 class="card-title placeholder col-7"></h5>
                            <p class="card-text placeholder col-9"></p>
                        </div>
                    </div>
                </div>
            `).join("");
        }

        const response = await fetch(recentURL, {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        if (!response.ok) {

            throw new Error(await response.text());

        }

        const data = await response.json();

        lastCollaborationData = data;
        applyCollaborationSearchSort();
        loadChart(data);
        loadResearcherChart(data);

    }

    catch (error) {

        console.error("Recent Collaborations Error:", error);
        window.showToast?.("Error", "Unable to load recent collaborations.", "error");

    }

}
// ===========================================
// Collaboration Statistics Chart
// ===========================================

function loadChart(data) {

    const contributionCount = {};

    data.forEach(item => {

        const key = item.contribution || "Unknown";

        contributionCount[key] =
            (contributionCount[key] || 0) + 1;

    });

    const labels = Object.keys(contributionCount);
    const values = Object.values(contributionCount);

    const canvas = document.getElementById("collaborationChart");

    if (!canvas) return;

    if (collaborationChart) {

        collaborationChart.destroy();

    }

    const ctx = canvas.getContext("2d");

    collaborationChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [

                {

                    label: "Collaborations",

                    data: values,

                    backgroundColor: "#4A90E2",

                    borderColor: "#2E73D8",

                    borderWidth: 1,

                    borderRadius: 8,

                    barPercentage: 0.35,

                    categoryPercentage: 0.45,

                    maxBarThickness: 30

                }

            ]

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

                x: {

                    grid: {

                        display: false

                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0,

                        stepSize: 1

                    }

                }

            }

        }

    });

}



// ===========================================
// Refresh Dashboard
// ===========================================

async function refreshDashboard() {

    await loadDashboard();

    await loadRecentCollaborations();

}
let researcherChart = null;

function loadResearcherChart(data) {

    const researcherCount = {};

    data.forEach(item => {

        const key = item.researcher || "Unknown";

        researcherCount[key] =
            (researcherCount[key] || 0) + 1;

    });

    const sorted = Object.entries(researcherCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const labels = sorted.map(([name]) => name);
    const values = sorted.map(([, count]) => count);

    const canvas = document.getElementById("researcherChart");

    if (!canvas) return;

    if (researcherChart) {
        researcherChart.destroy();
    }

    researcherChart = new Chart(canvas.getContext("2d"), {

        type: "bar",

        data: {
            labels,
            datasets: [
                {
                    label: "Collaborations",
                    data: values,
                    backgroundColor: "#0f766e",
                    borderRadius: 8,
                    maxBarThickness: 22
                }
            ]
        },

        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
        }

    });

}

// ===========================================
// Add Collaboration
// ===========================================

const authorForm = document.getElementById("authorForm");

if (authorForm) {

    authorForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const submitBtn = authorForm.querySelector("button[type='submit']");
        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;

        const formData = new FormData(authorForm);

        const payload = {

            publication_id: Number(formData.get("publication_id")),

            researcher_id: Number(formData.get("researcher_id")),

            author_order: formData.get("author_order")
                ? Number(formData.get("author_order"))
                : null,

            contribution: formData.get("contribution") || null

        };

        try {

            const token = localStorage.getItem("access_token");

            const response = await fetch(
                "/collaborations/publication-authors",
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify(payload)

                }

            );

            if (!response.ok) {

                throw new Error(await response.text());

            }

            authorForm.reset();

            bootstrap.Modal.getInstance(
                document.getElementById("addCollaborationModal")
            ).hide();

            await refreshDashboard();

            window.showToast("Success", "Collaboration added successfully.", "success");

        }

        catch (error) {

            console.error(error);

            window.showToast("Error", error.message, "error");

        }

        finally {

            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;

        }

    });

}



// ===========================================
// Initial Page Load
// ===========================================

document.addEventListener("DOMContentLoaded", () => {

    refreshDashboard();

    document.getElementById("collabSearch")?.addEventListener("input", () => applyCollaborationSearchSort());
    document.getElementById("collabSortBy")?.addEventListener("change", () => applyCollaborationSearchSort());

});
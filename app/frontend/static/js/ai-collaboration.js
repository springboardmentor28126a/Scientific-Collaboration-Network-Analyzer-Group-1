// ===========================================
// AI Collaboration Recommender
// ===========================================

const AI_COLLAB_RESEARCHERS_URL = "/researchers/search/query?limit=500&sort_by=full_name&order=asc";
const AI_COLLAB_RECOMMEND_URL = (researcherId, limit) =>
    `/api/ai/collaboration/${researcherId}?limit=${limit}`;
const AI_COLLAB_PROFILE_STATS_URL = (researcherId) =>
    `/researchers/${researcherId}/profile-stats`;

let aiCollabLastResults = [];

// ===========================================
// Small local fetch helper (this page is a plain script, not a module,
// so it does not share app.js's api() helper -- same pattern as
// collaboration.js).
// ===========================================

async function aiCollabGet(url) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        let message = "Request failed";
        try {
            const error = await response.json();
            message = error.detail || message;
        } catch {
            message = response.statusText;
        }
        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    return response.json();
}

function aiCollabEscapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

// ===========================================
// Researcher selector
// ===========================================

async function loadAiCollabResearchers() {
    const select = document.getElementById("aiResearcherSelect");
    const findBtn = document.getElementById("findCollaboratorsBtn");
    if (!select) return;

    try {
        const researchers = await aiCollabGet(AI_COLLAB_RESEARCHERS_URL);

        if (!researchers.length) {
            select.innerHTML = `<option value="">No researchers found</option>`;
            return;
        }

        select.innerHTML = `<option value="">Choose a researcher...</option>` +
            researchers.map(r => `
                <option value="${r.id}">
                    ${aiCollabEscapeHtml(r.full_name)}${r.institution ? " — " + aiCollabEscapeHtml(r.institution) : ""}
                </option>
            `).join("");
    } catch (error) {
        select.innerHTML = `<option value="">Unable to load researchers</option>`;
        window.showToast?.("Error", "Unable to load researchers.", "error");
    }
}

// ===========================================
// Results rendering
// ===========================================

function aiCollabScoreColorClass(score) {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-secondary";
}

function aiCollabBadgeList(items, badgeClass) {
    if (!items || !items.length) {
        return `<span class="text-muted small">None on record</span>`;
    }
    return items
        .map(item => `<span class="badge ${badgeClass} me-1 mb-1">${aiCollabEscapeHtml(item)}</span>`)
        .join("");
}

function renderAiCollabResults(payload) {
    const panel = document.getElementById("aiResultsPanel");
    const heading = document.getElementById("aiResultsHeading");
    const subheading = document.getElementById("aiResultsSubheading");
    const container = document.getElementById("aiCollaborationResults");

    if (!panel || !container) return;

    panel.style.display = "block";
    heading.textContent = `Potential Collaborators for ${payload.researcher.full_name}`;
    subheading.textContent = payload.researcher.institution
        ? `Based on profile, publication and network data relative to ${payload.researcher.institution}.`
        : "Based on profile, publication and network data.";

    aiCollabLastResults = payload.recommendations;

    if (!payload.recommendations.length) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-people"></i>
                    <p>No other researchers are available for comparison yet.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = payload.recommendations.map(rec => `
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-body d-flex flex-column">

                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="card-title mb-0">${aiCollabEscapeHtml(rec.name)}</h5>
                            <p class="card-text small text-muted mb-0">
                                ${aiCollabEscapeHtml(rec.institution || "Institution not on record")}
                            </p>
                        </div>
                        <span class="badge ${aiCollabScoreColorClass(rec.match_score)} fs-6">
                            ${rec.match_score}%
                        </span>
                    </div>

                    <div class="progress mb-3" style="height:8px;">
                        <div class="progress-bar" role="progressbar"
                             style="width:${rec.match_score}%;"
                             aria-valuenow="${rec.match_score}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>

                    <div class="mb-2">
                        <p class="small fw-semibold mb-1">Shared Research Interests</p>
                        <div>${aiCollabBadgeList(rec.shared_interests, "bg-light text-dark border")}</div>
                    </div>

                    <div class="mb-3">
                        <p class="small fw-semibold mb-1">Complementary Skills</p>
                        <div>${aiCollabBadgeList(rec.complementary_skills, "bg-secondary")}</div>
                    </div>

                    <div class="mb-3 flex-grow-1">
                        <p class="small fw-semibold mb-1">
                            Why this match?
                            ${rec.explanation_source === "rule_based"
                                ? `<span class="badge bg-light text-muted border ms-1" title="Generated with a rule-based fallback because the AI explanation service was unavailable">Rule-based</span>`
                                : `<span class="badge bg-light text-muted border ms-1">AI-generated</span>`}
                        </p>
                        <p class="small text-muted mb-0">${aiCollabEscapeHtml(rec.reason)}</p>
                    </div>

                    <button type="button" class="btn btn-sm btn-outline-dark mt-auto"
                            onclick="viewAiCollabProfile(${rec.researcher_id})">
                        <i class="bi bi-person-lines-fill me-1"></i>View Profile
                    </button>

                </div>
            </div>
        </div>
    `).join("");
}

function renderAiCollabLoading() {
    const panel = document.getElementById("aiResultsPanel");
    const heading = document.getElementById("aiResultsHeading");
    const subheading = document.getElementById("aiResultsSubheading");
    const container = document.getElementById("aiCollaborationResults");
    if (!panel || !container) return;

    panel.style.display = "block";
    heading.textContent = "Finding potential collaborators...";
    subheading.textContent = "Comparing research interests, skills, publications and network data.";
    container.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            Analyzing researcher compatibility...
        </div>
    `;
}

function renderAiCollabError(message) {
    const container = document.getElementById("aiCollaborationResults");
    if (!container) return;
    container.innerHTML = `
        <div class="col-12">
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <p>${aiCollabEscapeHtml(message || "Unable to load collaboration recommendations.")}</p>
            </div>
        </div>
    `;
}

// ===========================================
// View Profile -- reuses the shared details modal from nav-auth.js
// ===========================================

window.viewAiCollabProfile = async function (researcherId) {
    window.showDetailsLoading?.("Researcher Profile");
    try {
        const stats = await aiCollabGet(AI_COLLAB_PROFILE_STATS_URL(researcherId));
        const recentPubs = stats.recent_publications ?? [];

        window.showDetailsModal(
            stats.full_name,
            [
                ["Institution", stats.institution],
                ["Department", stats.department],
                ["Profile Completion", stats.completion_percentage != null ? `${stats.completion_percentage}%` : null],
                ["Publications", stats.publication_count ?? 0],
                ["Citations", stats.citation_count ?? 0],
                ["Active Projects", stats.active_project_count ?? 0],
                [
                    "Recent Publications",
                    recentPubs.map((p) => `${p.title} (${p.publication_year ?? "—"}, ${p.status})`).join("; ") || null,
                ],
            ],
            "Researcher Profile"
        );
    } catch (error) {
        if (error.status === 404) {
            window.showDetailsNotFound?.("researcher");
            return;
        }
        window.showDetailsError?.(error.message);
    }
};

// ===========================================
// Find Collaborators action
// ===========================================

async function findCollaborators() {
    const select = document.getElementById("aiResearcherSelect");
    const limitSelect = document.getElementById("aiResultLimit");
    const researcherId = select?.value;

    if (!researcherId) return;

    const limit = limitSelect?.value || 5;

    renderAiCollabLoading();

    try {
        const payload = await aiCollabGet(AI_COLLAB_RECOMMEND_URL(researcherId, limit));
        renderAiCollabResults(payload);
    } catch (error) {
        if (error.status === 404) {
            renderAiCollabError("That researcher could not be found.");
            return;
        }
        renderAiCollabError(error.message);
        window.showToast?.("Error", "Unable to load collaboration recommendations.", "error");
    }
}

// ===========================================
// Init
// ===========================================

document.getElementById("aiResearcherSelect")?.addEventListener("change", (event) => {
    const findBtn = document.getElementById("findCollaboratorsBtn");
    if (findBtn) findBtn.disabled = !event.target.value;
});

document.getElementById("findCollaboratorsBtn")?.addEventListener("click", findCollaborators);

loadAiCollabResearchers();

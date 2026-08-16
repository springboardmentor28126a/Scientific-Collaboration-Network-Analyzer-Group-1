// =========================================================================
// SCNA - Shared app.js
// Powers: Home dashboard teaser, Institutions, Researchers, Publications,
// Conferences, Citations.
// Navbar auth state is handled separately by nav-auth.js (see layout.html).
// =========================================================================

// showToast(title, message, type) is provided globally by nav-auth.js

function authHeaders(extra = {}) {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
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

  if (response.status === 204) return null;
  return response.json();
}

// multipart/form-data request (used for Publications, which accept a PDF upload)
async function apiForm(path, method, formData) {
  const response = await fetch(path, {
    method,
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }

  return response.json();
}

function formDataToJson(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const numericFields = [
    "user_id", "researcher_id", "publication_id", "publication_year",
    "author_order", "cited_publication_id", "reference_order",
  ];

  for (const [key, value] of Object.entries(data)) {
    if (value === "") {
      data[key] = null;
    } else if (numericFields.includes(key)) {
      data[key] = Number(value);
    }
  }

  return data;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function skeletonCards(count = 6) {
  return Array.from({ length: count }, () => `
    <div class="col-md-4 mb-3">
      <div class="card h-100 placeholder-glow">
        <div class="card-body">
          <h5 class="card-title placeholder col-7"></h5>
          <p class="card-text placeholder col-9"></p>
          <p class="card-text placeholder col-5"></p>
          <span class="placeholder col-3 me-1"></span>
          <span class="placeholder col-3"></span>
        </div>
      </div>
    </div>
  `).join("");
}

function skeletonRows(count = 5, colspan = 7) {
  return Array.from({ length: count }, () => `
    <tr class="placeholder-glow">
      <td colspan="${colspan}"><span class="placeholder col-12"></span></td>
    </tr>
  `).join("");
}

function emptyStateCard(message, addButtonHtml = "") {
  return `
    <div class="col-12">
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>${escapeHtml(message)}</p>
        ${addButtonHtml}
      </div>
    </div>
  `;
}

// downloadFile(url, filename, triggerEl) is provided globally by nav-auth.js

function bindForm(formId, endpoint, successMessage, afterSave = loadAll) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify(formDataToJson(form)),
      });
      form.reset();
      showToast("Saved", successMessage, "success");
      await afterSave();
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  });
}

// =========================================================================
// Home dashboard teaser (home.html) — safe no-ops on other pages
// =========================================================================

// Sets textContent on an element only if it actually exists. Root cause of
// the "Cannot set properties of null (setting 'textContent')" dashboard
// error: loadDashboard() used to write to each #metric* element with a
// bare document.getElementById(id).textContent = ... call. That's safe only
// as long as every single element is guaranteed present; once Dashboard
// cards became role-gated (see nav-auth.js) and the page can legitimately
// render with pieces of the layout hidden/removed for a given user, or the
// /dashboard/admin payload is ever missing a key on a slower/partial
// response, the very next unguarded assignment threw and aborted the rest
// of the dashboard render. Every write now goes through this helper instead
// of failing the whole page for one missing/renamed element.
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// -------------------------------------------------------------------------
// Quick Insights / Recent Activity / Latest-X teaser lists (Dashboard).
// Every list below reuses data already fetched by other parts of the app
// (Publications metrics, Collaboration dashboard/recent, Conferences
// filter) -- no new backend endpoints were needed for this. Each section
// is independent and wrapped in its own try/catch: if one section's data
// is unavailable, it degrades to a "No data available" placeholder rather
// than an error popup, and the rest of the dashboard keeps working.
// -------------------------------------------------------------------------

async function loadQuickInsights() {
  const container = document.getElementById("quickInsights");
  if (!container) return;

  try {
    const [pubMetrics, collabDashboard] = await Promise.all([
      api("/publications/metrics/summary"),
      api("/collaborations/dashboard"),
    ]);

    const byStatus = pubMetrics.by_status ?? {};
    const topStatus = Object.entries(byStatus).sort((a, b) => b[1] - a[1])[0];
    const summary = collabDashboard.summary ?? {};

    const chips = [
      ["Total Citations", pubMetrics.total_citations ?? 0],
      ["Avg. Co-Authors / Paper", summary.average_authors ?? 0],
      ["Connected Researchers", summary.connected_researchers ?? 0],
      ["Top Publication Status", topStatus ? `${topStatus[0]} (${topStatus[1]})` : "No Data"],
    ];

    container.innerHTML = chips.map(([label, value]) => `
      <div class="insight-chip">
        <span class="label">${escapeHtml(label)}</span>
        <span class="value">${escapeHtml(value)}</span>
      </div>
    `).join("");
  } catch (error) {
    container.innerHTML = `<div class="text-center py-3 text-muted w-100">No Data</div>`;
  }
}

async function loadDashboardTeasers() {
  const activityEl = document.getElementById("recentActivityList");
  const pubsEl = document.getElementById("latestPublicationsList");
  const collabEl = document.getElementById("latestCollaborationsList");
  const confEl = document.getElementById("recentConferencesList");
  if (!activityEl && !pubsEl && !collabEl && !confEl) return;

  const renderEmpty = (el, message) => {
    if (el) el.innerHTML = `<li class="text-center py-3 text-muted">${escapeHtml(message)}</li>`;
  };

  // Each source is fetched independently (Promise.allSettled) so one slow
  // or unavailable module doesn't blank out the others.
  const [pubsResult, collabResult, confResult] = await Promise.allSettled([
    api("/publications/metrics/summary"),
    fetch(`/collaborations/recent?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed")))),
    api("/conferences/search/filter?sort_by=id&order=desc&page=1&limit=5"),
  ]);

  const recentPubs = pubsResult.status === "fulfilled" ? (pubsResult.value.recent_publications ?? []) : [];
  const recentCollabs = collabResult.status === "fulfilled" ? collabResult.value ?? [] : [];
  const recentConfs = confResult.status === "fulfilled" ? confResult.value ?? [] : [];

  // -------- Latest Publications --------
  if (pubsEl) {
    pubsEl.innerHTML = recentPubs.length
      ? recentPubs.slice(0, 5).map((p) => `
          <li>
            <div class="activity-icon type-publication"><i class="bi bi-journal-text"></i></div>
            <div>
              <div class="mini-title">${escapeHtml(p.title)}</div>
              <div class="mini-meta">${escapeHtml(p.authors ?? "Not Available")} &middot; ${escapeHtml(p.publication_year ?? "—")} &middot; ${escapeHtml(p.status ?? "—")}</div>
            </div>
          </li>
        `).join("")
      : "";
    if (!recentPubs.length) renderEmpty(pubsEl, "No Data");
  }

  // -------- Latest Collaborations --------
  if (collabEl) {
    collabEl.innerHTML = recentCollabs.length
      ? recentCollabs.slice(0, 5).map((c) => `
          <li>
            <div class="activity-icon type-collaboration"><i class="bi bi-diagram-3"></i></div>
            <div>
              <div class="mini-title">${escapeHtml(c.publication ?? "Not Available")}</div>
              <div class="mini-meta">${escapeHtml(c.researcher ?? "Not Available")} &middot; ${escapeHtml(c.contribution ?? "—")}</div>
            </div>
          </li>
        `).join("")
      : "";
    if (!recentCollabs.length) renderEmpty(collabEl, "No Data");
  }

  // -------- Recent Conference Additions --------
  if (confEl) {
    confEl.innerHTML = recentConfs.length
      ? recentConfs.slice(0, 5).map((c) => `
          <li>
            <div class="activity-icon type-conference"><i class="bi bi-calendar-event"></i></div>
            <div>
              <div class="mini-title">${escapeHtml(c.name)}</div>
              <div class="mini-meta">${escapeHtml(c.location ?? "Not Available")} &middot; ${escapeHtml(c.start_date ?? "—")}</div>
            </div>
          </li>
        `).join("")
      : "";
    if (!recentConfs.length) renderEmpty(confEl, "No Data");
  }

  // -------- Recent Activity (merged feed) --------
  if (activityEl) {
    const items = [
      ...recentPubs.slice(0, 3).map((p) => ({
        icon: "bi-journal-text",
        type: "type-publication",
        title: `New publication: ${p.title}`,
        meta: `${p.publication_type ?? "Publication"} &middot; ${p.status ?? "—"}`,
      })),
      ...recentCollabs.slice(0, 3).map((c) => ({
        icon: "bi-diagram-3",
        type: "type-collaboration",
        title: `New collaboration on: ${c.publication ?? "Not Available"}`,
        meta: `${c.researcher ?? "Not Available"} &middot; ${c.contribution ?? "—"}`,
      })),
      ...recentConfs.slice(0, 3).map((c) => ({
        icon: "bi-calendar-event",
        type: "type-conference",
        title: `New conference added: ${c.name}`,
        meta: `${c.location ?? "Not Available"}`,
      })),
    ];

    activityEl.innerHTML = items.length
      ? items.map((item) => `
          <li>
            <div class="activity-icon ${item.type}"><i class="bi ${item.icon}"></i></div>
            <div>
              <div class="mini-title">${escapeHtml(item.title)}</div>
              <div class="mini-meta">${item.meta}</div>
            </div>
          </li>
        `).join("")
      : "";
    if (!items.length) renderEmpty(activityEl, "No recent activity to show yet.");
  }
}

async function loadDashboard() {
  if (!document.getElementById("metricUsers")) return;

  const data = await api("/dashboard/admin");
  setText("metricUsers", data.users ?? 0);
  setText("metricResearchers", data.researchers ?? 0);
  setText("metricInstitutions", data.institutions ?? 0);
  setText("metricPublications", data.publications ?? 0);
  setText("metricProjects", data.projects ?? 0);
  setText("metricCollaborations", data.collaborations ?? 0);
  setText("metricConferences", data.conferences ?? 0);
  setText("metricCitations", data.citations ?? 0);

  // Quick Insights / Recent Activity / Latest-X are additional, optional
  // dashboard content -- they run alongside the core metrics above but
  // never block or fail the core dashboard render if they error out.
  loadQuickInsights().catch(() => {});
  loadDashboardTeasers().catch(() => {});
}

async function loadAll() {
  await loadDashboard();
}

// =========================================================================
// Institutions
// =========================================================================

const INST_PAGE_SIZE = 6;
let instCurrentPage = 1;
let editingInstitutionId = null;

function renderInstitutionCard(inst) {
  return `
    <div class="col-md-4 mb-3">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(inst.name)}</h5>
          <p class="card-text mb-1"><span class="badge bg-secondary">${escapeHtml(inst.institution_type ?? "Institution")}</span></p>
          <p class="card-text text-muted small mb-3">
            ${escapeHtml(inst.city ?? "-")}, ${escapeHtml(inst.country ?? "-")}
          </p>
          <div class="mt-auto d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="window.viewInstitution(${inst.id})"><i class="bi bi-eye me-1"></i>View Details</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-requires="institutions:edit" onclick="window.editInstitution(${inst.id})">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-requires="institutions:delete" onclick="window.deleteInstitution(${inst.id})">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadInstitutions(page = instCurrentPage) {
  const container = document.getElementById("institutionList");
  if (!container) return;

  instCurrentPage = page;
  const prevBtn = document.getElementById("instPrevPage");
  const nextBtn = document.getElementById("instNextPage");
  const pageNum = document.getElementById("instPageNum");
  const query = document.getElementById("instSearch")?.value.trim() ?? "";
  const sortBy = document.getElementById("instSortBy")?.value || "name";
  const order = document.getElementById("instSortOrder")?.value || "asc";

  container.innerHTML = skeletonCards(INST_PAGE_SIZE);

  try {
    const params = new URLSearchParams({
      query, sort_by: sortBy, order, page: String(page), limit: String(INST_PAGE_SIZE),
    });
    const institutions = await api(`/institutions/search/query?${params.toString()}`);

    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = institutions.length < INST_PAGE_SIZE;
    if (pageNum) pageNum.textContent = `Page ${page}`;

    if (institutions.length === 0) {
      const addBtn = window.canDo("institutions", "create")
        ? `<button type="button" class="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#addInstitutionModal">Add Institution</button>`
        : "";
      container.innerHTML = emptyStateCard("No institutions found.", addBtn);
      return;
    }

    container.innerHTML = institutions.map(renderInstitutionCard).join("");
    window.applyPermissionGating?.(container);
  } catch (error) {
    container.innerHTML = `<div class="text-center py-4 text-danger">Unable to load institutions.</div>`;
    showToast("Error", error.message, "error");
  }
}

window.viewInstitution = async function (institutionId) {
  window.showDetailsLoading?.("Institution Details");
  try {
    const details = await api(`/institutions/${institutionId}/details`);

    const departments = details.departments ?? [];
    const researchers = details.researchers ?? [];

    window.showDetailsModal(
      details.name,
      [
        ["Type", details.institution_type],
        ["City", details.city],
        ["Country", details.country],
        ["Website", details.website],
        ["Contact Email", details.contact_email],
        ["Departments", departments],
        ["Researchers", researchers.map((r) => r.full_name).join(", ") || null],
        ["Total Publications", details.total_publications ?? 0],
        ["Active Projects", details.active_projects ?? 0],
        ["Collaborations", details.collaboration_count ?? 0],
        ["Total Researchers", details.total_researchers ?? 0],
      ],
      "Institution Profile"
    );
  } catch (error) {
    if (error.status === 404) {
      window.showDetailsNotFound?.("institution");
    } else {
      window.showDetailsError?.(error.message);
    }
  }
};

window.editInstitution = async function (institutionId) {
  try {
    const inst = await api(`/institutions/${institutionId}`);
    editingInstitutionId = inst.id;

    const form = document.getElementById("addInstitutionForm");
    form.querySelector("[name='name']").value = inst.name;
    form.querySelector("[name='institution_type']").value = inst.institution_type ?? "University";
    form.querySelector("[name='country']").value = inst.country ?? "";
    form.querySelector("[name='city']").value = inst.city ?? "";
    form.querySelector("[name='website']").value = inst.website ?? "";
    form.querySelector("[name='contact_email']").value = inst.contact_email ?? "";

    document.querySelector("#addInstitutionModal .modal-title").textContent = "Edit Institution";
    document.querySelector("#addInstitutionForm button[type='submit']").textContent = "Save Changes";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("addInstitutionModal")).show();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

window.deleteInstitution = async function (institutionId) {
  if (!confirm("Are you sure you want to delete this institution? This cannot be undone.")) return;

  try {
    await api(`/institutions/${institutionId}`, { method: "DELETE" });
    showToast("Success", "Institution deleted successfully.", "success");
    await loadInstitutions();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

function bindInstitutionForm() {
  const form = document.getElementById("addInstitutionForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formDataToJson(form);

    try {
      if (editingInstitutionId === null) {
        await api("/institutions/", { method: "POST", body: JSON.stringify(data) });
        showToast("Saved", "Institution added.", "success");
      } else {
        await api(`/institutions/${editingInstitutionId}`, { method: "PUT", body: JSON.stringify(data) });
        showToast("Saved", "Institution updated.", "success");
        editingInstitutionId = null;
        document.querySelector("#addInstitutionModal .modal-title").textContent = "Add New Institution";
        document.querySelector("#addInstitutionForm button[type='submit']").textContent = "Add Institution";
      }

      form.reset();
      bootstrap.Modal.getInstance(document.getElementById("addInstitutionModal"))?.hide();
      await loadInstitutions(instCurrentPage);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  });

  // Reset modal to "create" mode whenever it's dismissed without saving
  document.getElementById("addInstitutionModal")?.addEventListener("hidden.bs.modal", () => {
    editingInstitutionId = null;
    form.reset();
    document.querySelector("#addInstitutionModal .modal-title").textContent = "Add New Institution";
    document.querySelector("#addInstitutionForm button[type='submit']").textContent = "Add Institution";
  });
}

document.getElementById("instPrevPage")?.addEventListener("click", () => {
  if (instCurrentPage > 1) loadInstitutions(instCurrentPage - 1);
});
document.getElementById("instNextPage")?.addEventListener("click", () => {
  loadInstitutions(instCurrentPage + 1);
});
document.getElementById("instSearch")?.addEventListener("input", debounce(() => loadInstitutions(1)));
document.getElementById("instSortBy")?.addEventListener("change", () => loadInstitutions(1));
document.getElementById("instSortOrder")?.addEventListener("change", () => loadInstitutions(1));

// =========================================================================
// Researchers
// =========================================================================

const RESEARCHER_PAGE_SIZE = 6;
let researcherCurrentPage = 1;
let editingResearcherId = null;

function renderResearcherCard(r) {
  return `
    <div class="col-md-4 mb-3">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(r.full_name)}</h5>
          <p class="card-text mb-1"><span class="badge bg-secondary">${escapeHtml(r.department ?? "-")}</span></p>
          <p class="card-text text-muted small mb-3">${escapeHtml(r.institution ?? "-")}</p>
          <p class="card-text small mb-3"><strong>Interests:</strong> ${escapeHtml(r.research_interest ?? "-")}</p>
          <div class="mt-auto d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="window.viewResearcher(${r.id})"><i class="bi bi-eye me-1"></i>View Details</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-requires="researchers:edit" onclick="window.editResearcher(${r.id})">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-requires="researchers:delete" onclick="window.deleteResearcher(${r.id})">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadResearchers(page = researcherCurrentPage) {
  const container = document.getElementById("researcherList");
  if (!container) return;

  researcherCurrentPage = page;
  const prevBtn = document.getElementById("researcherPrevPage");
  const nextBtn = document.getElementById("researcherNextPage");
  const pageNum = document.getElementById("researcherPageNum");
  const query = document.getElementById("researcherSearch")?.value.trim() ?? "";
  const sortBy = document.getElementById("researcherSortBy")?.value || "full_name";
  const order = document.getElementById("researcherSortOrder")?.value || "asc";

  container.innerHTML = skeletonCards(RESEARCHER_PAGE_SIZE);

  try {
    const params = new URLSearchParams({
      query, sort_by: sortBy, order, page: String(page), limit: String(RESEARCHER_PAGE_SIZE),
    });
    const researchers = await api(`/researchers/search/query?${params.toString()}`);

    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = researchers.length < RESEARCHER_PAGE_SIZE;
    if (pageNum) pageNum.textContent = `Page ${page}`;

    if (researchers.length === 0) {
      const addBtn = window.canDo("researchers", "create")
        ? `<button type="button" class="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#addResearcherModal">Add Researcher</button>`
        : "";
      container.innerHTML = emptyStateCard("No researchers found.", addBtn);
      return;
    }

    container.innerHTML = researchers.map(renderResearcherCard).join("");
    window.applyPermissionGating?.(container);
  } catch (error) {
    container.innerHTML = `<div class="text-center py-4 text-danger">Unable to load researchers.</div>`;
    showToast("Error", error.message, "error");
  }
}

window.viewResearcher = async function (researcherId) {
  window.showDetailsLoading?.("Researcher Details");
  try {
    const stats = await api(`/researchers/${researcherId}/profile-stats`);
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

window.editResearcher = async function (researcherId) {
  try {
    const r = await api(`/researchers/${researcherId}`);
    editingResearcherId = r.id;

    const form = document.getElementById("addResearcherForm");
    form.querySelector("[name='user_id']").value = r.user_id;
    form.querySelector("[name='full_name']").value = r.full_name;
    form.querySelector("[name='academic_profile']").value = r.academic_profile;
    form.querySelector("[name='department']").value = r.department;
    form.querySelector("[name='institution']").value = r.institution;
    form.querySelector("[name='skills']").value = r.skills;
    form.querySelector("[name='research_interest']").value = r.research_interest;
    form.querySelector("[name='affiliations']").value = r.affiliations;

    document.querySelector("#addResearcherModal .modal-title").textContent = "Edit Researcher";
    document.querySelector("#addResearcherForm button[type='submit']").textContent = "Save Changes";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("addResearcherModal")).show();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

window.deleteResearcher = async function (researcherId) {
  if (!confirm("Are you sure you want to delete this researcher? This cannot be undone.")) return;

  try {
    await api(`/researchers/${researcherId}`, { method: "DELETE" });
    showToast("Success", "Researcher deleted successfully.", "success");
    await loadResearchers();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

function bindResearcherForm() {
  const form = document.getElementById("addResearcherForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formDataToJson(form);

    try {
      if (editingResearcherId === null) {
        await api("/researchers/", { method: "POST", body: JSON.stringify(data) });
        showToast("Saved", "Researcher added.", "success");
      } else {
        await api(`/researchers/${editingResearcherId}`, { method: "PUT", body: JSON.stringify(data) });
        showToast("Saved", "Researcher updated.", "success");
        editingResearcherId = null;
        document.querySelector("#addResearcherModal .modal-title").textContent = "Add New Researcher";
        document.querySelector("#addResearcherForm button[type='submit']").textContent = "Add Researcher";
      }

      form.reset();
      bootstrap.Modal.getInstance(document.getElementById("addResearcherModal"))?.hide();
      await loadResearchers(researcherCurrentPage);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  });

  document.getElementById("addResearcherModal")?.addEventListener("hidden.bs.modal", () => {
    editingResearcherId = null;
    form.reset();
    document.querySelector("#addResearcherModal .modal-title").textContent = "Add New Researcher";
    document.querySelector("#addResearcherForm button[type='submit']").textContent = "Add Researcher";
  });
}

document.getElementById("researcherPrevPage")?.addEventListener("click", () => {
  if (researcherCurrentPage > 1) loadResearchers(researcherCurrentPage - 1);
});
document.getElementById("researcherNextPage")?.addEventListener("click", () => {
  loadResearchers(researcherCurrentPage + 1);
});
document.getElementById("researcherSearch")?.addEventListener("input", debounce(() => loadResearchers(1)));
document.getElementById("researcherSortBy")?.addEventListener("change", () => loadResearchers(1));
document.getElementById("researcherSortOrder")?.addEventListener("change", () => loadResearchers(1));

// =========================================================================
// Publications
// =========================================================================

const PUB_PAGE_SIZE = 6;
let pubCurrentPage = 1;
let editingPublicationId = null;

function publicationStatusBadge(status) {
  const map = { Draft: "secondary", Submitted: "info", Published: "success", Archived: "dark" };
  return `<span class="badge bg-${map[status] ?? "secondary"}">${escapeHtml(status)}</span>`;
}

function renderPublicationCard(p) {
  return `
    <div class="col-md-4 mb-3">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h5 class="card-title mb-0">${escapeHtml(p.title)}</h5>
          </div>
          <p class="card-text small text-muted mb-1">${escapeHtml(p.authors)}</p>
          <p class="card-text small mb-1"><strong>Journal:</strong> ${escapeHtml(p.publication_name)}</p>
          <p class="card-text small mb-2"><strong>Year:</strong> ${p.publication_year ?? "-"} &nbsp;|&nbsp; <strong>DOI:</strong> ${escapeHtml(p.doi ?? "-")}</p>
          <div class="d-flex align-items-center gap-2 mb-3">
            ${publicationStatusBadge(p.status)}
            <span class="badge bg-light text-dark border">${p.citation_count ?? 0} citations</span>
          </div>
          <div class="mt-auto d-flex flex-wrap gap-2">
            ${p.upload_path ? `<a class="btn btn-sm btn-outline-dark" href="#" onclick="window.downloadFile('/publications/download/${p.id}', '${escapeHtml(p.title).replace(/'/g, "")}.pdf', this); return false;"><i class="bi bi-download"></i> PDF</a>` : ""}

<button
    type="button"
    class="btn btn-sm btn-outline-dark"
    onclick="window.viewPublication(${p.id})">
    <i class="bi bi-eye me-1"></i>View Details
</button>

<button
    type="button"
    class="btn btn-sm btn-outline-primary"
    onclick="window.viewReferences(${p.id})">
    References
</button>

<button
    type="button"
    class="btn btn-sm btn-outline-secondary"
    data-requires="publications:edit"
    onclick="window.editPublication(${p.id})">
    Edit
</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPublicationCards(publications) {
  const container = document.getElementById("publicationList");
  if (!container) return;

  if (publications.length === 0) {
    const addBtn = window.canDo("publications", "create")
      ? `<button type="button" class="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#addPublicationModal">Add Publication</button>`
      : "";
    container.innerHTML = emptyStateCard("No publications found.", addBtn);
    return;
  }

  container.innerHTML = publications.map(renderPublicationCard).join("");
  window.applyPermissionGating?.(container);
}

async function loadPublicationMetrics() {
  const el = document.getElementById("pubTotal");
  if (!el) return;

  try {
    const summary = await api("/publications/metrics/summary");
    document.getElementById("pubTotal").textContent = summary.total_publications ?? 0;
    document.getElementById("pubTotalCitations").textContent = summary.total_citations ?? 0;
    document.getElementById("pubPublishedCount").textContent = summary.by_status?.Published ?? 0;
    document.getElementById("pubDraftCount").textContent = summary.by_status?.Draft ?? 0;
  } catch (error) {
    showToast("Error", error.message, "error");
  }
}

async function loadPublications(page = pubCurrentPage) {
  const container = document.getElementById("publicationList");
  if (!container) return;

  pubCurrentPage = page;
  const title = document.getElementById("pubSearchTitle")?.value.trim() ?? "";
  const publicationType = document.getElementById("pubFilterType")?.value ?? "";
  const status = document.getElementById("pubFilterStatus")?.value ?? "";
  const sortBy = document.getElementById("pubSortBy")?.value || "id";
  const sortOrder = document.getElementById("pubSortOrder")?.value || "asc";
  const prevBtn = document.getElementById("pubPrevPage");
  const nextBtn = document.getElementById("pubNextPage");
  const pageNum = document.getElementById("pubPageNum");

  container.innerHTML = skeletonCards(PUB_PAGE_SIZE);

  try {
    let publications;

    if (title) {
      // Title search bypasses pagination (small, exact-ish result set from the existing endpoint)
      publications = await api(`/publications/search?title=${encodeURIComponent(title)}`);
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      if (pageNum) pageNum.textContent = "Search results";
    } else {
      const params = new URLSearchParams();
      if (publicationType) params.append("publication_type", publicationType);
      if (status) params.append("status", status);
      params.append("sort_by", sortBy);
      params.append("order", sortOrder);
      params.append("page", String(page));
      params.append("limit", String(PUB_PAGE_SIZE));
      publications = await api(`/publications/filter?${params.toString()}`);
      if (prevBtn) prevBtn.disabled = page === 1;
      if (nextBtn) nextBtn.disabled = publications.length < PUB_PAGE_SIZE;
      if (pageNum) pageNum.textContent = `Page ${page}`;
    }

    renderPublicationCards(publications);
  } catch (error) {
    container.innerHTML = `<div class="text-center py-4 text-danger">Unable to load publications.</div>`;
    showToast("Error", error.message, "error");
  }
}

window.viewPublication = async function (publicationId) {
  window.showDetailsLoading?.("Publication Details");
  try {
    const p = await api(`/publications/${publicationId}`);

    window.showDetailsModal(
      p.title,
      [
        ["Authors", p.authors],
        ["Journal / Venue", p.publication_name],
        ["Type", p.publication_type],
        ["Publication Year", p.publication_year],
        ["DOI", p.doi],
        ["Status", p.status],
        ["Citations", p.citation_count ?? 0],
        ["Abstract", p.abstract],
      ],
      "Publication Details"
    );
  } catch (error) {
    if (error.status === 404) {
      window.showDetailsNotFound?.("publication");
    } else {
      window.showDetailsError?.(error.message);
    }
  }
};

window.editPublication = async function (publicationId) {
  try {
    const p = await api(`/publications/${publicationId}`);
    editingPublicationId = p.id;

    const form = document.getElementById("addPublicationForm");
    form.querySelector("[name='researcher_id']").value = p.researcher_id;
    form.querySelector("[name='title']").value = p.title;
    form.querySelector("[name='authors']").value = p.authors ?? "";
    form.querySelector("[name='abstract']").value = p.abstract ?? "";
    form.querySelector("[name='citation_count']").value = p.citation_count ?? 0;
    form.querySelector("[name='publication_type']").value = p.publication_type;
    form.querySelector("[name='publication_name']").value = p.publication_name;
    form.querySelector("[name='publication_year']").value = p.publication_year;
    form.querySelector("[name='doi']").value = p.doi ?? "";
    form.querySelector("[name='status']").value = p.status;

    document.querySelector("#addPublicationModal .modal-title").textContent = "Edit Publication";
    document.querySelector("#addPublicationForm button[type='submit']").textContent = "Save Changes";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("addPublicationModal")).show();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

window.deletePublication = async function (publicationId) {
  if (!confirm("Are you sure you want to delete this publication?")) return;

  try {
    await api(`/publications/${publicationId}`, { method: "DELETE" });
    showToast("Success", "Publication deleted successfully.", "success");
    await loadPublications(pubCurrentPage);
    await loadPublicationMetrics();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

function bindPublicationForm() {
  const form = document.getElementById("addPublicationForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const submitBtn = form.querySelector("button[type='submit']");
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;

    try {
      if (editingPublicationId === null) {
        await apiForm("/publications/", "POST", formData);
        showToast("Saved", "Publication added.", "success");
      } else {
        await apiForm(`/publications/${editingPublicationId}`, "PUT", formData);
        showToast("Saved", "Publication updated.", "success");
        editingPublicationId = null;
        document.querySelector("#addPublicationModal .modal-title").textContent = "Add New Publication";
      }

      form.reset();
      bootstrap.Modal.getInstance(document.getElementById("addPublicationModal"))?.hide();
      await loadPublications(pubCurrentPage);
      await loadPublicationMetrics();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingPublicationId === null ? "Add Publication" : originalLabel;
    }
  });

  document.getElementById("addPublicationModal")?.addEventListener("hidden.bs.modal", () => {
    editingPublicationId = null;
    form.reset();
    document.querySelector("#addPublicationModal .modal-title").textContent = "Add New Publication";
    document.querySelector("#addPublicationForm button[type='submit']").textContent = "Add Publication";
  });
}

document.getElementById("pubSearchTitle")?.addEventListener("input", debounce(() => loadPublications(1)));
document.getElementById("pubFilterType")?.addEventListener("change", () => loadPublications(1));
document.getElementById("pubFilterStatus")?.addEventListener("change", () => loadPublications(1));
document.getElementById("pubSortBy")?.addEventListener("change", () => loadPublications(1));
document.getElementById("pubSortOrder")?.addEventListener("change", () => loadPublications(1));
document.getElementById("pubClearBtn")?.addEventListener("click", () => {
  document.getElementById("pubSearchTitle").value = "";
  document.getElementById("pubFilterType").value = "";
  document.getElementById("pubFilterStatus").value = "";
  document.getElementById("pubSortBy").value = "id";
  document.getElementById("pubSortOrder").value = "asc";
  loadPublications(1);
});
document.getElementById("pubPrevPage")?.addEventListener("click", () => {
  if (pubCurrentPage > 1) loadPublications(pubCurrentPage - 1);
});
document.getElementById("pubNextPage")?.addEventListener("click", () => {
  loadPublications(pubCurrentPage + 1);
});

// =========================================================================
// Citations
// =========================================================================

const CITATION_PAGE_SIZE = 6;
let citationCurrentPage = 1;
let editingCitationId = null;
let lastCitationsData = [];

function renderCitationCard(c) {
  return `
    <div class="col-md-4 mb-3">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(c.publication_title ?? `Publication #${c.publication_id}`)}</h5>
          <p class="card-text small text-muted mb-1">${c.publication_year ?? "-"}</p>
          <p class="card-text small mb-2">${escapeHtml(c.citation_text)}</p>
          <p class="card-text small mb-2"><strong>DOI:</strong> ${escapeHtml(c.doi ?? "-")}</p>
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge bg-light text-dark border">Ref #${c.reference_order ?? "-"}</span>
            ${c.cited_publication_id ? `<span class="badge bg-light text-dark border">Cites Pub #${c.cited_publication_id}</span>` : ""}
          </div>
          <div class="mt-auto d-flex gap-2 flex-wrap">

    <button
        type="button"
        class="btn btn-sm btn-outline-dark"
        onclick="window.viewCitation(${c.id})">
        <i class="bi bi-eye me-1"></i>View Details
    </button>

    <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        data-requires="citations:edit"
        onclick="window.editCitation(${c.id})">
        Edit
    </button>

    <button
        type="button"
        class="btn btn-sm btn-outline-danger"
        data-requires="citations:delete"
        onclick="window.deleteCitation(${c.id})">
        Delete
    </button>

    <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        onclick="copyCitation('${encodeURIComponent(c.citation_text)}')">
        Copy
    </button>
    <button
    type="button"
    class="btn btn-sm btn-outline-success"
    onclick="window.generateCitation(${c.id})">
    Generate
</button>
<button
    type="button"
    class="btn btn-sm btn-outline-dark"
    onclick="window.exportBibtex(${c.id})">
    BibTeX
</button>

</div>
        </div>
      </div>
    </div>
  `;
}

function renderCitationCards(citations) {
  const container = document.getElementById("citationList");
  if (!container) return;

  if (citations.length === 0) {
    const addBtn = window.canDo("citations", "create")
      ? `<button type="button" class="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#addCitationModal">Add Citation</button>`
      : "";
    container.innerHTML = emptyStateCard("No citations found.", addBtn);
    return;
  }

  container.innerHTML = citations.map(renderCitationCard).join("");
  window.applyPermissionGating?.(container);
}

async function loadCitationStats() {
  const el = document.getElementById("citeTotalRecords");
  if (!el) return;

  try {
    const stats = await api("/citations/analytics/summary");
    document.getElementById("citeTotalRecords").textContent = stats.total_citations_records ?? 0;
    document.getElementById("citeTotalPubCitations").textContent = stats.total_publication_citations ?? 0;
    document.getElementById("citeAvgCitations").textContent = stats.average_citations_per_publication ?? 0;
    document.getElementById("citeMostCited").textContent = stats.most_cited_publication
      ? stats.most_cited_publication.title
      : "-";
  } catch (error) {
    showToast("Error", error.message, "error");
  }
}

async function loadCitations(page = citationCurrentPage) {
  const container = document.getElementById("citationList");
  if (!container) return;

  citationCurrentPage = page;
  const prevBtn = document.getElementById("citePrevPage");
  const nextBtn = document.getElementById("citeNextPage");
  const pageNum = document.getElementById("citePageNum");
  const query = document.getElementById("citationSearchText")?.value.trim() ?? "";
  const sortBy = document.getElementById("citationSortBy")?.value || "id";
  const order = document.getElementById("citationSortOrder")?.value || "asc";

  container.innerHTML = skeletonCards(CITATION_PAGE_SIZE);

  try {
    const params = new URLSearchParams({
      query, sort_by: sortBy, order, page: String(page), limit: String(CITATION_PAGE_SIZE),
    });
    const citations = await api(`/citations/search/filter?${params.toString()}`);

    lastCitationsData = citations;
    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = citations.length < CITATION_PAGE_SIZE;
    if (pageNum) pageNum.textContent = `Page ${page}`;

    renderCitationCards(citations);
  } catch (error) {
    container.innerHTML = `<div class="text-center py-4 text-danger">Unable to load citations.</div>`;
    showToast("Error", error.message, "error");
  }
}

window.viewCitation = async function (citationId) {
  const c = lastCitationsData.find((entry) => entry.id === citationId);
  if (!c) {
    window.showDetailsNotFound?.("citation");
    return;
  }

  window.showDetailsModal(
    c.publication_title ?? `Publication #${c.publication_id}`,
    [
      ["Citation Text", c.citation_text],
      ["Publication Year", c.publication_year],
      ["DOI", c.doi],
      ["Reference Order", c.reference_order],
      ["Cited Publication ID", c.cited_publication_id],
    ],
    "Citation Details"
  );
};

window.editCitation = async function (citationId) {
  try {
    const citation = await api(`/citations/${citationId}`);
    editingCitationId = citation.id;

    const form = document.getElementById("modalCitationForm");
    form.querySelector("[name='publication_id']").value = citation.publication_id;
    form.querySelector("[name='cited_publication_id']").value = citation.cited_publication_id ?? "";
    form.querySelector("[name='citation_text']").value = citation.citation_text;
    form.querySelector("[name='doi']").value = citation.doi ?? "";
    form.querySelector("[name='reference_order']").value = citation.reference_order ?? "";

    document.getElementById("citationModalTitle").textContent = "Edit Citation Record";
    document.querySelector("#modalCitationForm button[type='submit']").textContent = "Save Changes";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("addCitationModal")).show();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

window.deleteCitation = async function (citationId) {
  if (!confirm("Are you sure you want to delete this citation?")) return;

  try {
    await api(`/citations/${citationId}`, { method: "DELETE" });
    showToast("Success", "Citation deleted successfully.", "success");
    await loadCitations(citationCurrentPage);
    await loadCitationStats();
  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

function bindCitationForm() {
  const form = document.getElementById("modalCitationForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formDataToJson(form);
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    const spinnerLabel = submitBtn.textContent;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;

    try {
      if (editingCitationId === null) {
        await api("/citations/", { method: "POST", body: JSON.stringify(data) });
        showToast("Success", "Citation added successfully.", "success");
      } else {
        await api(`/citations/${editingCitationId}`, { method: "PUT", body: JSON.stringify(data) });
        showToast("Success", "Citation updated successfully.", "success");
        editingCitationId = null;
        document.getElementById("citationModalTitle").textContent = "Add Citation Record";
      }

      form.reset();
      bootstrap.Modal.getInstance(document.getElementById("addCitationModal"))?.hide();
      await loadCitations(citationCurrentPage);
      await loadCitationStats();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingCitationId === null ? "Save Citation" : spinnerLabel;
    }
  });

  document.getElementById("addCitationModal")?.addEventListener("hidden.bs.modal", () => {
    editingCitationId = null;
    form.reset();
    document.getElementById("citationModalTitle").textContent = "Add Citation Record";
    document.querySelector("#modalCitationForm button[type='submit']").textContent = "Save Citation";
  });
}

document.getElementById("citationSearchText")?.addEventListener("input", debounce(() => loadCitations(1)));
document.getElementById("citationSortBy")?.addEventListener("change", () => loadCitations(1));
document.getElementById("citationSortOrder")?.addEventListener("change", () => loadCitations(1));
document.getElementById("citationClearBtn")?.addEventListener("click", () => {
  document.getElementById("citationSearchText").value = "";
  document.getElementById("citationSortBy").value = "id";
  document.getElementById("citationSortOrder").value = "asc";
  loadCitations(1);
});
document.getElementById("citePrevPage")?.addEventListener("click", () => {
  if (citationCurrentPage > 1) loadCitations(citationCurrentPage - 1);
});
document.getElementById("citeNextPage")?.addEventListener("click", () => {
  loadCitations(citationCurrentPage + 1);
});

// =========================================================================
// Page bootstrapping — each loader/binder is a safe no-op on pages that
// don't have the relevant elements.
// =========================================================================

bindInstitutionForm();
bindResearcherForm();
bindPublicationForm();
bindCitationForm();


loadAll().catch((error) => showToast("Load error", error.message));
loadInstitutions();
loadResearchers();
loadPublications();
loadPublicationMetrics();
loadCitations();
loadCitationStats();
window.copyCitation = async function (text) {
  try {
    const citationText = decodeURIComponent(text);

    await navigator.clipboard.writeText(citationText);

    showToast("Success", "Citation copied successfully.", "success");
  } catch (error) {
    showToast("Error", "Failed to copy citation.", "error");
  }
};
window.generateCitation = async function (citationId) {
  try {
    const style = prompt(
      "Enter citation style (APA, MLA, IEEE, Chicago):",
      "APA"
    );

    if (!style) return;

    const result = await api(
      `/citations/${citationId}/generate?style=${style}`
    );

    alert(
      `${result.style} Citation\n\n${result.citation}`
    );

  } catch (error) {
    showToast("Error", error.message, "error");
  }
};
window.exportBibtex = async function (citationId) {
  try {
    const result = await api(`/citations/${citationId}/bibtex`);

    const blob = new Blob(
      [result.content],
      { type: "application/x-bibtex" }
    );

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);

    showToast("Success", "BibTeX file downloaded successfully.", "success");

  } catch (error) {
    showToast("Error", error.message, "error");
  }
};
window.viewReferences = async function (publicationId) {
  try {
    const references = await api(`/publications/${publicationId}/references`);

    if (references.length === 0) {
      alert("No references found for this publication.");
      return;
    }

    const referenceList = references
      .map(ref => `• ${ref.title}`)
      .join("\n");

    alert(
      `References\n\n${referenceList}`
    );

  } catch (error) {
    showToast("Error", error.message, "error");
  }
};

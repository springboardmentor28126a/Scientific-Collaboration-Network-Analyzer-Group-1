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
    throw new Error(message);
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

async function loadDashboard() {
  if (!document.getElementById("metricUsers")) return;

  const data = await api("/dashboard/admin");
  document.getElementById("metricUsers").textContent = data.users ?? 0;
  document.getElementById("metricResearchers").textContent = data.researchers ?? 0;
  document.getElementById("metricInstitutions").textContent = data.institutions ?? 0;
  document.getElementById("metricPublications").textContent = data.publications ?? 0;
  document.getElementById("metricProjects").textContent = data.projects ?? 0;
  document.getElementById("metricCollaborations").textContent = data.collaborations ?? 0;
  document.getElementById("metricConferences").textContent = data.conferences ?? 0;
  document.getElementById("metricCitations").textContent = data.citations ?? 0;
}

async function loadReports() {
  if (!document.getElementById("publicationReport")) return;
  const message = "Reports will be available when the reports API is added.";
  document.getElementById("publicationReport").textContent = message;
  document.getElementById("researchReport").textContent = message;
  document.getElementById("collaborationReport").textContent = message;
}

async function loadNetwork() {
  if (!document.getElementById("networkBox")) return;
  document.getElementById("networkBox").textContent =
    "Collaboration-network data will be available when the collaborations API is added.";
}

async function loadAll() {
  await Promise.all([loadDashboard(), loadReports(), loadNetwork()]);
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
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="window.viewInstitution(${inst.id})">View</button>
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
  const section = document.getElementById("institutionDetailSection");
  if (!section) return;

  try {
    const details = await api(`/institutions/${institutionId}/details`);

    document.getElementById("instDetailTitle").textContent = details.name;

    document.getElementById("instBasicInfo").innerHTML = `
      <li><strong>Type:</strong> ${escapeHtml(details.institution_type ?? "-")}</li>
      <li><strong>City:</strong> ${escapeHtml(details.city ?? "-")}</li>
      <li><strong>Country:</strong> ${escapeHtml(details.country ?? "-")}</li>
    `;

    document.getElementById("instContactInfo").innerHTML = `
      <li><strong>Website:</strong> ${details.website ? `<a href="${escapeHtml(details.website)}" target="_blank">${escapeHtml(details.website)}</a>` : "-"}</li>
      <li><strong>Contact Email:</strong> ${escapeHtml(details.contact_email ?? "-")}</li>
    `;

    document.getElementById("instDepartments").innerHTML = details.departments.length
      ? details.departments.map((d) => `<span class="badge bg-light text-dark border me-1 mb-1">${escapeHtml(d)}</span>`).join("")
      : `<p class="text-muted small mb-0">No departments on record.</p>`;

    document.getElementById("instResearchers").innerHTML = details.researchers.length
      ? `<ul class="list-unstyled mb-0">${details.researchers.map((r) => `<li>${escapeHtml(r.full_name)} — <span class="text-muted small">${escapeHtml(r.department ?? "-")}</span></li>`).join("")}</ul>`
      : `<p class="text-muted small mb-0">No researchers on record.</p>`;

    document.getElementById("instPublications").innerHTML =
      `<span class="badge bg-primary">${details.total_publications}</span> total publications`;

    document.getElementById("instProjects").innerHTML =
      `<span class="badge bg-primary">${details.active_projects}</span> active projects`;

    document.getElementById("instCollabStats").innerHTML =
      `<span class="badge bg-primary">${details.collaboration_count}</span> collaborations, <span class="badge bg-primary">${details.total_researchers}</span> researchers total`;

    section.style.display = "";
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast("Error", error.message, "error");
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
    document.getElementById("institutionDetailSection").style.display = "none";
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
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="window.viewResearcher(${r.id})">View Profile</button>
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
  const section = document.getElementById("researcherDetailSection");
  if (!section) return;

  try {
    const stats = await api(`/researchers/${researcherId}/profile-stats`);

    document.getElementById("researcherDetailTitle").textContent = stats.full_name;

    document.getElementById("researcherBasicInfo").innerHTML = `
      <li><strong>Institution:</strong> ${escapeHtml(stats.institution ?? "-")}</li>
      <li><strong>Department:</strong> ${escapeHtml(stats.department ?? "-")}</li>
      <li><strong>Profile Completion:</strong> ${stats.completion_percentage}%</li>
    `;

    document.getElementById("researcherStatsInfo").innerHTML = `
      <li><strong>Publications:</strong> ${stats.publication_count}</li>
      <li><strong>Citations:</strong> ${stats.citation_count}</li>
      <li><strong>Active Projects:</strong> ${stats.active_project_count}</li>
    `;

    document.getElementById("researcherRecentPubs").innerHTML = stats.recent_publications.length
      ? `<ul class="list-unstyled mb-0">${stats.recent_publications.map((p) => `<li>${escapeHtml(p.title)} <span class="text-muted small">(${p.publication_year ?? "-"}, ${escapeHtml(p.status)})</span></li>`).join("")}</ul>`
      : `<p class="text-muted small mb-0">No publications on record.</p>`;

    section.style.display = "";
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast("Error", error.message, "error");
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
    document.getElementById("researcherDetailSection").style.display = "none";
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
            <button type="button" class="btn btn-sm btn-outline-secondary" data-requires="publications:edit" onclick="window.editPublication(${p.id})">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-requires="publications:delete" onclick="window.deletePublication(${p.id})">Delete</button>
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
// Conferences
// =========================================================================

const CONF_PAGE_SIZE = 6;
let confCurrentPage = 1;
let editingConferenceId = null;

async function loadConferenceStats() {
  try {
    const stats = await api("/conferences/summary/stats");
    document.getElementById("confTotal").textContent = stats.total_conferences ?? 0;
    document.getElementById("confOrganizers").textContent = stats.total_organizers ?? 0;
    document.getElementById("confLocations").textContent = stats.total_locations ?? 0;
    document.getElementById("confParticipants").textContent = stats.total_participants ?? 0;
  } catch (error) {
    showToast("Error", error.message, "error");
  }
}

async function loadConferences(page = confCurrentPage) {
  const container = document.getElementById("conferenceList");
  if (!container) return;

  confCurrentPage = page;

  const query =
    document.getElementById("confSearch")?.value.trim() ?? "";

  const status =
    document.getElementById("confStatus")?.value || "";

  const sortBy =
    document.getElementById("confSortBy")?.value || "name";

  const order =
    document.getElementById("confSortOrder")?.value || "asc";

  container.innerHTML = skeletonCards(CONF_PAGE_SIZE);

  try {

    const params = new URLSearchParams({
      query,
      status,
      sort_by: sortBy,
      order,
      page: String(page),
      limit: String(CONF_PAGE_SIZE),
    });

    const conferences = await api(
      `/conferences/search/filter?${params.toString()}`
    );

    const prevBtn = document.getElementById("confPrevPage");
    const nextBtn = document.getElementById("confNextPage");
    const pageNum = document.getElementById("confPageNum");

    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = conferences.length < CONF_PAGE_SIZE;
    if (pageNum) pageNum.textContent = `Page ${page}`;

    if (conferences.length === 0) {

      const addBtn = window.canDo("conferences", "create")
        ? `
          <button
            type="button"
            class="btn btn-sm btn-dark"
            data-bs-toggle="modal"
            data-bs-target="#addConferenceModal">
            Add Conference
          </button>
        `
        : "";

      container.innerHTML = emptyStateCard(
        "No conferences found.",
        addBtn
      );

      return;
    }

    container.innerHTML = conferences.map(conf => {

      let statusText = "";
      let statusClass = "";

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = conf.start_date ? new Date(conf.start_date) : null;
      const end = conf.end_date ? new Date(conf.end_date) : null;

      if (start && end) {

        if (today < start) {
          statusText = "Upcoming";
          statusClass = "bg-primary";
        }
        else if (today >= start && today <= end) {
          statusText = "Ongoing";
          statusClass = "bg-success";
        }
        else {
          statusText = "Completed";
          statusClass = "bg-secondary";
        }

      }

      return `
      <div class="col-md-4 mb-3">

        <div class="card h-100">

          <div class="card-body d-flex flex-column">

            <h5 class="card-title mb-2">
              ${escapeHtml(conf.name)}
            </h5>

            ${
              statusText
                ? `<span class="badge ${statusClass} mb-2" style="width:max-content;">
                     ${statusText}
                   </span>`
                : ""
            }

            <p class="card-text">

  <strong>Location:</strong>
  ${escapeHtml(conf.location ?? "-")}
  <br>

  <strong>Dates:</strong>
  ${escapeHtml(conf.start_date ?? "-")}
  to
  ${escapeHtml(conf.end_date ?? "-")}
  <br>

  <strong>Organizer:</strong>
  ${escapeHtml(conf.organizer ?? "-")}

  ${
    window.currentUser?.role === "System Admin"
      ? `
      <br>
      <strong>Registered Participants:</strong>
      ${conf.participant_count}
      `
      : ""
  }

</p>

            <div class="mt-auto d-flex flex-wrap gap-2">

              <button
                type="button"
                class="btn btn-sm btn-outline-dark"
                onclick="window.viewConference(${conf.id})">
                View Details
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                data-requires="conferences:edit"
                onclick="window.editConference(${conf.id})">
                Edit
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                data-requires="conferences:delete"
                onclick="window.deleteConference(${conf.id})">
                Delete
              </button>

            </div>

          </div>

        </div>

      </div>
      `;

    }).join("");

    window.applyPermissionGating?.(container);

  }
  catch (error) {

    container.innerHTML = `
      <div class="text-center py-4 text-danger">
        Unable to load conferences.
      </div>
    `;

    showToast(
      "Error",
      error.message,
      "error"
    );

  }
}

window.viewConference = async function (conferenceId) {
  const section = document.getElementById("conferenceDetailSection");
  if (!section) return;

  try {
    const conf = await api(`/conferences/${conferenceId}`);

    document.getElementById("confDetailTitle").textContent = conf.name;

    document.getElementById("confDetailInfo").innerHTML = `

      <li>
        <strong>Conference ID:</strong>
        <span class="badge bg-dark">${conf.id}</span>
      </li>

      <li>
        <strong>Conference Name:</strong>
        ${escapeHtml(conf.name)}
      </li>

      <li>
        <strong>Organizer:</strong>
        ${escapeHtml(conf.organizer ?? "-")}
      </li>

      ${
        localStorage.getItem("role") === "System Admin"
          ? `
          <li>
            <strong>Registered Participants:</strong>
            <span class="badge bg-primary">
              ${conf.participant_count}
            </span>
          </li>
          `
          : ""
      }

      <li>
        <strong>Location:</strong>
        ${escapeHtml(conf.location ?? "-")}
      </li>

      <li>
        <strong>Start Date:</strong>
        ${escapeHtml(conf.start_date ?? "-")}
      </li>

      <li>
        <strong>End Date:</strong>
        ${escapeHtml(conf.end_date ?? "-")}
      </li>

      <li>
        <strong>Website:</strong>
        ${
          conf.website
            ? `
              <a
                href="${escapeHtml(conf.website)}"
                target="_blank"
                rel="noopener">
                ${escapeHtml(conf.website)}
              </a>
            `
            : "-"
        }
      </li>

    `;

    section.style.display = "";
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  } catch (error) {
    showToast(
      "Error",
      error.message || "Unable to load conference details.",
      "error"
    );
  }
};

window.editConference = async function (conferenceId) {

  try {

    const conf = await api(`/conferences/${conferenceId}`);

    editingConferenceId = conf.id;

    const form = document.getElementById("addConferenceForm");

    form.querySelector("[name='name']").value =
      conf.name ?? "";

    form.querySelector("[name='organizer']").value =
      conf.organizer ?? "";

    form.querySelector("[name='location']").value =
      conf.location ?? "";

    form.querySelector("[name='start_date']").value =
      conf.start_date ?? "";

    form.querySelector("[name='end_date']").value =
      conf.end_date ?? "";

    form.querySelector("[name='website']").value =
      conf.website ?? "";

    document.querySelector(
      "#addConferenceModal .modal-title"
    ).textContent = "Edit Conference";

    document.querySelector(
      "#addConferenceForm button[type='submit']"
    ).textContent = "Save Changes";

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("addConferenceModal")
    ).show();

  }

  catch (error) {

    showToast(
      "Error",
      error.message,
      "error"
    );

  }

};

window.deleteConference = async function (conferenceId) {

  const confirmed = confirm(
    "Are you sure you want to delete this conference?"
  );

  if (!confirmed) return;

  try {

    await api(`/conferences/${conferenceId}`, {
      method: "DELETE",
    });

    showToast(
      "Success",
      "Conference deleted successfully.",
      "success"
    );

    document.getElementById(
      "conferenceDetailSection"
    ).style.display = "none";

    await loadConferences(confCurrentPage);
    await loadConferenceStats();

  } catch (error) {

    showToast(
      "Error",
      error.message,
      "error"
    );

  }

};

function bindConferenceForm() {

  const form = document.getElementById("addConferenceForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const data = formDataToJson(form);

    try {

      if (editingConferenceId === null) {

        // CREATE
        await api("/conferences/", {
          method: "POST",
          body: JSON.stringify(data),
        });

        showToast(
          "Success",
          "Conference added successfully.",
          "success"
        );

      } else {

        // UPDATE
        await api(`/conferences/${editingConferenceId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        showToast(
          "Success",
          "Conference updated successfully.",
          "success"
        );

        editingConferenceId = null;

        document.querySelector(
          "#addConferenceModal .modal-title"
        ).textContent = "Add New Conference";

        document.querySelector(
          "#addConferenceForm button[type='submit']"
        ).textContent = "Create Conference";
      }

      form.reset();

      bootstrap.Modal.getInstance(
        document.getElementById("addConferenceModal")
      )?.hide();

      await loadConferences(confCurrentPage);
      await loadConferenceStats();

    } catch (error) {

      showToast(
        "Error",
        error.message,
        "error"
      );

    }

  });

  // Reset modal when closed
  document.getElementById("addConferenceModal")
    ?.addEventListener("hidden.bs.modal", () => {

      editingConferenceId = null;

      form.reset();

      document.querySelector(
        "#addConferenceModal .modal-title"
      ).textContent = "Add New Conference";

      document.querySelector(
        "#addConferenceForm button[type='submit']"
      ).textContent = "Create Conference";

    });

}

function bindParticipationForm() {
  const form = document.getElementById("registerParticipationForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/participations/", {
        method: "POST",
        body: JSON.stringify(formDataToJson(form)),
      });
      form.reset();
      showToast("Saved", "Participation registered.", "success");
      await loadConferences();
      await loadConferenceStats();
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  });
}

document.getElementById("confPrevPage")?.addEventListener("click", () => {
  if (confCurrentPage > 1) {
    confCurrentPage--;
    loadConferences(confCurrentPage);
  }
});
document.getElementById("confNextPage")?.addEventListener("click", () => {
  confCurrentPage++;
  loadConferences(confCurrentPage);
});
document.getElementById("confSearch")?.addEventListener("input", debounce(() => loadConferences(1)));
document.getElementById("confSortBy")?.addEventListener("change", () => loadConferences(1));
document.getElementById("confSortOrder")?.addEventListener("change", () => loadConferences(1));
document.getElementById("confStatus")
  ?.addEventListener("change", () => {
    loadConferences(1);
  });

// =========================================================================
// Citations
// =========================================================================

const CITATION_PAGE_SIZE = 6;
let citationCurrentPage = 1;
let editingCitationId = null;

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
          <div class="mt-auto d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-requires="citations:edit" onclick="window.editCitation(${c.id})">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-requires="citations:delete" onclick="window.deleteCitation(${c.id})">Delete</button>
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

    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = citations.length < CITATION_PAGE_SIZE;
    if (pageNum) pageNum.textContent = `Page ${page}`;

    renderCitationCards(citations);
  } catch (error) {
    container.innerHTML = `<div class="text-center py-4 text-danger">Unable to load citations.</div>`;
    showToast("Error", error.message, "error");
  }
}

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
bindConferenceForm();
bindParticipationForm();
bindCitationForm();

document.getElementById("refreshReports")?.addEventListener("click", loadReports);

loadAll().catch((error) => showToast("Load error", error.message));
loadInstitutions();
loadResearchers();
loadPublications();
loadPublicationMetrics();
loadConferenceStats();
loadConferences();
loadCitations();
loadCitationStats();
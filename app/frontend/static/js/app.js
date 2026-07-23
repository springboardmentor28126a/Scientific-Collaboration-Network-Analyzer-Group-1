const toastElement = document.getElementById("appToast");
let currentPage = 1;
const pageSize = 2;
let editingCitationId = null;
let editingPublicationId = null;
const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

function showToast(title, message) {
  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastBody").textContent = message;
  toast?.show();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
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

  return response.json();
}

function formDataToJson(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  for (const [key, value] of Object.entries(data)) {
    if (value === "") {
      data[key] = null;
    } else if (["user_id", "researcher_id", "publication_id", "publication_year", "author_order", "cited_publication_id", "reference_order"].includes(key)) {
      data[key] = Number(value);
    }
  }

  return data;
}

function bindForm(formId, endpoint, successMessage, afterSave = loadAll) 
{
  
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
      showToast("Saved", successMessage);
      await afterSave();
    } catch (error) {
      showToast("Error", error.message);
    }
  });
}
async function bindPublicationForm() 
  {
  console.log("bindPublicationForm loaded");
  const form = document.getElementById("publicationForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    console.log("Publication form submitted");
    event.preventDefault();
    const fileInput = form.querySelector('input[name="pdf_file"]');

    
    const formData = new FormData(form);
    console.log(formData.get("pdf_file"));

    try {
     let url = "/publications/";
let method = "POST";

if (editingPublicationId !== null) {
    url = `/publications/${editingPublicationId}`;
    method = "PUT";
}

const response = await fetch(url, {
    method: method,
    body: formData,
});

      if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
}

      form.reset();

if (editingPublicationId === null) {
    showToast("Success", "Publication added.");
} else {
    showToast("Success", "Publication updated.");
    editingPublicationId = null;
}

await loadAll();
await loadPublications();
    } catch (error) {
      showToast("Error", error.message);
    }
  });
}

async function loadDashboard() {
  if (!document.getElementById("metricUsers")) return;

  const data = await api("/dashboard/admin");
  document.getElementById("metricUsers").textContent = data.users ?? 0;
  document.getElementById("metricResearchers").textContent = data.researchers ?? 0;
  document.getElementById("metricInstitutions").textContent = data.institutions ?? 0;
  document.getElementById("metricPublications").textContent = data.publications ?? 0;
  document.getElementById("metricProjects").textContent = data.projects ?? 0;
  document.getElementById("metricCollaborations").textContent = data.collaborations ?? 0;
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

  const box = document.getElementById("networkBox");
  box.textContent = "Collaboration-network data will be available when the collaborations API is added.";
}

async function loadCurrentUser() {
  const token = localStorage.getItem("access_token");
  const navUser = document.getElementById("navUser");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");

  if (!token) return;

  try {
    const response = await fetch("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Invalid session");
    const user = await response.json();
    navUser.textContent = user.email;
    logoutBtn.classList.remove("d-none");
    loginLink.classList.add("d-none");
    registerLink.classList.add("d-none");
  } catch {
    localStorage.removeItem("access_token");
  }
}

function bindLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  });
}

async function loadAll() {
  await Promise.all([
    loadDashboard(),
    loadReports(),
    loadNetwork(),
  ]);
}

async function loadPublications(page = currentPage) 
{
  try {
    const publications = await api(
      `/publications?page=${page}&limit=${pageSize}`
    );
    const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");

prevBtn.disabled = page === 1;
nextBtn.disabled = publications.length < pageSize;

    const results = document.getElementById("searchResults");

    if (!results) return;

    if (publications.length === 0) {
      results.innerHTML = "<p><strong>No publications found.</strong></p>";
      return;
    }

    results.innerHTML = publications
      .map
      (
        (publication) => `
        <div class="panel" style="margin-top:10px;">
          <h3>${publication.title}</h3>

          <p><strong>Authors:</strong> ${publication.authors}</p>

          <p><strong>Abstract:</strong> ${publication.abstract}</p>

          <p><strong>Citation Count:</strong> ${publication.citation_count}</p>

          <p><strong>Publication Type:</strong> ${publication.publication_type}</p>

          <p><strong>Publication Name:</strong> ${publication.publication_name}</p>

          <p><strong>Status:</strong> ${publication.status}</p>

          <p><strong>Year:</strong> ${publication.publication_year}</p>

          <p><strong>DOI:</strong> ${publication.doi}</p>

<div style="margin-top:10px;">
    <button onclick="window.editPublication(${publication.id})">
    Edit
</button>

    <button onclick="window.deletePublication(${publication.id})">
    Delete
</button>
      
</div>
      
</div>
`
      )
      .join("");

  } catch (error) {
    showToast("Error", error.message);
  }
}

async function searchPublications() {
  console.log("Search button clicked");
  console.log("TEST APP.JS");

  const title = document.getElementById("searchTitle").value.trim();

  const publicationType = document.getElementById("filterType").value;
  const status = document.getElementById("filterStatus").value;
  const sortBy = document.getElementById("sortBy").value;
const sortOrder = document.getElementById("sortOrder").value;
  currentPage = 1;
document.getElementById("pageNumber").textContent = "Page 1";

  try {
    let publications = [];

    // If title is entered, use Search API
    if (title) {
      const params = new URLSearchParams();
      params.append("sort_by", sortBy);
params.append("order", sortOrder);

publications = await api(
  `/publications?${params.toString()}&page=1&limit=2`
);
    }
    // Otherwise use Filter API
    else {
      const params = new URLSearchParams();

      if (publicationType) {
        params.append("publication_type", publicationType);
      }

      if (status) {
        params.append("status", status);
      }

      publications = await api(
        `/publications/filter?${params.toString()}`
      );
    }

    const results = document.getElementById("searchResults");

    if (publications.length === 0) {
      results.innerHTML = "<p><strong>No publications found.</strong></p>";
      return;
    }
   console.log(publications);
   

results.innerHTML = publications
  .map((publication) => {
    console.log(publication);

    return `
      <div class="panel" style="margin-top:10px;">

        <h3>${publication.title}</h3>

        <p><strong>Authors:</strong> ${publication.authors}</p>

        <p><strong>Abstract:</strong> ${publication.abstract}</p>

        <p><strong>Citation Count:</strong> ${publication.citation_count}</p>

        <p><strong>Publication Type:</strong> ${publication.publication_type}</p>

        <p><strong>Publication Name:</strong> ${publication.publication_name}</p>

        <p><strong>Status:</strong> ${publication.status}</p>

        <p><strong>Year:</strong> ${publication.publication_year}</p>

        <p><strong>DOI:</strong> ${publication.doi}</p>

      </div>
    `;
  })
  .join("");
  } catch (error) {
    showToast("Error", error.message);
  }
}

bindForm("researcherForm", "/researchers/", "Researcher added.");
bindForm("institutionForm", "/institutions/", "Institution added.");
//bindForm("citationForm", "/citations/", "Citation added.");
function bindCitationForm() {
    const form = document.getElementById("citationForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = formDataToJson(form);

        try {
            if (editingCitationId === null) {
                await api("/citations/", {
                    method: "POST",
                    body: JSON.stringify(data),
                });

                showToast("Success", "Citation added successfully.");
            } else {
                await api(`/citations/${editingCitationId}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                });

                showToast("Success", "Citation updated successfully.");

                editingCitationId = null;
            }

            form.reset();
            await loadCitations();

        } catch (error) {
            showToast("Error", error.message);
        }
    });
}

//bindForm(
//  "publicationForm",
 // "/publications/",
 // "Publication added."
//);
const searchBtn = document.getElementById("searchBtn");

searchBtn?.addEventListener("click", searchPublications);
const searchCitationBtn = document.getElementById("searchCitationBtn");

searchCitationBtn?.addEventListener("click", searchCitations);
const clearSearchBtn = document.getElementById("clearSearchBtn");
const clearCitationBtn = document.getElementById("clearCitationBtn");

clearCitationBtn?.addEventListener("click", () => {
    document.getElementById("searchCitationText").value = "";
    loadCitations();
});

clearSearchBtn?.addEventListener("click", () => {
  
  console.log("Clear button clicked");
   console.log(document.getElementById("searchTitle"));
  console.log(document.getElementById("filterType"));
  console.log(document.getElementById("filterStatus"));
  console.log(document.getElementById("searchResults"));
  document.getElementById("searchTitle").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("searchResults").innerHTML = "";
});
bindPublicationForm();
bindCitationForm();
document.getElementById("refreshReports")?.addEventListener("click", loadReports);
bindLogout();
loadCurrentUser();

loadAll().catch((error) => showToast("Load error", error.message));
async function loadCitations() 
{
    try {
        const citations = await api("/citations/");

        const container = document.getElementById("citationResults");

        if (!container) return;

        if (citations.length === 0) {
            container.innerHTML = "<p>No citations found.</p>";
            return;
        }

        container.innerHTML = citations.map(citation => `
            <div class="card" style="margin-bottom:10px; padding:10px; border:1px solid #ccc;">
                <p><strong>ID:</strong> ${citation.id}</p>
                <p><strong>Publication ID:</strong> ${citation.publication_id}</p>
                <p><strong>Cited Publication ID:</strong> ${citation.cited_publication_id ?? "-"}</p>
                <p><strong>Citation:</strong> ${citation.citation_text}</p>
                <p><strong>DOI:</strong> ${citation.doi ?? "-"}</p>
                <p><strong>Reference Order:</strong> ${citation.reference_order ?? "-"}</p>

                <div style="margin-top:10px;">
    <button
        onclick="editCitation(${citation.id})">
        Edit
    </button>

    <button
        onclick="deleteCitation(${citation.id})">
        Delete
    </button>
</div>
            </div>
        `).join("");

    } catch (error) {
        showToast("Error", error.message);
    }
}
loadPublications();
loadCitations();
async function searchCitations() 
{
    try {
        const text = document.getElementById("searchCitationText").value.trim();

        if (!text) {
            loadCitations();
            return;
        }

        const citations = await api(
            `/citations/search?citation_text=${encodeURIComponent(text)}`
        );

        const container = document.getElementById("citationResults");

        if (citations.length === 0) {
            container.innerHTML = "<p><strong>No citations found.</strong></p>";
            return;
        }

        container.innerHTML = citations.map(citation => `
            <div class="panel" style="margin-top:10px;">
                <p><strong>ID:</strong> ${citation.id}</p>
                <p><strong>Publication ID:</strong> ${citation.publication_id}</p>
                <p><strong>Cited Publication ID:</strong> ${citation.cited_publication_id ?? "-"}</p>
                <p><strong>Citation:</strong> ${citation.citation_text}</p>
                <p><strong>DOI:</strong> ${citation.doi ?? "-"}</p>
                <p><strong>Reference Order:</strong> ${citation.reference_order ?? "-"}</p>
            </div>
        `).join("");

    } catch (error) {
        showToast("Error", error.message);
    }
}
window.deleteCitation = async function(citationId) 
{
  console.log("Delete clicked:", citationId);
    try {
        const confirmed = confirm("Are you sure you want to delete this citation?");

        if (!confirmed) return;

       await api(`/citations/${citationId}`, {
    method: "DELETE"
});

        showToast("Success", "Citation deleted successfully.");

        loadCitations();

    } catch (error) {
        showToast("Error", error.message);
    }
}
window.deletePublication = async function(publicationId) 
{
    try {
        const confirmed = confirm(
            "Are you sure you want to delete this publication?"
        );

        if (!confirmed) return;

        await api(`/publications/${publicationId}`, {
            method: "DELETE"
        });

        showToast("Success", "Publication deleted successfully.");

        await loadPublications();

    } catch (error) {
        showToast("Error", error.message);
    }
}
window.editPublication = async function(publicationId) {
    try {
        const publication = await api(`/publications/${publicationId}`);

        // Store the publication ID
        editingPublicationId = publication.id;

        // Fill the form
        document.querySelector("#publicationForm input[name='researcher_id']").value =
            publication.researcher_id;

        document.querySelector("#publicationForm input[name='title']").value =
            publication.title;

        document.querySelector("#publicationForm input[name='authors']").value =
            publication.authors;

        document.querySelector("#publicationForm textarea[name='abstract']").value =
            publication.abstract ?? "";

        document.querySelector("#publicationForm input[name='citation_count']").value =
            publication.citation_count;

        document.querySelector("#publicationForm select[name='publication_type']").value =
            publication.publication_type;

        document.querySelector("#publicationForm input[name='publication_name']").value =
            publication.publication_name;

        document.querySelector("#publicationForm input[name='publication_year']").value =
            publication.publication_year;

        document.querySelector("#publicationForm input[name='doi']").value =
            publication.doi ?? "";

        document.querySelector("#publicationForm select[name='status']").value =
            publication.status;

    } catch (error) {
        showToast("Error", error.message);
    }
}
console.log("Edit function loaded");
window.editCitation = async function(citationId) {
    console.log("Edit button clicked:", publicationId);
    try {
        const citation = await api(`/citations/${citationId}`);
        editingCitationId = citation.id;

        document.querySelector("#citationForm input[name='publication_id']").value =
            citation.publication_id;

        document.querySelector("#citationForm input[name='cited_publication_id']").value =
            citation.cited_publication_id ?? "";

        document.querySelector("#citationForm input[name='citation_text']").value =
            citation.citation_text;

        document.querySelector("#citationForm input[name='doi']").value =
            citation.doi ?? "";

        document.querySelector("#citationForm input[name='reference_order']").value =
            citation.reference_order ?? "";

    } catch (error) {
        showToast("Error", error.message);
    }
}
document.getElementById("nextPage")?.addEventListener("click", async () => {
  currentPage++;
  document.getElementById("pageNumber").textContent = `Page ${currentPage}`;
  await loadPublications(currentPage);
});

document.getElementById("prevPage")?.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    document.getElementById("pageNumber").textContent = `Page ${currentPage}`;
    await loadPublications(currentPage);
  }
});
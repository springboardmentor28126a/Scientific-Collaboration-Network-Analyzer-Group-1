let currentPage = 1;
const pageSize = 5;
let editingConferenceId = null;
const toastElement = document.getElementById("appToast");
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
      const response = await fetch("/publications/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add publication");
      }

      form.reset();
      showToast("Success", "Publication added.");
      await loadAll();

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
async function loadConferences() {

    const table = document.getElementById("conferenceTableBody");

    if (!table) return;

    const name = document.getElementById("conferenceSearch").value.trim();

    const organizer = document.getElementById("organizerFilter").value.trim();

    const location = document.getElementById("locationFilter").value.trim();

    const sortBy = document.getElementById("sortBy").value;

    const sortOrder = document.getElementById("sortOrder").value;

    // Get filtered conferences
   const skip = (currentPage - 1) * pageSize;

let conferences = await api(
    `/conferences/filter?name=${encodeURIComponent(name)}&organizer=${encodeURIComponent(organizer)}&location=${encodeURIComponent(location)}&skip=${skip}&limit=${pageSize}`
);

    // Sort conferences on frontend
    conferences.sort((a, b) => {

        let valueA = a[sortBy];
        let valueB = b[sortBy];

        if (valueA == null) valueA = "";
        if (valueB == null) valueB = "";

        if (sortBy === "start_date" || sortBy === "end_date") {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else {
            valueA = valueA.toString().toLowerCase();
            valueB = valueB.toString().toLowerCase();
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;

        return 0;
    });

    table.innerHTML = conferences.map(conf => `

        <tr>

            <td>${conf.name ?? ""}</td>

            <td>${conf.organizer ?? ""}</td>

            <td>${conf.location ?? ""}</td>

            <td>${conf.start_date ?? ""}</td>

            <td>${conf.end_date ?? ""}</td>

            <td>
                ${
                    conf.website
                        ? `<a href="${conf.website}" target="_blank">Website</a>`
                        : ""
                }
            </td>

            <td class="text-center">

                <button
                    type="button"
                    class="btn btn-success btn-sm"
                    onclick="registerConference(${conf.id}, '${(conf.name ?? "").replace(/'/g, "\\'")}')">
                    Register
                </button>

            </td>

        </tr>

    `).join("");

}

function registerConference(id, name) {

    document.getElementById("conference_id").value = id;

    document.getElementById("conference_name").value = name;

    document.getElementById("registrationForm").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

async function loadAll() {
    await Promise.all([
        loadDashboard(),
        loadReports(),
        loadNetwork(),
        loadConferences()
    ]);
}
async function searchPublications() {
  console.log("Search button clicked");
  console.log("TEST APP.JS");

  const title = document.getElementById("searchTitle").value.trim();

  const publicationType = document.getElementById("filterType").value;
  const status = document.getElementById("filterStatus").value;

  try {
    let publications = [];

    // If title is entered, use Search API
    if (title) {
      publications = await api(
        `/publications/search?title=${encodeURIComponent(title)}`
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

const conferenceForm = document.getElementById("conferenceForm");

conferenceForm?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const data = formDataToJson(conferenceForm);

    try {

        if (editingConferenceId !== null) {

            await api(`/conferences/${editingConferenceId}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });

            showToast("Success", "Conference updated.");

            editingConferenceId = null;

            conferenceForm.querySelector("button").textContent =
                "Add Conference";

        } else {

            await api("/conferences/", {
                method: "POST",
                body: JSON.stringify(data),
            });

            showToast("Success", "Conference added.");

        }

        conferenceForm.reset();

        await loadConferences();

    } catch (error) {

        showToast("Error", error.message);

    }

});

bindForm(
    "registrationForm",
    "/conferences/participations",
    "Conference registration successful."
);

bindForm("institutionForm", "/institutions/", "Institution added.");
//bindForm(
//  "publicationForm",
 // "/publications/",
 // "Publication added."
//);
const searchBtn = document.getElementById("searchBtn");

searchBtn?.addEventListener("click", searchPublications);
const clearSearchBtn = document.getElementById("clearSearchBtn");

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
async function deleteConference(id) {

    if (!confirm("Are you sure you want to delete this conference?"))
        return;

    try {

        await api(`/conferences/${id}`, {
            method: "DELETE"
        });

        showToast("Success", "Conference deleted.");

        loadConferences();

    } catch (error) {

        showToast("Error", error.message);

    }

}
async function editConference(id) {

    const conference = await api(`/conferences/${id}`);

    editingConferenceId = id;

    const form = document.getElementById("conferenceForm");

    form.name.value = conference.name;
    form.organizer.value = conference.organizer;
    form.location.value = conference.location;
    form.start_date.value = conference.start_date;
    form.end_date.value = conference.end_date;
    form.website.value = conference.website;

    form.querySelector("button").textContent = "Update Conference";
}

document.addEventListener("DOMContentLoaded", async () => {

    bindPublicationForm();

    document.getElementById("refreshReports")
        ?.addEventListener("click", loadReports);

    bindLogout();

    await loadCurrentUser();

    try {
        await loadAll();
    } catch (error) {
        showToast("Load error", error.message);
    }

    // Filter Button
    const searchBtn = document.getElementById("conferenceSearchBtn");

    if (searchBtn) {
        searchBtn.addEventListener("click", function (e) {
            e.preventDefault();
            loadConferences();
        });
    }

    // Sort Button
    const sortBtn = document.getElementById("sortConferenceBtn");

    if (sortBtn) {
        sortBtn.addEventListener("click", function (e) {
            e.preventDefault();
            loadConferences();
        });
    }

    // Auto Filter
    const conferenceSearch = document.getElementById("conferenceSearch");
    const organizerFilter = document.getElementById("organizerFilter");
    const locationFilter = document.getElementById("locationFilter");

    conferenceSearch?.addEventListener("input", loadConferences);
    organizerFilter?.addEventListener("input", loadConferences);
    locationFilter?.addEventListener("input", loadConferences);

    // Auto Sort
    document.getElementById("sortBy")
        ?.addEventListener("change", loadConferences);

    document.getElementById("sortOrder")
        ?.addEventListener("change", loadConferences);
    // Pagination

document.getElementById("nextPage")
    ?.addEventListener("click", function () {

        currentPage++;
        loadConferences();

    });

document.getElementById("prevPage")
    ?.addEventListener("click", function () {

        if (currentPage > 1) {
            currentPage--;
            loadConferences();
        }

    });

});

window.loadConferences = loadConferences;
window.registerConference = registerConference;
window.deleteConference = deleteConference;
window.editConference = editConference;
let currentUser = null;
let conferenceCurrentPage = 1;
let publicationCurrentPage = 1;
const pageSize = 5;

let editingConferenceId = null;
let editingPublicationId = null;
let editingCitationId = null;
const toastElement = document.getElementById("appToast");
const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

function showToast(title, message) {
  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastBody").textContent = message;
  toast?.show();
}

async function api(url, options = {}) {
    const token = localStorage.getItem("access_token");

    options.headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Request failed");
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
async function bindPublicationForm() {

    console.log("bindPublicationForm loaded");

    const form = document.getElementById("publicationForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(form);

        try {

            let url = "/publications/";
            let method = "POST";

            if (editingPublicationId !== null) {
                url = `/publications/${editingPublicationId}`;
                method = "PUT";
            }

            const token = localStorage.getItem("access_token");

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
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

    if (!document.getElementById("metricUsers")) {
        return;
    }

    try {

        // -----------------------------
        // Researcher Dashboard
        // -----------------------------
        if (currentUser?.role === "researcher") {

            document.getElementById("metricUsers").textContent = "-";
            document.getElementById("metricResearchers").textContent = "1";
            document.getElementById("metricInstitutions").textContent = "-";
            document.getElementById("metricPublications").textContent = "-";
            document.getElementById("metricProjects").textContent = "-";
            document.getElementById("metricCollaborations").textContent = "-";

            return;
        }

        // -----------------------------
        // Admin / Institution Admin
        // -----------------------------
        const data = await api("/dashboard/admin");

        console.log("Dashboard Data:", data);

        document.getElementById("metricUsers").textContent =
            data.total_users ?? 0;

        document.getElementById("metricResearchers").textContent =
            data.total_researchers ?? 0;

        document.getElementById("metricInstitutions").textContent =
            data.total_institutions ?? 0;

        document.getElementById("metricPublications").textContent =
            data.total_publications ?? 0;

        document.getElementById("metricProjects").textContent =
            data.total_projects ?? 0;

        document.getElementById("metricCollaborations").textContent =
            data.total_collaborations ?? 0;

        // If you add a conference dashboard card
        const conferenceCard =
            document.getElementById("metricConferences");

        if (conferenceCard) {
            conferenceCard.textContent =
                data.total_conferences ?? 0;
        }

    }
    catch (error) {

        console.error("Dashboard Error:", error);

        document.getElementById("metricUsers").textContent = "0";
        document.getElementById("metricResearchers").textContent = "0";
        document.getElementById("metricInstitutions").textContent = "0";
        document.getElementById("metricPublications").textContent = "0";
        document.getElementById("metricProjects").textContent = "0";
        document.getElementById("metricCollaborations").textContent = "0";

        const conferenceCard =
            document.getElementById("metricConferences");

        if (conferenceCard) {
            conferenceCard.textContent = "0";
        }
    }
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

    if (!token) return;

    try {

        const response = await fetch("/users/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok)
            throw new Error("Invalid session");

        currentUser = await response.json();

        console.log("Current User:", currentUser);
        console.log("Role:", currentUser.role);

        document.getElementById("navUser").textContent =
            currentUser.email;

        document.getElementById("logoutBtn")
            ?.classList.remove("d-none");

        document.getElementById("loginLink")
            ?.classList.add("d-none");

        document.getElementById("registerLink")
            ?.classList.add("d-none");

    }

    catch {

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

async function loadConferenceDashboard() {

    if (!document.getElementById("totalConferences"))
        return;

    const data = await api("/conferences/dashboard");

    console.log(data);

    document.getElementById("totalConferences").textContent =
        data.total_conferences ?? 0;

    document.getElementById("upcomingConferences").textContent =
        data.upcoming_conferences ?? 0;

    document.getElementById("ongoingConferences").textContent =
        data.ongoing_conferences ?? 0;

    document.getElementById("completedConferences").textContent =
        data.completed_conferences ?? 0;

    document.getElementById("conferenceRegistrations").textContent =
        data.total_registrations ?? 0;

    document.getElementById("acceptedPapers").textContent =
        data.accepted_papers ?? 0;
}


function renderConferenceTable(conferences) {

    const table = document.getElementById("conferenceTableBody");

    if (!table) return;

    if (!Array.isArray(conferences)) {

        console.error(conferences);

        table.innerHTML =
            "<tr><td colspan='7'>No conferences found.</td></tr>";

        return;
    }

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
            <td>
                Register
            </td>
        </tr>
    `).join("");

}

async function filterConferenceStatus(status) {

    try {

        let conferences = [];

        switch (status) {

            case "upcoming":
                conferences = await api("/conferences/upcoming");
                break;

            case "past":
                conferences = await api("/conferences/past");
                break;

            case "ongoing":
                conferences = await api("/conferences/status?status=ongoing");
                break;

            default:
                await loadConferences();
                return;
        }

        renderConferenceTable(conferences);

    } catch (error) {

        showToast("Error", error.message);

    }

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
   const skip = (conferenceCurrentPage - 1) * pageSize;

let conferences = await api(
    `/conferences/filter?name=${encodeURIComponent(name)}&organizer=${encodeURIComponent(organizer)}&location=${encodeURIComponent(location)}&skip=${skip}&limit=${pageSize}`
);
const prevBtn = document.getElementById("conferencePrevPage");
const nextBtn = document.getElementById("conferenceNextPage");
const pageNumber = document.getElementById("conferencePageNumber");

if (prevBtn) {
    prevBtn.disabled = conferenceCurrentPage === 1;
}

if (nextBtn) {
    nextBtn.disabled = conferences.length < pageSize;
}

if (pageNumber) {
    pageNumber.textContent = `Page ${conferenceCurrentPage}`;
}

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

    renderConferenceTable(conferences);

}

async function viewInstitution(id) {

    try {

        const inst = await api(`/institutions/${id}`);

        document.getElementById("viewName").textContent = inst.name ?? "";
        document.getElementById("viewType").textContent = inst.institution_type ?? "";
        document.getElementById("viewCountry").textContent = inst.country ?? "";
        document.getElementById("viewCity").textContent = inst.city ?? "";
        document.getElementById("viewWebsite").innerHTML =
            inst.website
                ? `<a href="${inst.website}" target="_blank">${inst.website}</a>`
                : "";

        document.getElementById("viewEmail").textContent =
            inst.contact_email ?? "";

        const modal = new bootstrap.Modal(
            document.getElementById("institutionModal")
        );

        modal.show();

    }

    catch (error) {

        showToast("Error", error.message);

    }

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

async function loadPublications(page = publicationCurrentPage) {
    try {

        const publications = await api(
            `/publications?page=${page}&limit=${pageSize}`
        );

        const prevBtn = document.getElementById("publicationPrevPage");
        const nextBtn = document.getElementById("publicationNextPage");
        const pageNumber = document.getElementById("publicationPageNumber");

        if (prevBtn) prevBtn.disabled = page === 1;
        if (nextBtn) nextBtn.disabled = publications.length < pageSize;

        if (pageNumber) {
            pageNumber.textContent = `Page ${page}`;
        }

        const results = document.getElementById("searchResults");

        if (!results) return;

        if (publications.length === 0) {
            results.innerHTML = "<p><strong>No publications found.</strong></p>";
            return;
        }

        results.innerHTML = publications.map((publication) => `
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
        `).join("");

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

    // Conference Name
    if (!data.name || data.name.trim() === "") {
        showToast("Validation Error", "Conference Name is required.");
        return;
    }

    // Organizer
    if (!data.organizer || data.organizer.trim() === "") {
        showToast("Validation Error", "Organizer is required.");
        return;
    }

    // Location
    if (!data.location || data.location.trim() === "") {
        showToast("Validation Error", "Location is required.");
        return;
    }

    // Start Date
    if (!data.start_date) {
        showToast("Validation Error", "Please select Start Date.");
        return;
    }

    // End Date
    if (!data.end_date) {
        showToast("Validation Error", "Please select End Date.");
        return;
    }

    // Date Validation
    if (new Date(data.end_date) < new Date(data.start_date)) {
        showToast("Validation Error", "End Date must be after Start Date.");
        return;
    }

    // Website Required
    if (!data.website || data.website.trim() === "") {
        showToast("Validation Error", "Website is required.");
        return;
    }

    // Website Format
    const urlPattern = /^https?:\/\/.+/;

    if (!urlPattern.test(data.website)) {
        showToast("Validation Error", "Enter a valid Website URL.");
        return;
    }

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

window.deletePublication = async function(publicationId) {

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

        editingPublicationId = publication.id;

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

async function searchInstitution() {

    const name = document.getElementById("institutionSearch").value.trim();
    const country = document.getElementById("countryFilter").value.trim();
    const city = document.getElementById("cityFilter").value.trim();
    const type = document.getElementById("typeFilter").value;

   const institutions = await api(
    `/institutions/search?name=${encodeURIComponent(name)}&country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}&institution_type=${encodeURIComponent(type)}`
);

    const table = document.getElementById("institutionTableBody");
    const container = document.getElementById("institutionTableContainer");

    container.style.display = "block";

    if (institutions.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No institutions found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = institutions.map(inst => `
        <tr>
            <td>${inst.name}</td>
            <td>${inst.institution_type ?? ""}</td>
            <td>${inst.country ?? ""}</td>
            <td>${inst.city ?? ""}</td>
            <td>
                ${inst.website
                    ? `<a href="${inst.website}" target="_blank">Website</a>`
                    : ""}
            </td>
            <td>${inst.contact_email ?? ""}</td>
            <td>
                <button class="btn btn-primary btn-sm"
                    onclick="viewInstitution(${inst.id})">
                    View
                </button>
            </td>
        </tr>
    `).join("");
}

document.addEventListener("DOMContentLoaded", async () => {

    bindPublicationForm();

    document.getElementById("refreshReports")
        ?.addEventListener("click", loadReports);

    bindLogout();

    await loadCurrentUser();

    await loadConferenceDashboard(); 

    try {
        await loadAll();
        await loadPublications();
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


// Conference Status Buttons

document.getElementById("allConferenceBtn")
?.addEventListener("click", function () {

    loadConferences();

});

document.getElementById("upcomingConferenceBtn")
?.addEventListener("click", function () {

    filterConferenceStatus("upcoming");

});

document.getElementById("ongoingConferenceBtn")
?.addEventListener("click", function () {

    filterConferenceStatus("ongoing");

});

document.getElementById("pastConferenceBtn")
?.addEventListener("click", function () {

    filterConferenceStatus("past");

});


// Paginationv


    // Auto Filter
    const conferenceSearch = document.getElementById("conferenceSearch");
    const organizerFilter = document.getElementById("organizerFilter");
    const locationFilter = document.getElementById("locationFilter");
    const today = new Date().toISOString().split("T")[0];


    document.getElementById("start_date")?.setAttribute("min", today);
    document.getElementById("end_date")?.setAttribute("min", today);
    conferenceSearch?.addEventListener("input", loadConferences);
    organizerFilter?.addEventListener("input", loadConferences);
    locationFilter?.addEventListener("input", loadConferences);

    // Auto Sort
    document.getElementById("sortBy")
        ?.addEventListener("change", loadConferences);

    document.getElementById("sortOrder")
        ?.addEventListener("change", loadConferences);
    // Pagination

// Conference pagination
document.getElementById("conferenceNextPage")
?.addEventListener("click", function () {

    conferenceCurrentPage++;
    loadConferences();

});

document.getElementById("conferencePrevPage")
?.addEventListener("click", function () {

    if (conferenceCurrentPage > 1) {
        conferenceCurrentPage--;
        loadConferences();
    }

});

// =========================
// Publication pagination
// =========================

document.getElementById("publicationNextPage")
?.addEventListener("click", async () => {

    publicationCurrentPage++;

    await loadPublications(publicationCurrentPage);

});

document.getElementById("publicationPrevPage")
?.addEventListener("click", async () => {

    if (publicationCurrentPage > 1) {

        publicationCurrentPage--;

        await loadPublications(publicationCurrentPage);

    }

});

    // Institution Search & Filter Buttons
document.getElementById("institutionSearchBtn")
    ?.addEventListener("click", function (e) {
        e.preventDefault();
        searchInstitution();
    });


// Clear Button
document.getElementById("institutionClearBtn")
    ?.addEventListener("click", function () {

        document.getElementById("institutionSearch").value = "";
        document.getElementById("countryFilter").value = "";
        document.getElementById("cityFilter").value = "";
        document.getElementById("typeFilter").value = "";

        document.getElementById("institutionTableBody").innerHTML = "";
        document.getElementById("institutionTableContainer").style.display = "none";
    });

// Auto Search (Optional)
document.getElementById("institutionSearch")
    ?.addEventListener("input", searchInstitution);

document.getElementById("countryFilter")
    ?.addEventListener("input", searchInstitution);

document.getElementById("cityFilter")
    ?.addEventListener("input", searchInstitution);

document.getElementById("typeFilter")
    ?.addEventListener("change", searchInstitution);
});

window.loadConferences = loadConferences;
window.registerConference = registerConference;
window.deleteConference = deleteConference;
window.editConference = editConference;
window.viewInstitution = viewInstitution;
window.searchInstitution = searchInstitution;
window.filterConferenceStatus = filterConferenceStatus;
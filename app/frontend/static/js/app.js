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
      showToast("Saved", successMessage);
      await afterSave();
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

bindForm("researcherForm", "/researchers/", "Researcher added.");
bindForm("institutionForm", "/institutions/", "Institution added.");

document.getElementById("refreshReports")?.addEventListener("click", loadReports);
bindLogout();
loadCurrentUser();
loadAll().catch((error) => showToast("Load error", error.message));

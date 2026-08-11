// =========================================================================
// SCNA - Shared Navbar Auth State, Role-Based Access Control (frontend),
// and global Toast notifications.
// Runs on EVERY page (included directly by layout.html).
// =========================================================================

// -------------------------------------------------------------------------
// Global auth guard: this app requires all users to be authenticated.
// If there's no token at all, send unauthenticated visitors to /login
// (login/register themselves are exempt, obviously).
// -------------------------------------------------------------------------
(function enforceAuthGuard() {
  const publicPaths = ["/login", "/register"];
  const token = localStorage.getItem("access_token");
  if (!token && !publicPaths.includes(window.location.pathname)) {
    window.location.href = "/login";
  }
})();

// -------------------------------------------------------------------------
// Global toast notifications (replaces browser alert()/confirm() messaging
// across the app). Supports success / warning / error / info variants.
// -------------------------------------------------------------------------
const TOAST_TYPE_CLASS = {
  success: "text-bg-success",
  warning: "text-bg-warning",
  error: "text-bg-danger",
  info: "text-bg-info",
};

function showToast(title, message, type = "info") {
  const toastEl = document.getElementById("appToast");
  if (!toastEl) return;

  Object.values(TOAST_TYPE_CLASS).forEach((cls) => toastEl.classList.remove(cls));
  toastEl.classList.add(TOAST_TYPE_CLASS[type] ?? TOAST_TYPE_CLASS.info);

  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastBody").textContent = message;

  bootstrap.Toast.getOrCreateInstance(toastEl).show();
}
window.showToast = showToast;

// -------------------------------------------------------------------------
// RBAC permission matrix (frontend mirror of the backend's require_role()
// checks -- used only to decide what to SHOW; the backend is still the
// source of truth and rejects unauthorized requests with 403 regardless).
// -------------------------------------------------------------------------
const PERMISSION_MATRIX = {
  researchers: {
    create: ["Admin", "System Admin", "Institution Admin"],
    edit: ["Admin", "System Admin", "Institution Admin"],
    delete: ["Admin", "System Admin"],
  },
  institutions: {
    create: ["Admin", "System Admin"],
    edit: ["Admin", "System Admin"],
    delete: ["System Admin"],
  },
  publications: {
    create: ["Admin", "System Admin", "Institution Admin"],
    edit: ["Admin", "System Admin", "Institution Admin"],
    delete: ["Admin", "System Admin"],
  },
  conferences: {
    create: ["Admin", "System Admin", "Institution Admin"],
    edit: ["Admin", "System Admin", "Institution Admin"],
    delete: ["Admin", "System Admin"],
  },
  citations: {
    create: ["Admin", "System Admin", "Institution Admin"],
    edit: ["Admin", "System Admin", "Institution Admin"],
    delete: ["Admin", "System Admin"],
  },
  collaborations: {
    create: ["Admin", "System Admin"],
    edit: ["Admin", "System Admin"],
    delete: ["System Admin"],
  },
  reports: {
    create: ["Admin", "System Admin"],
    edit: ["Admin", "System Admin"],
    delete: ["Admin", "System Admin"],
  },
};

// Roles that count as the baseline "User" nav tier (existing account types
// that predate this role model but should behave like the spec's "User").
const USER_TIER_ROLES = new Set(["Researcher", "Reviewer", "User"]);

function roleTier(role) {
  if (role === "System Admin") return "System Admin";
  if (role === "Admin") return "Admin";
  if (role === "Institution Admin") return "Institution Admin";
  return "User";
}

// Which nav links each tier sees. Citations/Audit aren't called out in the
// spec's per-role nav lists; Citations is treated as part of "every module"
// for Admin/System Admin, and Audit Logs stays System-Admin-only.
const NAV_TIERS = {
  "User": ["navDashboard", "navResearchers", "navPublications", "navReports"],
  "Institution Admin": ["navDashboard", "navResearchers", "navInstitutions", "navPublications", "navConferences", "navCollaborations", "navReports"],
  "Admin": ["navDashboard", "navResearchers", "navInstitutions", "navPublications", "navConferences", "navCitations", "navCollaborations", "navReports"],
  "System Admin": ["navDashboard", "navResearchers", "navInstitutions", "navPublications", "navConferences", "navCitations", "navCollaborations", "navReports", "auditLink"],
};

const ALL_NAV_IDS = ["navDashboard", "navResearchers", "navInstitutions", "navPublications", "navConferences", "navCitations", "navCollaborations", "navReports", "auditLink"];

function applyNavForRole(role) {
  const tier = roleTier(role);
  const visible = new Set(NAV_TIERS[tier] ?? NAV_TIERS["User"]);

  ALL_NAV_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("d-none", !visible.has(id));
  });
}

// window.canDo("researchers", "create") -> true/false, based on the
// currently logged-in user's role and the matrix above.
window.canDo = function canDo(module, action) {
  const user = window.SCNA_USER;
  if (!user) return false;
  const allowed = PERMISSION_MATRIX[module]?.[action];
  if (!allowed) return false;
  return allowed.includes(user.role);
};

// Hides any element with data-requires="module:action" that the current
// user isn't permitted to use. Safe to call repeatedly (e.g. after a
// module re-renders a list of cards with per-row action buttons).
window.applyPermissionGating = function applyPermissionGating(root = document) {
  root.querySelectorAll("[data-requires]").forEach((el) => {
    const [module, action] = el.dataset.requires.split(":");
    el.classList.toggle("d-none", !window.canDo(module, action));
  });
};

// -------------------------------------------------------------------------
// Navbar auth state (logged-in user label, Login/Register/Logout links)
// -------------------------------------------------------------------------

async function loadNavAuthState() {
  const token = localStorage.getItem("access_token");

  const navUser = document.getElementById("navUser");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");

  if (!token) return;

  try {
    const response = await fetch("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid session");
    }

    const user = await response.json();
    window.SCNA_USER = user;

    if (navUser) navUser.textContent = `${user.email} (${user.role})`;
    logoutBtn?.classList.remove("d-none");
    loginLink?.classList.add("d-none");
    registerLink?.classList.add("d-none");

    applyNavForRole(user.role);
    window.applyPermissionGating();

    document.dispatchEvent(new CustomEvent("scna:auth-ready", { detail: user }));
  } catch {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
}

function bindNavLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  });
}

// Downloads (PDFs, CSV reports) require the Authorization header, so a plain
// <a href> won't work -- fetch as a blob and trigger the save via an object URL.
async function downloadFile(url, filename, triggerEl) {
  const originalHtml = triggerEl?.innerHTML;
  if (triggerEl) {
    triggerEl.classList.add("disabled");
    triggerEl.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
  }

  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    window.showToast?.("Error", "Unable to download the file.", "error");
  } finally {
    if (triggerEl) {
      triggerEl.classList.remove("disabled");
      triggerEl.innerHTML = originalHtml;
    }
  }
}
window.downloadFile = downloadFile;

bindNavLogout();
loadNavAuthState();

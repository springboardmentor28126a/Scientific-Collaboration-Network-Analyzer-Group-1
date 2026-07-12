export function getDashboardPathForRole(role) {
  switch (role) {
    case "SYSTEM_ADMIN":
      return "/admin/dashboard";
    case "INSTITUTION_ADMIN":
      return "/institution-admin/dashboard";
    case "RESEARCHER":
      return "/researcher/dashboard";
    case "REVIEWER":
      return "/reviewer/dashboard";
    default:
      return "/login";
  }
}
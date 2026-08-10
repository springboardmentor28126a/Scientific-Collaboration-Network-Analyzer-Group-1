// Authentication is deliberately tab-scoped. sessionStorage is isolated per
// browser tab, so logging into another account in a second tab cannot replace
// the first tab's token or user identity.
export function getAuthItem(key) {
    return sessionStorage.getItem(key);
}

export function setAuthItem(key, value) {
    sessionStorage.setItem(key, value);
}

export function removeAuthItem(key) {
    sessionStorage.removeItem(key);
}

export function getAuthUser() {
    try {
        return JSON.parse(getAuthItem("user") || "null");
    } catch {
        return null;
    }
}

export function setAuthUser(user) {
    setAuthItem("user", JSON.stringify(user));
}

export function clearAuth() {
    removeAuthItem("token");
    removeAuthItem("user");
}

function showError(message) {
  window.showToast ? window.showToast("Error", message, "error") : alert(message);
}

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(loginForm).entries());
      const data = await postJson("/users/login", payload);
      localStorage.setItem("access_token", data.access_token);
      window.location.href = "/";
    } catch (error) {
      showError(error.message);
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(registerForm).entries());
      await postJson("/users/register", payload);
      window.location.href = "/login";
    } catch (error) {
      showError(error.message);
    }
  });
}
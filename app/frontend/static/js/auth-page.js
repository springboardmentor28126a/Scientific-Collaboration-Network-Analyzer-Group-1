function showError(message) {
  window.showToast
    ? window.showToast("Error", message, "error")
    : alert(message);
}

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

// =========================
// Login
// =========================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const payload = Object.fromEntries(
        new FormData(loginForm).entries()
      );

      const data = await postJson("/users/login", payload);

      // Store authentication details
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      // Store user details
      localStorage.setItem("user_id", data.id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      // Redirect after login
      window.location.href = "/";

    } catch (error) {
      showError(error.message);
    }
  });
}

// =========================
// Register
// =========================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const payload = Object.fromEntries(
        new FormData(registerForm).entries()
      );

      await postJson("/users/register", payload);

      window.showToast?.(
        "Success",
        "Registration successful. Please login.",
        "success"
      );

      window.location.href = "/login";

    } catch (error) {
      showError(error.message);
    }
  });
}
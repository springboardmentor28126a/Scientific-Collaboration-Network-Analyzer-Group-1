function showError(message) {
  window.showToast ? window.showToast("Error", message, "error") : alert(message);
}

// -------------------------------------------------------------------------
// Cloudflare Turnstile CAPTCHA (login and register pages). The widget calls
// these globals directly via data-callback / data-expired-callback / data-
// error-callback attributes in login.html / register.html, so they're
// attached to window even though this file is loaded as a module. Only one
// of the two pages is ever loaded at a time, so a single shared token
// variable is safe.
// -------------------------------------------------------------------------
let scnaTurnstileToken = null;

window.scnaOnTurnstileSuccess = function (token) {
  scnaTurnstileToken = token;
};

window.scnaOnTurnstileExpired = function () {
  scnaTurnstileToken = null;
};

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

    // Only require a completed CAPTCHA if the widget is actually present
    // on the page (i.e. TURNSTILE_SITE_KEY is configured server-side).
    const captchaWidgetPresent = !!document.querySelector(".cf-turnstile");
    if (captchaWidgetPresent && !scnaTurnstileToken) {
      showError("Please complete the CAPTCHA before logging in.");
      return;
    }

    try {
      const payload = Object.fromEntries(new FormData(loginForm).entries());
      payload.captcha_token = scnaTurnstileToken;

      const data = await postJson("/users/login", payload);
      localStorage.setItem("access_token", data.access_token);
      window.location.href = "/";
    } catch (error) {
      showError(error.message);
      // A rejected/expired token can't be reused -- force a fresh
      // CAPTCHA solve before the next login attempt.
      if (window.turnstile && captchaWidgetPresent) {
        window.turnstile.reset();
      }
      scnaTurnstileToken = null;
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Only require a completed CAPTCHA if the widget is actually present
    // on the page (i.e. TURNSTILE_SITE_KEY is configured server-side).
    const captchaWidgetPresent = !!document.querySelector(".cf-turnstile");
    if (captchaWidgetPresent && !scnaTurnstileToken) {
      showError("Please complete the CAPTCHA before registering.");
      return;
    }

    try {
      const payload = Object.fromEntries(new FormData(registerForm).entries());
      payload.captcha_token = scnaTurnstileToken;

      await postJson("/users/register", payload);
      window.location.href = "/login";
    } catch (error) {
      showError(error.message);
      // A rejected/expired token can't be reused -- force a fresh
      // CAPTCHA solve before the next register attempt.
      if (window.turnstile && captchaWidgetPresent) {
        window.turnstile.reset();
      }
      scnaTurnstileToken = null;
    }
  });
}

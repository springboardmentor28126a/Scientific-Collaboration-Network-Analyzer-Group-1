import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const SCRIPT_URL = "https://www.google.com/recaptcha/api.js?render=explicit";
let recaptchaScriptPromise;

function waitForRecaptchaApi(timeoutMs = 10000) {
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") return Promise.resolve(window.grecaptcha);
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = () => {
            if (window.grecaptcha && typeof window.grecaptcha.render === "function") resolve(window.grecaptcha);
            else if (Date.now() - startedAt >= timeoutMs) reject(new Error("Google reCAPTCHA render API is unavailable."));
            else window.setTimeout(check, 50);
        };
        check();
    });
}

function loadScript() {
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") return Promise.resolve(window.grecaptcha);
    if (recaptchaScriptPromise) return recaptchaScriptPromise;
    recaptchaScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
        const script = existing || document.createElement("script");
        const resolveProvider = () => waitForRecaptchaApi().then(resolve, reject);
        if (existing) {
            waitForRecaptchaApi().then(resolve, reject);
        } else {
            script.addEventListener("load", resolveProvider, { once: true });
        }
        script.addEventListener("error", () => reject(new Error("Google reCAPTCHA script failed to load.")), { once: true });
        if (!existing) {
            script.src = SCRIPT_URL;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    });
    recaptchaScriptPromise.catch(() => { recaptchaScriptPromise = undefined; });
    return recaptchaScriptPromise;
}

function reportProviderError(error) {
    // Safe diagnostic: never include the site/secret key or CAPTCHA token.
    console.warn("[SCNA CAPTCHA] Google reCAPTCHA initialization failed", {
        message: error instanceof Error ? error.message.slice(0, 160) : "unknown provider error",
    });
}

function reportProviderState(siteKey) {
    console.info("[SCNA CAPTCHA] Provider state", {
        mode: "recaptcha",
        siteKeyPresent: Boolean(siteKey),
        grecaptchaPresent: Boolean(window.grecaptcha),
        renderAvailable: Boolean(window.grecaptcha && typeof window.grecaptcha.render === "function"),
        readyAvailable: Boolean(window.grecaptcha && typeof window.grecaptcha.ready === "function"),
    });
}

export default function CaptchaWidget({ onChange, resetSignal = 0 }) {
    const configuredMode = (import.meta.env.VITE_CAPTCHA_MODE || "development").toLowerCase();
    const [config, setConfig] = useState(() => configuredMode === "recaptcha"
        ? { mode: "recaptcha", site_key: import.meta.env.VITE_CAPTCHA_SITE_KEY, required: true }
        : null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answer, setAnswer] = useState("");
    const [challengeRefresh, setChallengeRefresh] = useState(0);
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const siteKey = config?.site_key || import.meta.env.VITE_CAPTCHA_SITE_KEY;

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        if (configuredMode === "recaptcha") {
            setLoading(false);
            return () => { active = false; };
        }
        api.get("/auth/captcha").then(({ data }) => {
            if (active) setConfig(data);
        }).catch(() => {
            if (active) setError("Unable to load CAPTCHA. Please try again.");
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [configuredMode, resetSignal, challengeRefresh]);

    useEffect(() => {
        if (!config || config.mode !== "recaptcha" || !siteKey || !containerRef.current) return undefined;
        let active = true;
        setLoading(true);
        reportProviderState(siteKey);
        loadScript().then((grecaptcha) => {
            if (!grecaptcha || typeof grecaptcha.render !== "function") throw new Error("Google reCAPTCHA render API is unavailable.");
            if (typeof grecaptcha.ready !== "function") throw new Error("Google reCAPTCHA ready API is unavailable.");
            return new Promise((resolve) => grecaptcha.ready(() => waitForRecaptchaApi().then(resolve)));
        }).then((grecaptcha) => {
            if (!active || !containerRef.current) return;
            containerRef.current.replaceChildren();
            try {
                widgetRef.current = grecaptcha.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token) => onChange({ token, captcha: config }),
                    "expired-callback": () => onChange({ token: "", captcha: config, expired: true }),
                    "error-callback": () => {
                        const providerError = new Error("Google rejected the CAPTCHA widget configuration or hostname.");
                        reportProviderError(providerError);
                        setError("CAPTCHA configuration is invalid.");
                        onChange({ token: "", captcha: config, error: true });
                    },
                });
                setLoading(false);
            } catch (error) {
                reportProviderError(error);
                if (active) {
                    setLoading(false);
                    setError("CAPTCHA configuration is invalid.");
                }
            }
        }).catch((error) => {
            reportProviderError(error);
            if (active) { setLoading(false); setError("CAPTCHA could not load. Please refresh and try again."); }
        });
        return () => {
            active = false;
            if (window.grecaptcha && widgetRef.current !== null) window.grecaptcha.reset(widgetRef.current);
            widgetRef.current = null;
        };
    }, [config, onChange, siteKey]);

    const handleAnswer = (event) => {
        const value = event.target.value;
        setAnswer(value);
        onChange({ token: "", captcha: config, answer: value });
    };

    return <div className="captcha-area" aria-live="polite">
        {loading && <p className="captcha-status">Loading CAPTCHA…</p>}
        {config?.mode === "recaptcha" && <div ref={containerRef} />}
        {config?.mode === "development" && !loading && <>
            <img src={config.image} alt="CAPTCHA challenge" className="captcha-image" />
            <button type="button" onClick={() => { setAnswer(""); setChallengeRefresh((value) => value + 1); }}>Refresh CAPTCHA</button>
            <input type="text" value={answer} onChange={handleAnswer} placeholder="Enter CAPTCHA" autoComplete="off" />
        </>}
        {error && <p className="error-text">{error}</p>}
    </div>;
}

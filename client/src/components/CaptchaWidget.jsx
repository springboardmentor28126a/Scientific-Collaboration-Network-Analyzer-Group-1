import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function CaptchaWidget({ onChange, resetSignal = 0 }) {
    const [challenge, setChallenge] = useState(null);
    const [answer, setAnswer] = useState("");
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const onChangeRef = useRef(onChange);
    const requestSequence = useRef(0);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const loadChallenge = useCallback(async (replaceId = "") => {
        const sequence = requestSequence.current + 1;
        requestSequence.current = sequence;
        setLoading(true); setVerifying(false); setVerified(false); setAnswer(""); setError("");
        onChangeRef.current({ captcha_verification: "", captcha: { required: true }, captcha_id: "", captcha_answer: "" });
        try {
            const query = replaceId ? `?replace_id=${encodeURIComponent(replaceId)}` : "";
            const response = await api.get(`/auth/captcha${query}`);
            if (sequence === requestSequence.current) setChallenge(response.data);
        } catch {
            if (sequence === requestSequence.current) setError("Unable to load CAPTCHA. Please try again.");
        } finally {
            if (sequence === requestSequence.current) setLoading(false);
        }
    }, []);

    useEffect(() => { loadChallenge(); }, [loadChallenge, resetSignal]);

    const verify = async () => {
        if (!challenge?.captcha_id || !answer.trim() || verifying || verified) return;
        setVerifying(true); setError("");
        try {
            const response = await api.post("/auth/captcha/verify", { captcha_id: challenge.captcha_id, captcha_answer: answer.trim() });
            setVerified(true);
            onChangeRef.current({ captcha_verification: response.data.captcha_verification, captcha: { required: true, mode: "alphanumeric", captcha_id: challenge.captcha_id }, captcha_id: challenge.captcha_id, captcha_answer: "" });
        } catch (requestError) {
            setVerified(false);
            onChangeRef.current({ captcha_verification: "", captcha: { required: true }, captcha_id: "", captcha_answer: "" });
            setError(requestError.response?.data?.detail === "CAPTCHA verification failed." ? "Incorrect or expired CAPTCHA. Please try again or refresh it." : "CAPTCHA verification is temporarily unavailable. Please try again.");
        } finally { setVerifying(false); }
    };

    return <div className="captcha-area alphanumeric-captcha" aria-live="polite">
        <div className="captcha-heading"><strong>Security Verification</strong><span>Enter the characters shown below.</span></div>
        {loading && <p className="captcha-status" role="status">Loading CAPTCHA…</p>}
        {!loading && challenge && <>
            <div className="captcha-challenge" aria-label="CAPTCHA challenge">{challenge.challenge}</div>
            <label className="sr-only" htmlFor="captcha-answer">Enter CAPTCHA</label>
            <input id="captcha-answer" type="text" value={answer} onChange={(event) => { setAnswer(event.target.value); setError(""); }} placeholder="Enter CAPTCHA" autoComplete="off" maxLength={6} disabled={verified || verifying} />
            <div className="captcha-actions"><button type="button" onClick={verify} disabled={verified || verifying || !answer.trim()}>{verifying ? "Verifying…" : "Verify"}</button><button type="button" className="captcha-refresh" onClick={() => loadChallenge(challenge.captcha_id)} disabled={verifying}>↻ Refresh</button></div>
        </>}
        {verified && <p className="captcha-success" role="status">✓ CAPTCHA verified</p>}
        {error && <p className="error-text" role="alert">{error}</p>}
    </div>;
}

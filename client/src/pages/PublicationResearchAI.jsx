import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const listValue = (value) => Array.isArray(value) ? value : value ? [value] : [];

export default function PublicationResearchAI() {
    const { publicationId } = useParams();
    const [publication, setPublication] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState("");
    const [unavailable, setUnavailable] = useState(false);

    // The loader intentionally follows the publication route parameter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadPublication(); }, [publicationId]);

    const loadPublication = async () => {
        setLoading(true); setError("");
        try {
            const response = await API.get(`/publications/details/${publicationId}`);
            setPublication(response.data.publication);
        } catch { setError("This publication could not be loaded."); }
        finally { setLoading(false); }
    };

    const analyze = async () => {
        setLoading(true); setError(""); setUnavailable(false); setAnalysis(null);
        try {
            const response = await API.get(`/ai/publication/${publicationId}/analysis`);
            setAnalysis(response.data.analysis || {});
        } catch (requestError) {
            const detail = requestError.response?.data?.detail;
            if (detail === "AI_NOT_CONFIGURED" || detail === "AI_PROVIDER_ERROR") setUnavailable(true);
            else setError(detail || "Unable to analyze this publication.");
        } finally { setLoading(false); }
    };

    const ask = async (event) => {
        event.preventDefault(); if (!question.trim()) return;
        const current = question.trim(); setQuestion(""); setAsking(true); setError("");
        setMessages((items) => [...items, { role: "user", text: current }]);
        try {
            const response = await API.post(`/ai/publication/${publicationId}/ask`, { question: current });
            setMessages((items) => [...items, { role: "assistant", text: response.data.answer }]);
        } catch (requestError) {
            const detail = requestError.response?.data?.detail;
            setError(detail === "AI_NOT_CONFIGURED" ? "AI is currently unavailable." : detail || "The publication assistant is temporarily unavailable.");
        } finally { setAsking(false); }
    };

    if (loading && !publication) return <section className="page-container"><h1>Publication Research Assistant</h1><p>Loading publication...</p></section>;
    if (!publication) return <section className="page-container"><h1>Publication Research Assistant</h1><p className="server-error">{error || "Publication not found."}</p></section>;

    return <section className="page-container"><div style={{ marginBottom: "24px" }}><h1>Publication Research Assistant</h1><p style={{ color: "var(--muted)" }}>AI analysis is grounded only in the authorized publication content.</p></div><div className="card-surface" style={{ padding: "24px" }}><h2>{publication.title}</h2><p><strong>Authors:</strong> {publication.authors}</p><p style={{ color: "var(--muted)" }}>{[publication.journal, publication.publication_year, publication.status].filter(Boolean).join(" · ")}</p><button type="button" onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze Publication"}</button></div>{unavailable && <div className="card-surface" style={{ padding: "22px", marginTop: "20px" }}><h2>AI unavailable</h2><p>The AI provider is not available right now. You can retry when it is configured or available.</p><button type="button" onClick={analyze}>Retry</button></div>}{error && !unavailable && <p className="server-error" style={{ marginTop: "18px" }}>{error}</p>}{analysis && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px", marginTop: "20px" }}><AnalysisCard title="AI Summary" value={analysis.summary} /><AnalysisCard title="Research Problem" value={analysis.research_problem} /><AnalysisCard title="Methodology" value={analysis.methodology} /><AnalysisCard title="Major Findings" value={analysis.major_findings} /><AnalysisCard title="Conclusion" value={analysis.conclusion} /><AnalysisCard title="Research Topic" value={analysis.research_topic} /><AnalysisCard title="Research Objectives" value={analysis.objectives} /><AnalysisCard title="Research Domain" value={analysis.research_domain} /><AnalysisCard title="Keywords" value={analysis.keywords || publication.keywords} /><AnalysisCard title="Research Gaps (AI-generated analysis)" value={analysis.research_gaps} /><AnalysisCard title="Future Research Suggestions" value={analysis.future_research} /></div>}<div className="card-surface" style={{ padding: "22px", marginTop: "24px" }}><h2>Ask About This Publication</h2><div style={{ minHeight: "60px" }}>{messages.length === 0 ? <p style={{ color: "var(--muted)" }}>Ask about the methodology, findings, limitations, or another detail from this publication.</p> : messages.map((message, index) => <p key={index}><strong>{message.role === "user" ? "You" : "SCNA AI"}:</strong> {message.text}</p>)}</div><form onSubmit={ask} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about this publication" style={{ flex: 1, minWidth: "240px" }} /><button type="submit" disabled={asking}>{asking ? "Asking..." : "Ask AI"}</button></form></div></section>;
}

function AnalysisCard({ title, value }) {
    const items = listValue(value);
    return <div className="card-surface" style={{ padding: "20px" }}><h2>{title}</h2>{items.length ? (items.length === 1 ? <p>{items[0]}</p> : <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>) : <p style={{ color: "var(--muted)" }}>Not available in the publication content.</p>}</div>;
}

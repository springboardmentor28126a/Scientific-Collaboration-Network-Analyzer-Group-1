import { useEffect, useState } from "react";
import api from "../services/api";

export default function ResearchAI() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [available, setAvailable] = useState(null);
    useEffect(() => { api.get("/ai/status").then((response) => setAvailable(response.data.available)).catch(() => setAvailable(false)); }, []);
    const ask = async (event) => {
        event.preventDefault(); if (!question.trim()) return;
        const current = question; setQuestion(""); setLoading(true); setError("");
        setMessages((items) => [...items, { role: "user", text: current }]);
        try { const response = await api.post("/ai/chat", { question: current }); setMessages((items) => [...items, { role: "assistant", text: response.data.answer }]); }
        catch (requestError) { setError(requestError.response?.data?.detail === "AI_NOT_CONFIGURED" ? "Research AI is currently unavailable." : "The research assistant is temporarily unavailable. Please try again later."); }
        finally { setLoading(false); }
    };
    if (available === false) return <section><h1>SCNA Research AI</h1><p>Your research assistant for publications, collaborations and research insights.</p><p>Research AI is currently unavailable.</p></section>;
    return <section><h1>SCNA Research AI</h1><p>Your research assistant for publications, collaborations and research insights.</p><div>{messages.map((message, index) => <p key={index}><strong>{message.role === "user" ? "You" : "SCNA AI"}:</strong> {message.text}</p>)}</div><div>{["Suggest research areas based on my interests", "Find potential collaborators", "Summarize my publication profile"].map((prompt) => <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>)}</div><form onSubmit={ask}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a research question..." rows="4" /><button disabled={loading}>{loading ? "Thinking..." : "Send"}</button></form>{error && <p className="server-error">{error}</p>}</section>;
}

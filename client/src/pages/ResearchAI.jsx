import { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaFlask, FaMagic, FaPlus, FaRobot, FaUser } from "react-icons/fa";
import api from "../services/api";
import "./ResearchAI.css";

const suggestedPrompts = [
    "Find researchers working on machine learning",
    "Suggest potential collaborators for my research",
    "Analyze recent publication trends",
    "Explain a publication",
    "Identify research gaps in my area",
];

function getFriendlyError(requestError) {
    const detail = requestError.response?.data?.detail;
    if (requestError.response?.status === 429 || detail === "AI_RATE_LIMITED") {
        return "AI service is temporarily rate limited. Please try again in a moment.";
    }
    if (["AI_NOT_CONFIGURED", "AI_PROVIDER_ERROR", "AI_AUTH_ERROR", "AI_PAYMENT_REQUIRED"].includes(detail)) {
        return "Research AI is temporarily unavailable. Please try again later.";
    }
    if (detail === "AI_INVALID_RESPONSE" || detail === "AI_EMPTY_RESPONSE") {
        return "Research AI did not return a response. Please try again.";
    }
    if (!requestError.response) {
        return "Unable to connect to Research AI. Please check your connection and try again.";
    }
    return "Research AI is temporarily unavailable. Please try again later.";
}

export default function ResearchAI() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [available, setAvailable] = useState(null);
    const messagesEndRef = useRef(null);
    const composerRef = useRef(null);

    useEffect(() => {
        api.get("/ai/status")
            .then((response) => setAvailable(response.data.available === true))
            .catch(() => setAvailable(false));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, loading]);

    const ask = async (event) => {
        event?.preventDefault();
        const current = question.trim();
        if (!current || loading) return;

        setQuestion("");
        setLoading(true);
        setError("");
        setMessages((items) => [...items, { role: "user", text: current }]);

        try {
            const response = await api.post("/ai/chat", { question: current });
            const answer = response.data?.answer?.trim();
            if (!answer) {
                setError("Research AI did not return a response. Please try again.");
                return;
            }
            setMessages((items) => [...items, { role: "assistant", text: answer }]);
        } catch (requestError) {
            setError(getFriendlyError(requestError));
        } finally {
            setLoading(false);
        }
    };

    const handleComposerKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            ask(event);
        }
    };

    const useSuggestion = (prompt) => {
        setQuestion(prompt);
        setError("");
        requestAnimationFrame(() => composerRef.current?.focus());
    };

    const clearConversation = () => {
        setMessages([]);
        setQuestion("");
        setError("");
        requestAnimationFrame(() => composerRef.current?.focus());
    };

    if (available === null) {
        return <section className="page-container ai-page"><div className="ai-loading-page" role="status"><FaFlask aria-hidden="true" /><span>Checking Research AI availability...</span></div></section>;
    }

    return (
        <section className="page-container ai-page">
            <div className="ai-header">
                <div className="ai-header-copy">
                    <div className="ai-title-row"><span className="ai-title-icon" aria-hidden="true"><FaFlask /></span><div><p className="ai-eyebrow">Research assistant</p><h1>SCNA Research AI</h1></div></div>
                    <p>AI-powered research assistant for your collaboration network</p>
                </div>
                <div className={`ai-status ${available ? "is-ready" : "is-unavailable"}`} role="status"><span className="ai-status-dot" aria-hidden="true" />{available ? "Ready to assist" : "Temporarily unavailable"}</div>
            </div>

            {!available && <div className="ai-alert" role="alert"><FaFlask aria-hidden="true" /><span>Research AI is temporarily unavailable. Please try again later.</span></div>}

            <div className="ai-chat-shell">
                <div className="ai-chat-toolbar"><div><strong>Conversation</strong><span>Explore publications, people, and research directions.</span></div><button type="button" className="ai-clear-button" onClick={clearConversation} disabled={!messages.length && !question}><FaPlus aria-hidden="true" /> New Chat</button></div>
                <div className="ai-message-area" aria-live="polite" aria-label="Research AI conversation">
                    {!messages.length ? <EmptyState onSuggestion={useSuggestion} disabled={!available} /> : messages.map((message, index) => <Message key={`${message.role}-${index}`} message={message} />)}
                    {loading && <div className="ai-message ai-message-assistant"><div className="ai-avatar" aria-hidden="true"><FaRobot /></div><div className="ai-message-body"><span className="ai-message-label">SCNA Research AI</span><div className="ai-thinking" role="status"><span /><span /><span /> Research AI is thinking...</div></div></div>}
                    <div ref={messagesEndRef} />
                </div>

                {error && <div className="ai-error" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error">Dismiss</button></div>}
                <form className="ai-composer" onSubmit={ask}>
                    <label className="sr-only" htmlFor="research-ai-question">Ask Research AI</label>
                    <textarea id="research-ai-question" ref={composerRef} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleComposerKeyDown} placeholder={available ? "Ask about your research, publications, or collaborations..." : "Research AI is currently unavailable"} rows={2} disabled={!available || loading} aria-describedby="ai-composer-hint" />
                    <div className="ai-composer-footer"><span id="ai-composer-hint">Enter to send · Shift+Enter for a new line</span><button type="submit" className="ai-send-button" disabled={!available || loading || !question.trim()} aria-label={loading ? "Research AI is thinking" : "Send message"}>{loading ? "Thinking..." : <><FaArrowUp aria-hidden="true" /> Send</>}</button></div>
                </form>
            </div>
        </section>
    );
}

function EmptyState({ onSuggestion, disabled }) {
    return <div className="ai-empty-state"><div className="ai-empty-icon" aria-hidden="true"><FaMagic /></div><h2>What would you like to explore?</h2><p>Ask Research AI to help you discover collaborators, understand publications, and find new research directions.</p><div className="ai-suggestions" aria-label="Suggested research questions">{suggestedPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => onSuggestion(prompt)} disabled={disabled}>{prompt}</button>)}</div></div>;
}

function Message({ message }) {
    const isUser = message.role === "user";
    return <div className={`ai-message ${isUser ? "ai-message-user" : "ai-message-assistant"}`}><div className="ai-avatar" aria-hidden="true">{isUser ? <FaUser /> : <FaRobot />}</div><div className="ai-message-body"><span className="ai-message-label">{isUser ? "You" : "SCNA Research AI"}</span><div className="ai-message-text">{message.text}</div></div></div>;
}

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { fetchChatMessages, sendChatMessage } from "../../services/messageService";

function ChatModal({ collaboration, myResearcherId, otherResearcherName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000); // poll every 4s
    return () => clearInterval(interval);
  }, [collaboration.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await fetchChatMessages(collaboration.id);
      setMessages(data);
    } catch (err) {
      // silent on poll failures
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    try {
      await sendChatMessage(collaboration.id, input.trim());
      setInput("");
      await loadMessages();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-box chat-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h5 className="fw-bold mb-0">Chat with {otherResearcherName}</h5>
          <button className="btn-text-danger" onClick={onClose}>Close</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="text-muted text-center small">No messages yet. Say hello!</p>
          ) : (
            messages.map((m) => {
              const isMine = m.sender.id === myResearcherId;
              return (
                <div key={m.id} className={`chat-bubble-row ${isMine ? "chat-bubble-row-mine" : ""}`}>
                  <div className={`chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                    <div className="chat-bubble-text">{m.content}</div>
                    <div className="chat-bubble-time">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button type="submit" className="btn-primary btn-sm" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;
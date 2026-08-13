import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { fetchConversation, sendMessage } from "../../services/messageService";

function ChatWindow({ otherResearcherId, otherName, myResearcherId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    try {
      const data = await fetchConversation(otherResearcherId);
      setMessages(data);
    } catch (err) {
      toast.error("Could not load messages.");
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [otherResearcherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await sendMessage(otherResearcherId, input);
      setInput("");
      loadMessages();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send message.");
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Chat with {otherName}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="border rounded-3 p-2 mb-3" style={{ height: "350px", overflowY: "auto" }}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`d-flex mb-2 ${m.sender_id === myResearcherId ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-3 ${m.sender_id === myResearcherId ? "bg-primary text-white" : "bg-light"}`}
                style={{ maxWidth: "70%" }}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="d-flex gap-2">
          <input
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
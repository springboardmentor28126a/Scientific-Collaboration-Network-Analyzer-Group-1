import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function GroupChat() {
    const { groupId } = useParams();

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    // Replace with logged-in user later
    const user = JSON.parse(localStorage.getItem("user"));

const senderId = user?.id;

    const bottomRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/group/${groupId}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;
        if (!senderId) {
    alert("Please login again.");
    return;
}

        try {
            await api.post("/chat/send", {
                group_id: Number(groupId),
                sender_id: senderId,
                message: message
            });

            setMessage("");
            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
        fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
}, [groupId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

   return (
    <div
        style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "#f5f7fb"
        }}
    >
        {/* Header */}
        <div
            style={{
                padding: "18px 25px",
                background: "#2563eb",
                color: "white",
                fontSize: "22px",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,.2)"
            }}
        >
            💬 Research Group Chat
        </div>

        {/* Messages */}
        <div
            style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px"
            }}
        >
            {messages.map((msg) => {

                const isMe = msg.sender_id === senderId;

                return (
                    <div
                        key={msg.id}
                        style={{
                            display: "flex",
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            marginBottom: "15px"
                        }}
                    >
                        <div
                            style={{
                                background: isMe ? "#2563eb" : "#ffffff",
                                color: isMe ? "#ffffff" : "#000000",
                                borderRadius: "16px",
                                padding: "12px 16px",
                                maxWidth: "60%",
                                boxShadow: "0 2px 8px rgba(0,0,0,.1)"
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: "bold",
                                    marginBottom: "6px",
                                    color: isMe ? "#ffffff" : "#2563eb"
                                }}
                            >
                                {msg.sender_name}
                            </div>

                            <div
                                style={{
                                    wordBreak: "break-word",
                                    lineHeight: "1.5"
                                }}
                            >
                                {msg.message}
                            </div>

                            <div
                                style={{
                                    marginTop: "8px",
                                    fontSize: "11px",
                                    opacity: 0.8,
                                    textAlign: "right"
                                }}
                            >
                                {new Date(msg.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                );

            })}

            <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div
            style={{
                display: "flex",
                padding: "15px",
                background: "white",
                borderTop: "1px solid #ddd"
            }}
        >
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
                placeholder="Type your message..."
                style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    outline: "none",
                    fontSize: "16px"
                }}
            />

            <button
                onClick={sendMessage}
                style={{
                    marginLeft: "12px",
                    padding: "0 28px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#2563eb",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer"
                }}
            >
                Send
            </button>
        </div>
    </div>
);
}
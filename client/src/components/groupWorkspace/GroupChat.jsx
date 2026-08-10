import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { getAuthUser } from "../../utils/authStorage";

export default function GroupChat({ groupId }) {
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const user = getAuthUser();
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

    if (sending) return;

    setSending(true);

    try {

        await api.post("/chat/send", {

            group_id: Number(groupId),

            sender_id: senderId,

            message

        });

        setMessage("");

        fetchMessages();

    }

    catch (err) {

        console.error(err);

    }

    finally {

        setSending(false);

    }

};

    useEffect(() => {

    if (!groupId) return;

    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [groupId]);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages]);

    return (

        <div
            style={{
                background: "#fff",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,.08)",
                display: "flex",
                flexDirection: "column",
                height: "70vh"
            }}
        >

            {/* Header */}

            <div
                style={{
                    padding: "18px 25px",
                    background: "#2563eb",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px"
                }}
            >
                💬 Group Chat
            </div>

            {/* Messages */}

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    background: "#f5f7fb"
                }}
            >
{
messages.length === 0 && (

<div
    style={{
        textAlign: "center",
        marginTop: "80px",
        color: "#888"
    }}
>

<h2>Start the conversation 👋</h2>

<p>No messages yet.</p>

</div>

)
}
                {

                    messages.map(msg => {

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
                                        color: isMe ? "#fff" : "#000",
                                        borderRadius: "16px",
                                        padding: "12px 16px",
                                        maxWidth: "65%",
                                        boxShadow: "0 2px 8px rgba(0,0,0,.1)"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            color: isMe ? "#fff" : "#2563eb",
                                            marginBottom: "6px"
                                        }}
                                    >
                                        {msg.sender_name}
                                    </div>

                                    <div>

                                        {msg.message}

                                    </div>

                                    <div
                                        style={{
                                            fontSize: "11px",
                                            marginTop: "8px",
                                            textAlign: "right",
                                            opacity: .75
                                        }}
                                    >

                                        {new Date(msg.created_at).toLocaleString()}

                                    </div>

                                </div>

                            </div>

                        );

                    })

                }

                <div ref={bottomRef}></div>

            </div>

            {/* Input */}

            <div
                style={{
                    display: "flex",
                    padding: "15px",
                    borderTop: "1px solid #ddd",
                    background: "#fff"
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
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        outline: "none"
                    }}
                />
                <button
    disabled={sending}
    onClick={sendMessage}
>
    {sending ? "Sending..." : "Send"}
</button>
                <button
                    onClick={sendMessage}
                    style={{
                        marginLeft: "12px",
                        padding: "0 25px",
                        border: "none",
                        borderRadius: "10px",
                        background: "#2563eb",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >

                    Send

                </button>

            </div>

        </div>

    );

}

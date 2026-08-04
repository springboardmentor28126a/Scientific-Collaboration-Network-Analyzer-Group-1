import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function GroupChat() {

    const { groupId } = useParams();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState("");

    useEffect(() => {

        loadMessages();

        const interval = setInterval(() => {

            loadMessages();

        }, 2000);

        return () => clearInterval(interval);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMessages = async () => {

        try {

            const response = await api.get(
    `/chat/group/${groupId}`
);

            setMessages(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const sendMessage = async () => {

        if (!message.trim()) return;

        try {

            await api.post("/chat/send", {

    group_id: groupId,

    sender_id: user.id,

    message

});

            setMessage("");

            loadMessages();

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div>

            <h1>

                💬 Research Chat

            </h1>

            <div
                style={{
                    height: "450px",
                    overflowY: "auto",
                    border: "1px solid var(--border)",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "var(--surface)",
                    marginBottom: "20px",
                    color: "var(--text)"
                }}
            >

                {

                    messages.map((msg) => (

                        <div
                            key={msg.id}
                            style={{

                                display: "flex",

                                justifyContent:

                                    msg.sender_id === user.id

                                        ? "flex-end"

                                        : "flex-start",

                                marginBottom: "15px"

                            }}
                        >

                                <div
                                style={{
                                    background:
                                        msg.sender_id === user.id
                                            ? "var(--accent)"
                                            : "rgba(255,255,255,0.08)",
                                    color:
                                        msg.sender_id === user.id
                                            ? "white"
                                            : "var(--text)",

                                    padding: "12px 15px",

                                    borderRadius: "15px",

                                    maxWidth: "320px",

                                    wordWrap: "break-word",

                                    boxShadow:

                                        "0 2px 8px rgba(0,0,0,.1)"

                                }}
                            >

                                <strong>

                                    👤 {msg.sender_name}

                                </strong>

                                <br />

                                <span>

                                    {msg.message}

                                </span>

                            </div>

                        </div>

                    ))

                }

            </div>

            <div
                style={{
                    display: "flex",
                    gap: "10px"
                }}
            >

                <input

                    type="text"

                    value={message}

                    onChange={(e) =>

                        setMessage(e.target.value)

                    }

                    placeholder="Type your message..."

                    style={{

                        flex: 1,

                        padding: "12px",

                        borderRadius: "10px",

                        border: "1px solid #ccc"

                    }}

                    onKeyDown={(e) => {

                        if (e.key === "Enter") {

                            sendMessage();

                        }

                    }}

                />

                <button

                    onClick={sendMessage}

                    style={{

                        background: "#2563eb",

                        color: "white",

                        border: "none",

                        borderRadius: "10px",

                        padding: "12px 20px",

                        cursor: "pointer"

                    }}

                >

                    Send

                </button>

            </div>

        </div>

    );

}

export default GroupChat;

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function Chat() {

    const { id } = useParams();

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

    }, []);

    const loadMessages = async () => {

        try {

            const response = await api.get(
                `/chat/${id}`
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

                collaboration_id: id,

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
                    border: "1px solid #ddd",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#f5f7fb",
                    marginBottom: "20px"
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

                                            ? "#2563eb"

                                            : "#e5e7eb",

                                    color:

                                        msg.sender_id === user.id

                                            ? "white"

                                            : "black",

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

export default Chat;
import { useEffect, useRef, useState } from "react";
import API from "../services/api";

export default function Chat() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const bottomRef = useRef(null);
    const [friendSearch, setFriendSearch] = useState("");
useEffect(() => {

    loadFriends();

}, []);
useEffect(() => {

    bottomRef.current?.scrollIntoView({
        behavior: "smooth"
    });

}, [messages]);
useEffect(() => {

    if (!selectedFriend) return;

    loadMessages(selectedFriend.conversation_id);

    const interval = setInterval(() => {

        loadMessages(selectedFriend.conversation_id);

    }, 2000);

    return () => clearInterval(interval);

}, [selectedFriend]);

    const loadFriends = async () => {

        try {

            const res = await API.get(
                `/friends/list/${user.id}`
            );
            console.log("Friends:", res.data);
            setFriends(res.data);
            

        } catch (err) {

            console.error(err);

        }

    };
    const loadMessages = async (conversationId) => {

    try {

        const res = await API.get(
            `/private-chat/${conversationId}`
        );

        setMessages(res.data);

    } catch (err) {

        console.error(err);

    }

};
const sendMessage = async () => {

    if (!message.trim() || !selectedFriend) return;

    try {

        await API.post("/private-chat/send", {

            conversation_id: selectedFriend.conversation_id,

            sender_id: user.id,

            message: message

        });

        setMessage("");

        loadMessages(selectedFriend.conversation_id);

    } catch (err) {

        console.error(err);

    }

};
const filteredFriends = friends.filter(friend =>
    friend.name
        ?.toLowerCase()
        .includes(friendSearch.toLowerCase())
);
console.log("Friends State:", friends);
    return (

        <div
            style={{
                display: "flex",
                height: "85vh"
            }}
        >

            {/* LEFT PANEL */}

            <div
                style={{
                    width: "320px",
                    borderRight: "1px solid #ddd",
                    padding: "20px",
                    overflowY: "auto"
                }}
            >

                <h2>💬 Chats</h2>
                <input
    type="text"
    placeholder="🔍 Search Friend..."
    value={friendSearch}
    onChange={(e) => setFriendSearch(e.target.value)}
    style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        marginBottom: "20px",
        outline: "none",
        boxSizing: "border-box"
    }}
/>

                {friends.length === 0 ? (

                    <p>No Friends Yet</p>

                ) : (

                    filteredFriends.map(friend => (

                        <div
                            key={friend.user_id}
                            onClick={() => {

    setSelectedFriend(friend);

    loadMessages(friend.conversation_id);

}}
                            style={{
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "0.25s",

    background:
        selectedFriend?.user_id === friend.user_id
            ? "#2563eb"
            : "#ffffff",

    color:
        selectedFriend?.user_id === friend.user_id
            ? "white"
            : "black",

    border:
        selectedFriend?.user_id === friend.user_id
            ? "none"
            : "1px solid #ddd"
}}
                        >

                            <h4>{friend.name}</h4>

                            <p>{friend.institution}</p>

                        </div>

                    ))

                )}

            </div>

            {/* RIGHT PANEL */}

            <div
    style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px"
    }}
>

    {!selectedFriend ? (

        <h2>Select a Friend</h2>

    ) : (

        <>

            <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: "15px",
        borderBottom: "1px solid #ddd",
        marginBottom: "15px"
    }}
>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "15px"
        }}
    >

        <div
            style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "22px",
                fontWeight: "bold"
            }}
        >
            {selectedFriend.name.charAt(0).toUpperCase()}
        </div>

        <div>

            <h3 style={{ margin: 0 }}>
                {selectedFriend.name}
            </h3>

            <small style={{ color: "#888" }}>
                Friend
            </small>

        </div>

    </div>

</div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    marginTop: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px"
                }}
            >

                {messages.map(msg => (

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
            : "#f4f4f4",

    color:
        msg.sender_id === user.id
            ? "white"
            : "#222",

    padding: "12px 16px",

    borderRadius: "18px",

    maxWidth: "420px",

    boxShadow: "0 2px 8px rgba(0,0,0,.08)"
}}
                        >

                            {msg.message}
                            <div
    style={{
        fontSize: "11px",
        marginTop: "6px",
        opacity: 0.7,
        textAlign: "right"
    }}
>

    {new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })}

</div>

                        </div>

                    </div>

                ))}
                <div ref={bottomRef}></div>

            </div>

        </>

    )}
   <div
    style={{
        display: "flex",
        gap: "10px",
        paddingTop: "15px",
        borderTop: "1px solid #ddd",
        marginTop: "15px"
    }}
>

    <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
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
    disabled={!message.trim()}
    style={{
        padding: "12px 24px",
        background: message.trim()
            ? "#2563eb"
            : "#bfc8d8",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: message.trim()
            ? "pointer"
            : "not-allowed"
    }}
>

        Send

    </button>

</div>

</div>

        </div>

    );

}
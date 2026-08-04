import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Collaborations() {
    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [sentRequests, setSentRequests] = useState([]);

const [receivedRequests, setReceivedRequests] = useState([]);

const [collaborations, setCollaborations] = useState([]);

    useEffect(() => {

    loadDashboard();

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

   const loadDashboard = async () => {

    try {

        const [sent, received, collabs] = await Promise.all([

            api.get(`/friends/sent/${user.id}`),

            api.get(`/friends/requests/${user.id}`),

            api.get(`/friends/list/${user.id}`)

        ]);

        setSentRequests(sent.data);

        setReceivedRequests(received.data);

        setCollaborations(collabs.data);

    }

    catch (error) {

        console.log(error);

    }

};
    const acceptRequest = async (requestId) => {

    try {

        await api.put(
            `/friends/accept/${requestId}`
        );

        loadDashboard();

    }

    catch (error) {

        console.log(error);

    }

};

const rejectRequest = async (requestId) => {

    try {

        await api.put(
            `/friends/reject/${requestId}`
        );

        loadDashboard();

    }

    catch (error) {

        console.log(error);

    }

};
    return (
    <div>

        <h1 style={{ color: "var(--text)", marginBottom: "30px" }}>
            Collaboration Dashboard
        </h1>

        {/* ===================== SENT REQUESTS ===================== */}

        <h2 style={{ color: "var(--text)" }}>
            📤 Sent Requests
        </h2>

        {
            sentRequests.length === 0 ? (

                <p style={{ color: "var(--muted)" }}>
                    No Sent Requests
                </p>

            ) : (

                sentRequests.map((request) => (

                    <div
                        key={request.id}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            boxShadow: "var(--shadow)",
                            color: "var(--text)"
                        }}
                    >

                        <h3>{request.receiver_name}</h3>

                        <p>🏫 {request.institution}</p>

                        <p>💻 {request.department}</p>

                        <p>📨 {request.message}</p>

                        <p>
                            Status :
                            <strong
                                style={{
                                    color:
                                        request.status === "Pending"
                                            ? "orange"
                                            : request.status === "Accepted"
                                            ? "green"
                                            : "red",
                                    marginLeft: "8px"
                                }}
                            >
                                {request.status}
                            </strong>
                        </p>

                    </div>

                ))

            )
        }

        {/* ===================== RECEIVED REQUESTS ===================== */}

        <h2
            style={{
                color: "var(--text)",
                marginTop: "40px"
            }}
        >
            📥 Received Requests
        </h2>

        {
            receivedRequests.length === 0 ? (

                <p style={{ color: "var(--muted)" }}>
                    No Incoming Requests
                </p>

            ) : (

                receivedRequests.map((request) => (

                    <div
                        key={request.request_id}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            boxShadow: "var(--shadow)",
                            color: "var(--text)"
                        }}
                    >

                        <h3>{request.sender_name}</h3>

                        <p>🏫 {request.institution}</p>

                        <p>💻 {request.department}</p>

                        <p>📨 {request.message}</p>

                        <p>
                            Status :
                            <strong
                                style={{
                                    color:
                                        request.status === "Pending"
                                            ? "orange"
                                            : request.status === "Accepted"
                                            ? "green"
                                            : "red",
                                    marginLeft: "8px"
                                }}
                            >
                                {request.status}
                            </strong>
                        </p>

                        {/* Buttons will work in the next step */}

                        {
                            request.status === "Pending" && (

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginTop: "15px"
                                    }}
                                >

                                  <button
    onClick={() => acceptRequest(request.request_id)}
    style={{
        background: "#16a34a",
        color: "white",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        cursor: "pointer"
    }}
>
    Accept
</button>

                                   <button
    onClick={() => rejectRequest(request.request_id)}
    style={{
        background: "#dc2626",
        color: "white",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        cursor: "pointer"
    }}
>
    Reject
</button>

                                </div>

                            )
                        }

                    </div>

                ))

            )
        }

        {/* ===================== MY COLLABORATIONS ===================== */}

        <h2
            style={{
                color: "var(--text)",
                marginTop: "40px"
            }}
        >
            🤝 My Collaborations
        </h2>

        {
            collaborations.length === 0 ? (

                <h3 style={{ color: "var(--muted)" }}>
                    No Collaborations Yet
                </h3>

            ) : (

                collaborations.map((person) => (

                    <div
                        key={person.user_id}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            boxShadow: "var(--shadow)",
                            color: "var(--text)"
                        }}
                    >

                        <h2>{person.name}</h2>

                        <p>🏫 {person.institution}</p>

                        <p>💻 {person.department}</p>

                        <p>🔬 {person.research_interest}</p>

                        <button
                            onClick={() =>
                                navigate(`/researcher/${person.user_id}`)
                            }
                            style={{
                                marginTop: "12px"
                            }}
                        >
                            View Profile
                        </button>

                    </div>

                ))

            )
        }

    </div>
);

}

export default Collaborations;

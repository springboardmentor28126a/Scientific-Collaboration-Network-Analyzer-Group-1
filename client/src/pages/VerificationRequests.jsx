import { useEffect, useState } from "react";
import API from "../services/api";

export default function VerificationRequests() {

    const [requests, setRequests] = useState([]);

    useEffect(() => {

        loadRequests();

    }, []);

    const loadRequests = async () => {

        try {

            const res = await API.get(
                "/verification/pending"
            );

            setRequests(res.data);
            console.log(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    const approveRequest = async (id) => {

        try {

            await API.put(
                `/verification/approve/${id}`
            );

            alert("Verification Approved Successfully.");

            loadRequests();

        }

        catch (err) {

            console.log(err);

            alert("Failed to approve verification.");

        }

    };

    const rejectRequest = async (id) => {

        const remarks = prompt(
            "Enter reason for rejection"
        );

        if (!remarks) return;

        try {

            await API.put(

                `/verification/reject/${id}`,

                null,

                {
                    params: {
                        remarks
                    }
                }

            );

            alert("Verification Rejected.");

            loadRequests();

        }

        catch (err) {

            console.log(err);

            alert("Failed to reject verification.");

        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h1>Verification Requests</h1>

            <br />

            {

                requests.length === 0 ? (

                    <h3>No Pending Verification Requests</h3>

                ) : (

                    requests.map((request) => (

                        <div

                            key={request.id}

                            style={{

                                border: "1px solid #ddd",

                                borderRadius: "12px",

                                padding: "20px",

                                marginBottom: "20px",

                                background: "#fff",

                                boxShadow: "0 2px 8px rgba(0,0,0,.08)"

                            }}

                        >

                            <h2>{request.name}</h2>

                            <p>

                                <strong>Email :</strong>{" "}

                                {request.email}

                            </p>

                            <p>

                                <strong>Role :</strong>{" "}

                                {request.role}

                            </p>

                            <p>

                                <strong>Document Type :</strong>{" "}

                                {request.document_type}

                            </p>

                            <p>

                                <strong>Document :</strong>{" "}

                                {request.document_name}

                            </p>

                            <p>

                                <strong>Status :</strong>{" "}

                                <span
                                    style={{
                                        color: "orange",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {request.status}
                                </span>

                            </p>

                            <p>

                                <strong>Uploaded :</strong>{" "}

                                {new Date(
                                    request.uploaded_at
                                ).toLocaleString()}

                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "15px",
                                    marginTop: "20px"
                                }}
                            >

                                <a

                                    href={request.document_url}

                                    target="_blank"

                                    rel="noreferrer"

                                    style={{
                                        textDecoration: "none",
                                        padding: "10px 18px",
                                        background: "#1976d2",
                                        color: "#fff",
                                        borderRadius: "8px"
                                    }}

                                >

                                    📄 View Document

                                </a>

                                <button

                                    onClick={() =>
                                        approveRequest(request.id)
                                    }

                                    style={{
                                        padding: "10px 18px",
                                        border: "none",
                                        borderRadius: "8px",
                                        background: "green",
                                        color: "white",
                                        cursor: "pointer"
                                    }}

                                >

                                    ✅ Approve

                                </button>

                                <button

                                    onClick={() =>
                                        rejectRequest(request.id)
                                    }

                                    style={{
                                        padding: "10px 18px",
                                        border: "none",
                                        borderRadius: "8px",
                                        background: "red",
                                        color: "white",
                                        cursor: "pointer"
                                    }}

                                >

                                    ❌ Reject

                                </button>

                            </div>

                        </div>

                    ))

                )

            }

        </div>

    );

}
import { useEffect, useState } from "react";
import API from "../services/api";
import Pagination from "../components/Pagination";

export default function VerificationRequests() {

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("newest");
    const pageSize = 6;

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

    const openDocument = async (request) => {
        try {
            const response = await API.get(`/verification/document/${request.id}`);
            window.open(response.data.download_url, "_blank", "noopener,noreferrer");
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to open verification document.");
        }
    };

    const filteredRequests = [...requests]
        .filter((request) => `${request.name} ${request.email} ${request.role}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => sort === "name" ? (a.name || "").localeCompare(b.name || "") : new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const pageCount = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
    const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);

    return (

        <div style={{ padding: "30px" }}>

            <h1>Verification Requests</h1>

            <div className="page-toolbar">
                <input className="search-input" placeholder="Search verification requests" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
                <select className="filter-select" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="name">Sort by name</option></select>
            </div>

            <br />

            {

                requests.length === 0 ? (

                    <h3>No Pending Verification Requests</h3>

                ) : (

                    paginatedRequests.map((request) => (

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

                                <button

                                    type="button"

                                    onClick={() => openDocument(request)}

                                    style={{
                                        textDecoration: "none",
                                        padding: "10px 18px",
                                        background: "#1976d2",
                                        color: "#fff",
                                        borderRadius: "8px"
                                    }}

                                >

                                    📄 View Document

                                </button>

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
            <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={setPage} />

        </div>

    );

}

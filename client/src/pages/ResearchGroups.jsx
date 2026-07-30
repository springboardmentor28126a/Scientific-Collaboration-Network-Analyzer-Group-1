import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResearchGroups() {

    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {

        try {

            const res = await api.get(`/groups/my/${user.id}`);

            setGroups(res.data);

        } catch (err) {

            console.error(err);

        }

    };

    return (

        <div
            style={{
                padding: "30px",
                maxWidth: "1100px",
                margin: "0 auto"
            }}
        >

            <h1 style={{ marginBottom: "30px" }}>
                My Research Groups
            </h1>

            {
                groups.length === 0 ? (

                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px",
                            border: "1px dashed #bbb",
                            borderRadius: "12px"
                        }}
                    >
                        <h3>No Research Groups Found</h3>
                        <p>Create a research group to start collaborating.</p>
                    </div>

                ) : (

                    groups.map(group => (

                        <div
                            key={group.id}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "15px",
                                padding: "25px",
                                marginBottom: "20px",
                                background: "#fff",
                                boxShadow: "0 5px 15px rgba(0,0,0,.06)"
                            }}
                        >

                            <h2
                                style={{
                                    marginBottom: "10px"
                                }}
                            >
                                {group.name}
                            </h2>

                            <p
                                style={{
                                    color: "#555"
                                }}
                            >
                                {group.description || "No description provided."}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "25px",
                                    marginTop: "15px",
                                    marginBottom: "20px",
                                    color: "#444"
                                }}
                            >

                                <span>
                                    👥 {group.member_count} Members
                                </span>

                                <span>
                                    🛡 {group.role}
                                </span>

                                <span>
                                    🌐 {group.visibility}
                                </span>

                            </div>

                            <button
                                onClick={() =>
                                    navigate(`/groups/${group.id}`)
                                }
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                Open Workspace
                            </button>

                        </div>

                    ))

                )
            }

        </div>

    );

}
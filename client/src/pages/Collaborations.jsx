import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Collaborations() {
    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [collaborations, setCollaborations] = useState([]);

    useEffect(() => {

        loadCollaborations();

    }, []);

    const loadCollaborations = async () => {

        try {

            const response = await api.get(
                `/collaboration/list/${user.id}`
            );

            setCollaborations(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div>
            <h1 style={{ color: "var(--text)" }}>My Collaborations</h1>

            {collaborations.length === 0 ? (
                <h3 style={{ color: "var(--muted)" }}>No Collaborations Yet</h3>
            ) : (
                collaborations.map((person) => (
                    <div
                        key={person.id}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            boxShadow: "var(--shadow)",
                            color: "var(--text)",
                        }}
                    >
                        <h2 style={{ color: "var(--text)" }}>{person.name}</h2>
                        <p style={{ color: "var(--muted)" }}>🏫 {person.institution}</p>
                        <p style={{ color: "var(--muted)" }}>💻 {person.department}</p>
                        <p style={{ color: "var(--muted)" }}>🔬 {person.research_interest}</p>
                        <button
                            onClick={() => navigate(`/workspace/${person.id}`)}
                            style={{ marginTop: "12px" }}
                        >
                            Open Workspace
                        </button>
                    </div>
                ))
            )}
        </div>
    );

}

export default Collaborations;
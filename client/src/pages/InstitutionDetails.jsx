import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function InstitutionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInstitution();
    }, [id]);

    const loadInstitution = async () => {
        try {
            const response = await API.get(`/institution/details/${id}`);
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <h2>Loading institution...</h2>;
    }

    if (!data) {
        return <h2>Institution not found.</h2>;
    }

    const researchAreas = [
        ...new Set(
            data.researchers
                .flatMap((researcher) =>
                    researcher.research_interest
                        ? researcher.research_interest.split(",").map((item) => item.trim())
                        : []
                )
                .filter(Boolean)
        )
    ];

    return (
        <div style={{ padding: "30px" }}>
            <div style={headerCard}>
                <h1>🏫 {data.institution.name}</h1>
                <p>📍 {data.institution.address}</p>
                <p>🌐 {data.institution.website}</p>
                <p>📧 {data.institution.email}</p>
                <p>📞 {data.institution.phone || "N/A"}</p>
                <p>🌍 {data.institution.city}, {data.institution.country}</p>
            </div>

            <div style={statsGrid}>
                <StatCard title="Researchers" value={data.statistics?.researchers ?? 0} />
                <StatCard title="Publications" value={data.statistics?.publications ?? 0} />
                <StatCard title="Conferences" value={data.statistics?.conferences ?? 0} />
            </div>

            <Section title="Research Areas">
                {researchAreas.length > 0 ? (
                    researchAreas.map((area) => (
                        <span key={area} style={tagStyle}>{area}</span>
                    ))
                ) : (
                    <p>No research areas available.</p>
                )}
            </Section>

            <Section title="Researchers">
                {data.researchers.length === 0 ? (
                    <p>No researchers found.</p>
                ) : (
                    <div style={cardGrid}>
                        {data.researchers.map((researcher) => (
                            <div key={researcher.id} style={detailCard}>
                                <h3>{researcher.name}</h3>
                                <p>💻 {researcher.department || "N/A"}</p>
                                <p>🏷 {researcher.designation || "N/A"}</p>
                                <p>📧 {researcher.email}</p>
                                <button style={buttonStyle} onClick={() => navigate(`/researcher/${researcher.id}`)}>
                                    View Researcher
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Publications">
                {data.publications.length === 0 ? (
                    <p>No publications found.</p>
                ) : (
                    <div style={cardGrid}>
                        {data.publications.map((publication) => (
                            <div key={publication.id} style={detailCard}>
                                <h3>{publication.title}</h3>
                                <p>{publication.authors}</p>
                                <p>{publication.journal}</p>
                                <button style={buttonStyle} onClick={() => navigate(`/publication/${publication.id}`)}>
                                    View Publication
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Conferences">
                {data.conferences.length === 0 ? (
                    <p>No conferences found.</p>
                ) : (
                    <div style={cardGrid}>
                        {data.conferences.map((conference) => (
                            <div key={conference.id} style={detailCard}>
                                <h3>{conference.name}</h3>
                                <p>{conference.location}</p>
                                <button style={buttonStyle} onClick={() => navigate(`/conference/${conference.id}`)}>
                                    View Conference
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: "30px" }}>
            <h2>{title}</h2>
            <div>{children}</div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div style={statCard}>
            <h3>{title}</h3>
            <h1>{value}</h1>
        </div>
    );
}

const headerCard = {
    background: "rgba(255,255,255,0.06)",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    marginBottom: "30px"
};

const statsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "30px"
};

const statCard = {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    textAlign: "center"
};

const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px"
};

const detailCard = {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    marginBottom: "15px"
};

const tagStyle = {
    background: "#e0f2fe",
    color: "#0c4a6e",
    padding: "8px 12px",
    borderRadius: "999px",
    marginRight: "10px",
    marginBottom: "10px",
    display: "inline-block"
};

const buttonStyle = {
    marginTop: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer"
};

export default InstitutionDetails;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import ResearcherInviteButton from "../components/ResearcherInviteButton";

function ResearcherProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [researcher, setResearcher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResearcher();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadResearcher = async () => {
        try {
            const response = await API.get(`/researcher/${id}`);
            setResearcher(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <h2>Loading researcher...</h2>;
    }

    if (!researcher) {
        return <h2>Researcher not found.</h2>;
    }

    const researchAreas = researcher.research_interest
        ? researcher.research_interest.split(",").map((area) => area.trim())
        : [];

    return (
        <div style={{ padding: "30px" }}>
            <div style={profileCard}>
                <h1>{researcher.name}</h1>
                <ResearcherInviteButton researcher={researcher} />
                <p>🏫 <b>Institution:</b> {researcher.institution || "Not Added"}</p>
                <p>💻 <b>Department:</b> {researcher.department || "Not Added"}</p>
                <p>🏷 <b>Designation:</b> {researcher.designation || "Not Added"}</p>
                <p>🔬 <b>Research Interests:</b> {researcher.research_interest || "Not Added"}</p>
                <p>⭐ <b>Skills:</b> {researcher.skills || "Not Added"}</p>
                <p>🔗 <b>LinkedIn:</b> {researcher.linkedin || "Not Added"}</p>
                <p>🆔 <b>ORCID:</b> {researcher.orcid || "Not Added"}</p>
                <p>🎓 <b>Google Scholar:</b> {researcher.google_scholar || "Not Added"}</p>
                <p>📧 <b>Email:</b> {researcher.email || "Not Added"}</p>
                <p>🌍 <b>Country:</b> {researcher.country || "Not Added"}</p>
            </div>

            <div style={statsGrid}>
                <StatCard title="Publications" value={researcher.statistics?.publications ?? 0} />
                <StatCard title="Conferences" value={researcher.statistics?.conferences ?? 0} />
                <StatCard title="Collaborations" value={researcher.statistics?.collaborations ?? 0} />
            </div>

            <Section title="Research Areas">
                {researchAreas.length > 0 ? (
                    researchAreas.map((area) => (
                        <span key={area} style={tagStyle}>{area}</span>
                    ))
                ) : (
                    <p>No research areas defined.</p>
                )}
            </Section>

            <Section title="Publications">
                {researcher.publications?.length === 0 ? (
                    <p>No publications available.</p>
                ) : (
                    researcher.publications.map((publication) => (
                        <ResultCard
                            key={publication.id}
                            title={publication.title}
                            description={`${publication.journal || "Unpublished"} · ${publication.publication_year || "Year N/A"}`}
                            onClick={() => navigate(`/publication/${publication.id}`)}
                        />
                    ))
                )}
            </Section>

            <Section title="Conference Participation">
                {researcher.conferences?.length === 0 ? (
                    <p>No conference participation yet.</p>
                ) : (
                    researcher.conferences.map((conference) => (
                        <ResultCard
                            key={conference.id}
                            title={conference.name}
                            description={`${conference.location} · ${conference.start_date} to ${conference.end_date}`}
                            onClick={() => navigate(`/conference/${conference.id}`)}
                        />
                    ))
                )}
            </Section>

            <Section title="Collaborators">
                {researcher.collaborators?.length === 0 ? (
                    <p>No collaborators.</p>
                ) : (
                    researcher.collaborators.map((collaborator) => (
                        <div key={collaborator.id} style={resultCardStyle}>
                            <h3>{collaborator.name}</h3>
                            <p>{collaborator.email}</p>
                            <button style={buttonStyle} onClick={() => navigate(`/researcher/${collaborator.id}`)}>
                                View Collaborator
                            </button>
                        </div>
                    ))
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

function ResultCard({ title, description, onClick }) {
    return (
        <div style={resultCardStyle} onClick={onClick}>
            <h3>{title}</h3>
            <p>{description}</p>
            <button style={buttonStyle}>View Details</button>
        </div>
    );
}

const profileCard = {
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

const tagStyle = {
    background: "#e0f2fe",
    color: "#0c4a6e",
    padding: "8px 12px",
    borderRadius: "999px",
    display: "inline-block",
    marginBottom: "10px"
};

const resultCardStyle = {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    marginBottom: "15px",
    cursor: "pointer"
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

export default ResearcherProfile;

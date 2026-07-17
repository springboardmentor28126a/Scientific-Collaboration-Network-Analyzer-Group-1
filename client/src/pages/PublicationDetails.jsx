import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function PublicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [publicationDetails, setPublicationDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPublicationDetails();
    }, [id]);

    const loadPublicationDetails = async () => {
        try {
            const response = await API.get(`/publications/details/${id}`);
            setPublicationDetails(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <h2>Loading publication...</h2>;
    if (!publicationDetails) return <h2>Publication not found.</h2>;

    const { publication, institution, conference, related_publications, similar_research } = publicationDetails;

    return (
        <div style={{ padding: "30px" }}>
            <div style={cardStyle}>
                <h1>📄 {publication.title}</h1>
                <p><b>Authors:</b> {publication.authors}</p>
                <p><b>Type:</b> {publication.publication_type}</p>
                <p><b>Year:</b> {publication.publication_year}</p>
                <p><b>Journal:</b> {publication.journal || "N/A"}</p>
                <p><b>DOI:</b> {publication.doi || "N/A"}</p>
                <p><b>Keywords:</b> {publication.keywords || "N/A"}</p>
                <p><b>Status:</b> {publication.status}</p>
                <p><b>Abstract:</b></p>
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px" }}>
                    {publication.abstract || "No abstract available."}
                </div>
                <p><b>PDF:</b> {publication.pdf_file ? <a href={publication.pdf_file} target="_blank" rel="noreferrer">Download PDF</a> : "Not available"}</p>
                {institution && (
                    <p><b>Institution:</b> <span onClick={() => navigate(`/institution/${institution.id}`)} style={{ cursor: "pointer", color: "#2563eb" }}>{institution.name}</span></p>
                )}
                {conference && (
                    <p><b>Conference:</b> <span onClick={() => navigate(`/conference/${conference.id}`)} style={{ cursor: "pointer", color: "#2563eb" }}>{conference.name}</span></p>
                )}
            </div>

            <div style={{ marginTop: "30px" }}>
                <Section title="Related Publications">
                    {related_publications.length === 0 ? (
                        <p>No related publications found.</p>
                    ) : (
                        related_publications.map((pub) => (
                            <ResultItem key={pub.id} label={pub.title} subtitle={`${pub.authors} · ${pub.publication_year}`} onClick={() => navigate(`/publication/${pub.id}`)} />
                        ))
                    )}
                </Section>
            </div>

            <div style={{ marginTop: "30px" }}>
                <Section title="Similar Research">
                    {similar_research.length === 0 ? (
                        <p>No similar research found.</p>
                    ) : (
                        similar_research.map((pub) => (
                            <ResultItem key={pub.id} label={pub.title} subtitle={`${pub.authors} · ${pub.publication_year}`} onClick={() => navigate(`/publication/${pub.id}`)} />
                        ))
                    )}
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.06)", padding: "25px", borderRadius: "15px", boxShadow: "0 18px 60px rgba(0,0,0,0.18)" }}>
            <h2>{title}</h2>
            {children}
        </div>
    );
}

function ResultItem({ label, subtitle, onClick }) {
    return (
        <div style={{ marginBottom: "15px", padding: "15px", borderRadius: "12px", background: "#f8fafc", cursor: "pointer" }} onClick={onClick}>
            <h4 style={{ margin: "0 0 8px" }}>{label}</h4>
            <p style={{ margin: 0, color: "#475569" }}>{subtitle}</p>
        </div>
    );
}

const cardStyle = {
    background: "rgba(255,255,255,0.06)",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
};

export default PublicationDetails;

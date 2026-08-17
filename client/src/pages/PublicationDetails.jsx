import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { formatCitation, getCitationStats } from "../services/citationService";
import CitationModal from "../components/CitationModal";
import ResearcherInviteButton from "../components/ResearcherInviteButton";
import { FaBookOpen, FaExternalLinkAlt, FaQuoteRight } from "react-icons/fa";

function PublicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [publicationDetails, setPublicationDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [citationStyle, setCitationStyle] = useState("APA");
    const [citation, setCitation] = useState("");
    const [citationStats, setCitationStats] = useState(null);
    const [showCitationModal, setShowCitationModal] = useState(false);
    const [citationLoading, setCitationLoading] = useState(false);
    const [references, setReferences] = useState([]);
    const [referencesLoading, setReferencesLoading] = useState(true);
    const [showReferences, setShowReferences] = useState(false);

    useEffect(() => {
        loadPublicationDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadPublicationDetails = async () => {
        try {
            const response = await API.get(`/publications/details/${id}`);
            setPublicationDetails(response.data);
            const [formatted, stats] = await Promise.all([
                formatCitation(id, "APA"),
                getCitationStats(id),
            ]);
            setCitation(formatted.citation);
            setCitationStats(stats);
            const referencesResponse = await API.get('/citation/' + id);
            setReferences(referencesResponse.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setReferencesLoading(false);
        }
    };

    const updateCitation = async (style) => {
        setCitationStyle(style);
        setCitationLoading(true);
        try {
            const response = await formatCitation(id, style);
            setCitation(response.citation);
        } finally {
            setCitationLoading(false);
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
                {publication.researcher_id && (
                    <div style={{ margin: "12px 0" }}>
                        <button type="button" onClick={() => navigate(`/researcher/${publication.researcher_id}`)} style={{ marginRight: "10px" }}>View Researcher Profile</button>
                        <ResearcherInviteButton researcher={{ id: publication.researcher_id, name: publication.authors }} />
                    </div>
                )}
                <p><b>Type:</b> {publication.publication_type}</p>
                <p><b>Year:</b> {publication.publication_year}</p>
                <p><b>Journal:</b> {publication.journal || "N/A"}</p>
                <p><b>DOI:</b> {publication.doi || "N/A"}</p>
                <p><b>Keywords:</b> {publication.keywords || "N/A"}</p>
                <p><b>Status:</b> {publication.status}</p>
                <button type="button" onClick={() => navigate(`/research-ai/publication/${publication.id}`)} style={{ margin: "12px 0" }}>Analyze with Research AI</button>
                {publication.selected_reviewer_name && <p><b>Selected Reviewer:</b> {publication.selected_reviewer_name}</p>}
                {publication.reviewer_name && (
                    <>
                        <p><b>Accepted By:</b> {publication.reviewer_name}</p>
                        <p><b>Reviewed On:</b> {new Date(publication.reviewed_at).toLocaleString()}</p>
                        <p><b>Review Comments:</b> {publication.review_comments || "N/A"}</p>
                    </>
                )}
                <p><b>Abstract:</b></p>
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px" }}>
                    {publication.abstract || "No abstract available."}
                </div>
                <section style={sectionStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                            <h2>Citation</h2>
                            <p>{citationStats?.times_cited || 0} citations · {citationStats?.reference_count || 0} references</p>
                        </div>
                        <button type="button" className="citation-open-button" onClick={() => setShowCitationModal(true)}><FaQuoteRight /> Cite <FaExternalLinkAlt /></button>
                    </div>
                    <p className="citation-card-hint">Generate and export this publication in APA, IEEE, MLA, Chicago or BibTeX format.</p>
                </section>
                <section className="publication-references-section">
                    <button type="button" className="references-toggle" onClick={() => setShowReferences(!showReferences)} aria-expanded={showReferences}>
                        <span><FaBookOpen /> References <small>{references.length}</small></span><span>{showReferences ? "-" : "+"}</span>
                    </button>
                    {showReferences && <div className="references-list">
                        {referencesLoading && <p className="reference-empty">Loading references...</p>}
                        {!referencesLoading && references.length === 0 && <p className="reference-empty">No references have been added to this publication.</p>}
                        {!referencesLoading && references.map((reference) => <ReferenceCard key={reference.id} reference={reference} onOpen={(publicationId) => navigate('/publication/' + publicationId)} />)}
                    </div>}
                </section>
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
            <CitationModal publication={publication} open={showCitationModal} onClose={() => setShowCitationModal(false)} publicationId={id} citation={citation} style={citationStyle} onStyleChange={updateCitation} onGenerate={() => updateCitation(citationStyle)} loading={citationLoading} />
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

function ReferenceCard({ reference, onOpen }) {
    const publication = reference.cited_publication;
    if (!publication) return null;
    const details = [publication.authors, publication.publication_year].filter(Boolean).join(" • ");
    return (
        <article className="reference-card">
            <div className="reference-card-icon"><FaQuoteRight /></div>
            <div className="reference-card-content">
                <button type="button" className="reference-title" onClick={() => onOpen(publication.id)}>{publication.title}</button>
                {details && <p>{details}</p>}
                {(publication.journal || publication.doi) && <small>{[publication.journal, publication.doi && `DOI: ${publication.doi}`].filter(Boolean).join(" • ")}</small>}
            </div>
            <button type="button" className="reference-view-button" onClick={() => onOpen(publication.id)}>View <FaExternalLinkAlt /></button>
        </article>
    );
}
const cardStyle = {
    background: "rgba(255,255,255,0.06)",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
};

const sectionStyle = { marginTop: "24px", padding: "20px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--surface-alt)" };

export default PublicationDetails;

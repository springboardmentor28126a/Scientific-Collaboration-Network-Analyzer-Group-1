import { useEffect, useState } from "react";
import CitationForm from "../components/CitationForm";
import {
  createCitation,
  deleteCitation,
  getCitationStats,
  formatCitation,
} from "../services/citationService";
import api from "../services/api";
import CitationModal from "../components/CitationModal";

function Citations() {
  const [publicationId, setPublicationId] = useState("");
  const [stats, setStats] = useState(null);
  const [publications, setPublications] = useState([]);
  const [style, setStyle] = useState("APA");
  const [formattedCitation, setFormattedCitation] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [citationLoading, setCitationLoading] = useState(false);
  const loadPublications = async () => {
    try {
      const { data } = await api.get("/publications/");
      setPublications(data);

      if (data.length > 0) {
        setPublicationId(data[0].id);
      }
    } catch {
      setPublications([]);
    }
  };
  const loadStats = async () => {
    try {
      const data = await getCitationStats(publicationId);
      setStats(data);
    } catch {
      setStats(null);
      alert("Publication not found");
    }
  };

 useEffect(() => {
  loadPublications();
}, []);

  const handleCreate = async (citation) => {
    try {
      await createCitation(citation);
      alert("Citation Added");
      loadStats();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  const handleDelete = async () => {
    const id = prompt("Enter Citation ID");

    if (!id) return;

    try {
      await deleteCitation(id);
      alert("Citation Deleted");
      loadStats();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  const loadFormattedCitation = async () => {
    if (!publicationId) return;
    setCitationLoading(true);
    try {
      const data = await formatCitation(publicationId, style);
      setFormattedCitation(data.citation);
    } catch {
      setFormattedCitation("");
    } finally {
      setCitationLoading(false);
    }
  };

  return (
    <div className="container mt-4">

      <h2>Citation Management</h2>

      <CitationForm onSubmit={handleCreate} />

      <div className="card mt-4">
        <div className="card-header">
          <h4>Citation Statistics</h4>
        </div>

        <div className="card-body">

          <select
            className="form-control"
            value={publicationId}
            onChange={(e) => setPublicationId(e.target.value)}
          >
            {publications.map((pub) => (
              <option key={pub.id} value={pub.id}>
                {pub.title}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary mt-3"
            onClick={loadStats}
          >
            Get Statistics
          </button>

          {stats && (
            <div className="mt-4">
              <p><strong>Title:</strong> {stats.title}</p>
              <p><strong>Times Cited:</strong> {stats.times_cited}</p>
              <p><strong>Reference Count:</strong> {stats.reference_count}</p>
            </div>
          )}

          <div className="mt-4">
            <h4>Generate Citation</h4>
            <select className="form-control" value={style} onChange={(e) => setStyle(e.target.value)}>
              {['APA', 'IEEE', 'MLA', 'Chicago', 'BibTeX'].map((option) => <option key={option}>{option}</option>)}
            </select>
            <button className="btn btn-secondary mt-3" onClick={() => setShowGenerateModal(true)} disabled={!publicationId}>Generate</button>
            {formattedCitation && <p className="citation-ready-note mt-3">Citation ready in the Generate Citation dialog.</p>}
          </div>

          <button
            className="btn btn-danger mt-3"
            onClick={handleDelete}
          >
            Delete Citation
          </button>

        </div>
      </div>

      <CitationModal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} publicationId={publicationId} citation={formattedCitation} style={style} onStyleChange={setStyle} onGenerate={loadFormattedCitation} loading={citationLoading} />

    </div>
  );
}

export default Citations;

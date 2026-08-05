import { useEffect, useState } from "react";
import CitationForm from "../components/CitationForm";
import {
  createCitation,
  deleteCitation,
  getCitationStats,
  formatCitation,
} from "../services/citationService";
import api from "../services/api";

function Citations() {
  const [publicationId, setPublicationId] = useState("");
  const [stats, setStats] = useState(null);
  const [publications, setPublications] = useState([]);
  const [style, setStyle] = useState("APA");
  const [formattedCitation, setFormattedCitation] = useState("");
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
    try {
      const data = await formatCitation(publicationId, style);
      setFormattedCitation(data.citation);
    } catch {
      setFormattedCitation("");
    }
  };

  const copyCitation = async () => {
    if (formattedCitation) await navigator.clipboard.writeText(formattedCitation);
  };

  const downloadCitation = () => {
    if (!formattedCitation) return;
    const blob = new Blob([formattedCitation], { type: style === "BibTeX" ? "application/x-bibtex" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `citation-${publicationId}.${style === "BibTeX" ? "bib" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
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
            <button className="btn btn-secondary mt-3" onClick={loadFormattedCitation}>Generate</button>
            {formattedCitation && <>
              <pre className="mt-3" style={{ whiteSpace: "pre-wrap" }}>{formattedCitation}</pre>
              <button className="btn btn-primary mt-3" onClick={copyCitation}>Copy Citation</button>
              <button className="btn btn-secondary mt-3" onClick={downloadCitation} style={{ marginLeft: "8px" }}>Download Citation</button>
            </>}
          </div>

          <button
            className="btn btn-danger mt-3"
            onClick={handleDelete}
          >
            Delete Citation
          </button>

        </div>
      </div>

    </div>
  );
}

export default Citations;

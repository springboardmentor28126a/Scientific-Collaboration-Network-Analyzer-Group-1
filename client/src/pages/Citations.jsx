import { useEffect, useState } from "react";
import CitationForm from "../components/CitationForm";
import {
  createCitation,
  deleteCitation,
  getCitationStats,
} from "../services/citationService";

function Citations() {
  const [publicationId, setPublicationId] = useState("");
  const [stats, setStats] = useState(null);
  const [publications, setPublications] = useState([]);
  const loadPublications = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/publications/");
      const data = await res.json();
      setPublications(data);

      if (data.length > 0) {
        setPublicationId(data[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const loadStats = async () => {
    try {
      const data = await getCitationStats(publicationId);
      setStats(data);
    } catch (err) {
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
import { useEffect, useState } from "react";

function CitationForm({ onSubmit }) {
  const [publications, setPublications] = useState([]);
  const [citingPublicationId, setCitingPublicationId] = useState("");
  const [citedPublicationId, setCitedPublicationId] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/publications/")
      .then((res) => res.json())
      .then((data) => setPublications(data))
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      citing_publication_id: Number(citingPublicationId),
      cited_publication_id: Number(citedPublicationId),
    });

    setCitingPublicationId("");
    setCitedPublicationId("");
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h4>Add Citation</h4>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">
              Citing Publication
            </label>

            <select
              className="form-control"
              value={citingPublicationId}
              onChange={(e) => setCitingPublicationId(e.target.value)}
              required
            >
              <option value="">Select Publication</option>

              {publications.map((pub) => (
                <option key={pub.id} value={pub.id}>
                  {pub.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Cited Publication
            </label>

            <select
              className="form-control"
              value={citedPublicationId}
              onChange={(e) => setCitedPublicationId(e.target.value)}
              required
            >
              <option value="">Select Publication</option>

              {publications.map((pub) => (
                <option key={pub.id} value={pub.id}>
                  {pub.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Add Citation
          </button>

        </form>
      </div>
    </div>
  );
}

export default CitationForm;
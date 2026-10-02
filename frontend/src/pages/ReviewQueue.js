import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function ReviewQueue() {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await API.get("/reviews/queue");
      setPublications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const claimPublication = async (id) => {
    try {
      await API.post(`/reviews/claim/${id}`);
      alert("Publication claimed successfully");
      fetchQueue();
    } catch (err) {
      alert("Unable to claim publication");
    }
  };

  return (
    <div className="container mt-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Review Queue</h2>
          <p className="text-muted">
            Publications waiting for reviewer action
          </p>
        </div>

        {/* Add Publication */}
        <Link
          to="/add-publication"
          className="btn btn-primary"
        >
          + Add Publication
        </Link>
      </div>

      {/* Review Queue Table */}
      <table className="table table-bordered table-striped">

        <thead className="table-primary">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Journal</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {publications.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No publications are currently under review.
              </td>
            </tr>
          ) : (

            publications.map((pub) => (

              <tr key={pub.id}>

                <td>{pub.id}</td>
                <td>{pub.title}</td>
                <td>{pub.author}</td>
                <td>{pub.journal}</td>
                <td>{pub.year}</td>
                <td>
                  <span className="badge bg-warning text-dark">
                    {pub.status}
                  </span>
                </td>

                <td>

                  {/* Edit */}
                  <Link
                    className="btn btn-outline-primary btn-sm me-2"
                    to={`/edit-publication/${pub.id}`}
                  >
                    Edit
                  </Link>

                  {/* Claim */}
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => claimPublication(pub.id)}
                  >
                    Claim
                  </button>

                  {/* Review */}
                  <Link
                    className="btn btn-success btn-sm"
                    to={`/reviewpublication/${pub.id}`}
                  >
                    Review
                  </Link>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default ReviewQueue;
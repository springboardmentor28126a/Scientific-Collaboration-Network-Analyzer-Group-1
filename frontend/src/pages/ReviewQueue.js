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

      <h2>Review Queue</h2>

      <table className="table table-bordered table-striped">

        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Journal</th>
            <th>Year</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {publications.map((pub) => (

            <tr key={pub.id}>

              <td>{pub.id}</td>
              <td>{pub.title}</td>
              <td>{pub.author}</td>
              <td>{pub.journal}</td>
              <td>{pub.year}</td>
              <td>{pub.status}</td>

              <td>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => claimPublication(pub.id)}
                >
                  Claim
                </button>

                {" "}

                <Link
                  className="btn btn-success btn-sm"
                  to={`/reviewpublication/${pub.id}`}
                >
                  Review
                </Link>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ReviewQueue;
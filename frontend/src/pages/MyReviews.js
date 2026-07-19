import { useEffect, useState } from "react";
import API from "../api";

function MyReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await API.get("/reviews/my");
      setReviews(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">

      <h2>My Reviews</h2>

      <table className="table table-bordered table-striped">

        <thead>
          <tr>
            <th>ID</th>
            <th>Publication ID</th>
            <th>Reviewer ID</th>
            <th>Decision</th>
            <th>Comments</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.id}</td>
              <td>{review.publication_id}</td>
              <td>{review.reviewer_user_id}</td>
              <td>{review.decision}</td>
              <td>{review.comments}</td>
              <td>{review.score}</td>
              <td>{review.review_status}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default MyReviews;
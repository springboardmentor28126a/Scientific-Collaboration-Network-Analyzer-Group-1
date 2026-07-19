import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function ReviewPublication() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [comments, setComments] = useState("");
  const [score, setScore] = useState("");

  const approvePublication = async () => {
    try {
      await API.put(`/reviews/approve/${id}`, {
        decision: "Approved",
        comments: comments,
        score: Number(score)
      });

      alert("Publication Approved");
      navigate("/myreviews");

    } catch (err) {
      console.log(err);
      alert("Approval failed");
    }
  };

  const rejectPublication = async () => {
    try {
      await API.put(`/reviews/reject/${id}`, {
        decision: "Rejected",
        comments: comments,
        score: Number(score)
      });

      alert("Publication Rejected");
      navigate("/myreviews");

    } catch (err) {
      console.log(err);
      alert("Rejection failed");
    }
  };

  return (
    <div className="container mt-4">

      <h2>Review Publication</h2>

      <div className="mb-3">
        <label className="form-label">Comments</label>

        <textarea
          className="form-control"
          rows="4"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Score</label>

        <input
          type="number"
          className="form-control"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </div>

      <button
        className="btn btn-success me-2"
        onClick={approvePublication}
      >
        Approve
      </button>

      <button
        className="btn btn-danger"
        onClick={rejectPublication}
      >
        Reject
      </button>

    </div>
  );
}

export default ReviewPublication;
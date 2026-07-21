import React, { useEffect, useState } from 'react';
import api from '../config/api';

const ReviewQueue = () => {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/reviews/pending');
        setPending(res.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load review queue');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="container py-4">
      <h3>Review Queue</h3>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div>
          {pending.length === 0 ? (
            <div className="alert alert-info">No pending reviews</div>
          ) : (
            <ul className="list-group">
              {pending.map((r) => (
                <li key={`${r.publication_id}-${r.reviewer_id}`} className="list-group-item">
                  Publication ID: {r.publication_id} — Status: {r.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;

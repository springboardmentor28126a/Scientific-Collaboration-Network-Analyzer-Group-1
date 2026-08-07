import React, { useEffect, useState } from 'react';
import api from '../config/api';

const ReviewQueue = () => {
  const [pending, setPending] = useState([]);
  const [publications, setPublications] = useState([]);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ rating: 3, comments: '', recommendation: 'undecided' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [reviews, pubs] = await Promise.all([
        api.get('/reviews/pending'),
        api.get('/publications/')
      ]);
      setPending(reviews.data || []);
      setPublications(pubs.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  const title = (id) => publications.find((p) => p.id === id)?.title || `Publication #${id}`;
  const pubFile = (id) => publications.find((p) => p.id === id)?.file_path;
  const submit = async (event) => {
    event.preventDefault();
    if (!active) return;

    try {
      setError('');
      const payload = new FormData();
      payload.append('rating', String(form.rating));
      payload.append('comments', form.comments);
      payload.append('recommendation', form.recommendation);

      await api.post(`/reviews/${active.publication_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setActive(null);
      setForm({ rating: 3, comments: '', recommendation: 'undecided' });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not submit review');
    }
  };
  return <div className="container py-4"><h3>Review Queue</h3><p className="text-muted">Every submitted publication is available for review. Submitted feedback is visible to its publisher in Publications.</p>{loading && <p>Loading...</p>}{error && <div className="alert alert-danger">{error}</div>}{!loading && !error && (pending.length === 0 ? <div className="alert alert-info">No pending reviews</div> : <div className="row">{pending.map((review) => <div className="col-md-6 mb-3" key={`${review.publication_id}-${review.reviewer_id}`}><div className="card"><div className="card-body"><h5>{title(review.publication_id)}</h5><span className="badge bg-warning text-dark me-2">Pending review</span>{pubFile(review.publication_id) && <a href={`${api.defaults.baseURL}${pubFile(review.publication_id)}`} className="btn btn-sm btn-outline-info me-2" target="_blank" rel="noreferrer">Download File</a>}<button className="btn btn-primary btn-sm float-end" onClick={() => setActive(review)}>Review</button></div></div></div>)}</div>)}
    {active && <div className="card mt-3"><div className="card-body"><h5>Review: {title(active.publication_id)}</h5><form onSubmit={submit}><div className="mb-3"><label className="form-label">Rating</label><select className="form-select" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>{[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating} star{rating > 1 ? 's' : ''}</option>)}</select></div><div className="mb-3"><label className="form-label">Comments</label><textarea className="form-control" required rows="4" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></div><div className="mb-3"><label className="form-label">Recommendation</label><select className="form-select" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}><option value="undecided">Undecided</option><option value="accept">Accept</option><option value="reject">Reject</option></select></div><button className="btn btn-success me-2" type="submit">Submit review</button><button type="button" className="btn btn-outline-secondary" onClick={() => setActive(null)}>Cancel</button></form></div></div>}
  </div>;
};
export default ReviewQueue;

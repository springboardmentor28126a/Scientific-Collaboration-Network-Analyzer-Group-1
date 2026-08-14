import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import CollaborationRequestModal from './CollaborationRequestModal';

const Tags = ({ items, emptyLabel }) => items?.length ? <>{items.map((item) => <span className="badge bg-light text-dark border me-1 mb-1" key={item}>{item}</span>)}</> : <span className="text-muted small">{emptyLabel}</span>;

export default function AIRecommendations() {
  const { user } = useContext(AuthContext);
  const [researchers, setResearchers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [collaborationTarget, setCollaborationTarget] = useState(null);

  const load = async (force = false) => {
    setLoading(true); setError(''); setNotice('');
    try {
      const cacheKey = `ai-recommendations-${user?.id}`;
      const cached = !force && JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.createdAt < 5 * 60 * 1000) {
        setResearchers(cached.researchers); setPublications(cached.publications); return;
      }
      const [researcherResponse, publicationResponse] = await Promise.all([
        api.get('/ai/researcher-recommendations'), api.get('/ai/publication-recommendations'),
      ]);
      setResearchers(researcherResponse.data.recommendations || []);
      setPublications(publicationResponse.data.recommendations || []);
      sessionStorage.setItem(cacheKey, JSON.stringify({ createdAt: Date.now(), researchers: researcherResponse.data.recommendations || [], publications: publicationResponse.data.recommendations || [] }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to generate recommendations. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return <section className="mt-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div><h3 className="mb-0"><i className="bi bi-stars"></i> AI Recommendations</h3><p className="text-muted mb-0 small">Explainable matches based on your profile and stored publication text.</p></div>
      <button className="btn btn-outline-primary btn-sm" disabled={loading} onClick={() => load(true)}><i className="bi bi-arrow-clockwise"></i> Refresh</button>
    </div>
    {loading && <div className="alert alert-info">Analyzing your research profile...</div>}
    {error && <div className="alert alert-warning">{error}</div>}
    {notice && <div className="alert alert-success">{notice}</div>}
    {!loading && !error && <>
      <h4 className="mb-3">AI Researcher Matches</h4>
      <div className="row mb-4">
        {researchers.map((item) => <div className="col-lg-6 mb-3" key={item.researcher_id}><div className="card h-100 shadow-sm"><div className="card-body">
          <div className="d-flex justify-content-between gap-2"><div><h5>{item.name}</h5><div className="small text-muted">{[item.profile.designation, item.profile.department, item.profile.institution_name].filter(Boolean).join(' · ')}</div></div><span className="badge bg-primary align-self-start fs-6">{item.match_score}%</span></div>
          <p className="mt-3 mb-2">{item.reason}</p><div className="mb-2"><strong className="small">Common interests: </strong><Tags items={item.common_interests} emptyLabel="No exact interest label overlap" /></div>
          <div className="mb-3"><strong className="small">Matching skills: </strong><Tags items={item.matching_skills} emptyLabel="No exact skill label overlap" /></div>
          {item.relevant_publications?.length > 0 && <div className="small mb-3"><strong>Relevant publications: </strong>{item.relevant_publications.map((paper) => <Link className="me-2" key={paper.id} to={`/publications/${paper.id}`}>{paper.title}</Link>)}</div>}
          <Link className="btn btn-outline-primary btn-sm me-2" to={`/researchers/${item.researcher_id}`}>View Profile</Link>
          {['researcher', 'system_admin'].includes(user?.role) && <button className="btn btn-primary btn-sm" onClick={() => setCollaborationTarget(item)}>Collaborate</button>}
        </div></div></div>)}
        {researchers.length === 0 && <div className="col-12"><div className="alert alert-light border">No suitable researcher recommendations found yet. Add more research interests or publications to improve recommendations.</div></div>}
      </div>
      <h4 className="mb-3">AI Publication Recommendations</h4>
      <div className="row">
        {publications.map((item) => <div className="col-lg-6 mb-3" key={item.publication_id}><div className="card h-100 shadow-sm"><div className="card-body">
          <div className="d-flex justify-content-between gap-2"><h5>{item.title}</h5><span className="badge bg-success align-self-start fs-6">{item.match_score}%</span></div>
          <div className="small text-muted mb-2">{item.authors.join(', ') || 'Authors not listed'}</div><p className="small">{item.abstract || 'No abstract available.'}</p>
          <div className="mb-2"><strong className="small">Relevant topics: </strong><Tags items={item.matching_topics} emptyLabel="Related publication language" /></div><p className="mb-3">{item.reason}</p>
          <Link className="btn btn-outline-success btn-sm" to={`/publications/${item.publication_id}`}>View Publication</Link>
        </div></div></div>)}
        {publications.length === 0 && <div className="col-12"><div className="alert alert-light border">No suitable publication recommendations found yet. Add more research interests or publications to improve recommendations.</div></div>}
      </div>
    </>}
    {collaborationTarget && <CollaborationRequestModal researcher={collaborationTarget} onClose={() => setCollaborationTarget(null)} />}
  </section>;
}

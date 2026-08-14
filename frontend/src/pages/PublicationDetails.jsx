import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';

const emptyReference = {
  title: '',
  reference_type: 'journal',
  authors: '',
  journal: '',
  conference: '',
  publisher: '',
  year: '',
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  url: '',
};

export default function PublicationDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [publication, setPublication] = useState(null);
  const [citations, setCitations] = useState([]);
  const [citedBy, setCitedBy] = useState([]);
  const [references, setReferences] = useState([]);
  const [availablePublications, setAvailablePublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('references');
  const [referenceForm, setReferenceForm] = useState(emptyReference);
  const [citationTarget, setCitationTarget] = useState('');
  const canManage = ['researcher', 'system_admin'].includes(user?.role);
  const isReviewer = ['reviewer', 'system_admin'].includes(user?.role);

  const load = async () => {
    try {
      setLoading(true);
      const [publicationResponse, citationsResponse, citedByResponse, publicationsResponse] = await Promise.all([
        api.get(`/publications/${id}`),
        api.get(`/citations?publication_id=${id}`),
        api.get(`/citations/publications/${id}/cited-by`),
        api.get('/publications/'),
      ]);
      setPublication(publicationResponse.data);
      setCitations(citationsResponse.data || []);
      setCitedBy(citedByResponse.data || []);
      setAvailablePublications((publicationsResponse.data || []).filter((item) => String(item.id) !== String(id)));
      const referencesResponse = await api.get(`/citations/publications/${id}/references`);
      setReferences(referencesResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load publication details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveReference = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/citations/publications/${id}/references`, {
        ...referenceForm,
        year: referenceForm.year ? Number(referenceForm.year) : null,
      });
      const response = await api.get(`/citations/publications/${id}/references`);
      setReferences(response.data || []);
      setReferenceForm(emptyReference);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save reference');
    }
  };

  const saveCitation = async (event) => {
    event.preventDefault();
    try {
      await api.post('/citations', {
        citing_publication_id: Number(id),
        cited_publication_id: Number(citationTarget),
      });
      const response = await api.get(`/citations?publication_id=${id}`);
      setCitations(response.data || []);
      setCitationTarget('');
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to add citation');
    }
  };

  const toggleVerification = async (id, type, is_verified) => {
    try {
      await api.put(`/citations/${type === 'reference' ? 'references/' : ''}${id}/verify?is_verified=${is_verified}`);
      await load();
    } catch (err) {
      setError('Unable to update verification status');
    }
  };

  const toggleFlag = async (id, type, is_flagged) => {
    try {
      await api.put(`/citations/${type === 'reference' ? 'references/' : ''}${id}/flag?is_flagged=${is_flagged}`);
      await load();
    } catch (err) {
      setError('Unable to update flag status');
    }
  };

  if (loading) {
    return <div className="container py-5"><div className="spinner-border" /></div>;
  }

  if (!publication) {
    return <div className="container py-5"><div className="alert alert-danger">Publication not found.</div></div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>{publication.title}</h2>
          <p className="text-muted mb-0">{publication.publication_type} · {publication.status}</p>
        </div>
        <Link to="/publications" className="btn btn-outline-secondary">Back to publications</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Publication details</h5>
          <p>{publication.abstract || 'No abstract provided.'}</p>
          <div className="row text-muted small">
            <div className="col-md-4">Created by: {publication.creator_name || 'Unknown'}</div>
            <div className="col-md-4">Published: {publication.published_date ? new Date(publication.published_date).toLocaleDateString() : 'N/A'}</div>
            <div className="col-md-4">Citations: {publication.citation_count || 0}</div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button className={`nav-link ${tab === 'references' ? 'active' : ''}`} onClick={() => setTab('references')}>References</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${tab === 'citations' ? 'active' : ''}`} onClick={() => setTab('citations')}>Citations</button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {tab === 'references' ? (
            <>
              {canManage && (
                <form onSubmit={saveReference} className="border rounded p-3 mb-4">
                  <h6>Add a reference</h6>
                  <div className="row g-2">
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="Title" value={referenceForm.title} onChange={(e) => setReferenceForm({ ...referenceForm, title: e.target.value })} required /></div>
                    <div className="col-md-6"><select className="form-control mb-2" value={referenceForm.reference_type} onChange={(e) => setReferenceForm({ ...referenceForm, reference_type: e.target.value })}>
                      <option value="journal">Journal</option>
                      <option value="conference">Conference</option>
                      <option value="book">Book</option>
                      <option value="patent">Patent</option>
                      <option value="website">Website</option>
                    </select></div>
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="Authors" value={referenceForm.authors} onChange={(e) => setReferenceForm({ ...referenceForm, authors: e.target.value })} /></div>
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="Journal" value={referenceForm.journal} onChange={(e) => setReferenceForm({ ...referenceForm, journal: e.target.value })} /></div>
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="Conference" value={referenceForm.conference} onChange={(e) => setReferenceForm({ ...referenceForm, conference: e.target.value })} /></div>
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="Publisher" value={referenceForm.publisher} onChange={(e) => setReferenceForm({ ...referenceForm, publisher: e.target.value })} /></div>
                    <div className="col-md-3"><input className="form-control mb-2" placeholder="Year" type="number" value={referenceForm.year} onChange={(e) => setReferenceForm({ ...referenceForm, year: e.target.value })} /></div>
                    <div className="col-md-3"><input className="form-control mb-2" placeholder="Volume" value={referenceForm.volume} onChange={(e) => setReferenceForm({ ...referenceForm, volume: e.target.value })} /></div>
                    <div className="col-md-3"><input className="form-control mb-2" placeholder="Issue" value={referenceForm.issue} onChange={(e) => setReferenceForm({ ...referenceForm, issue: e.target.value })} /></div>
                    <div className="col-md-3"><input className="form-control mb-2" placeholder="Pages" value={referenceForm.pages} onChange={(e) => setReferenceForm({ ...referenceForm, pages: e.target.value })} /></div>
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="DOI" value={referenceForm.doi} onChange={(e) => setReferenceForm({ ...referenceForm, doi: e.target.value })} /></div>
                    <div className="col-md-6"><input className="form-control mb-2" placeholder="URL" value={referenceForm.url} onChange={(e) => setReferenceForm({ ...referenceForm, url: e.target.value })} /></div>
                  </div>
                  <button className="btn btn-primary" type="submit">Save reference</button>
                </form>
              )}

              {references.length === 0 ? (
                <p className="text-muted">No references added yet.</p>
              ) : (
                <ul className="list-group">
                  {references.map((item) => (
                    <li key={item.id} className="list-group-item">
                      <strong>{item.title}</strong>
                      <div className="small text-muted">
                        {item.authors ? `${item.authors} · ` : ''}{item.journal || item.conference || item.publisher || item.reference_type}
                        {item.doi && <a className="ms-2" href={`https://doi.org/${item.doi}`} target="_blank" rel="noreferrer">DOI</a>}
                        {item.url && <a className="ms-2" href={item.url} target="_blank" rel="noreferrer">Source</a>}
                        {item.year ? ` · ${item.year}` : ''}
                      </div>
                      <div className="mt-2">
                        {item.is_verified && <span className="badge bg-success me-2">Verified</span>}
                        {item.is_flagged && <span className="badge bg-danger me-2">Flagged</span>}
                        {isReviewer && (
                          <>
                            <button className="btn btn-sm btn-outline-success me-1" onClick={() => toggleVerification(item.id, 'reference', !item.is_verified)}>
                              {item.is_verified ? 'Unverify' : 'Verify'}
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => toggleFlag(item.id, 'reference', !item.is_flagged)}>
                              {item.is_flagged ? 'Unflag' : 'Flag'}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
            ) : (
            <>
              {canManage && (
                <form onSubmit={saveCitation} className="border rounded p-3 mb-4">
                  <h6>Add a citation</h6>
                  <select className="form-select" value={citationTarget} onChange={(e) => setCitationTarget(e.target.value)} required>
                    <option value="">Select a publication to cite</option>
                    {availablePublications.map((item) => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
                  <button className="btn btn-primary mt-2" type="submit">Link citation</button>
                </form>
              )}

              {citations.length === 0 ? (
                <p className="text-muted">No citations added yet.</p>
              ) : (
                <ul className="list-group">
                  {citations.map((item) => (
                    <li key={item.id} className="list-group-item">
                      <strong>{item.cited_title || 'Untitled publication'}</strong>
                      <div className="small text-muted">Cited by {item.citing_title || 'Unknown publication'}</div>
                      <div className="mt-2">
                        {item.is_verified && <span className="badge bg-success me-2">Verified</span>}
                        {item.is_flagged && <span className="badge bg-danger me-2">Flagged</span>}
                        {isReviewer && (
                          <>
                            <button className="btn btn-sm btn-outline-success me-1" onClick={() => toggleVerification(item.id, 'citation', !item.is_verified)}>
                              {item.is_verified ? 'Unverify' : 'Verify'}
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => toggleFlag(item.id, 'citation', !item.is_flagged)}>
                              {item.is_flagged ? 'Unflag' : 'Flag'}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <hr /><h6>Cited By ({citedBy.length})</h6>{citedBy.length ? <ul className="list-group mb-3">{citedBy.map((item) => <li className="list-group-item" key={item.id}><Link to={`/publications/${item.citing_publication_id}`}>{item.citing_title || 'Unknown publication'}</Link></li>)}</ul> : <p className="text-muted">No publications cite this work yet.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

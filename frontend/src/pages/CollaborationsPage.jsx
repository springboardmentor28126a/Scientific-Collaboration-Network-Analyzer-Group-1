import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";
import CoauthorPicker from "../components/publication/CoauthorPicker";
import {
  sendCollaborationRequest,
  fetchIncomingRequests,
  fetchSentRequests,
  fetchMyCollaborators,
  fetchMyResearcherId,
  respondToRequest,
} from "../services/collaborationService";

function statusBadgeClass(status) {
  if (status === "ACCEPTED") return "pub-badge pub-badge-published";
  if (status === "REJECTED") return "pub-badge pub-badge-rejected";
  return "pub-badge pub-badge-submitted";
}

function CollaborationsPage() {
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [myResearcherId, setMyResearcherId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedRecipient, setSelectedRecipient] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [incomingData, sentData, collabData, researcherId] = await Promise.all([
        fetchIncomingRequests(),
        fetchSentRequests(),
        fetchMyCollaborators(),
        fetchMyResearcherId(),
      ]);
      setIncoming(incomingData);
      setSent(sentData);
      setCollaborators(collabData);
      setMyResearcherId(researcherId);
    } catch (err) {
      toast.error("Could not load collaborations.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (selectedRecipient.length === 0) {
      toast.error("Search and select a researcher first.");
      return;
    }

    setSending(true);
    try {
      await sendCollaborationRequest({
        recipient_researcher_id: selectedRecipient[0].id,
        message,
      });
      toast.success("Collaboration request sent.");
      setSelectedRecipient([]);
      setMessage("");
      await loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send request.");
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (id, accept) => {
    try {
      await respondToRequest(id, accept);
      toast.success(accept ? "Collaboration accepted." : "Collaboration rejected.");
      await loadAll();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not respond to request.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Send a collaboration request</h4>
          <p className="text-muted mb-3">Search for a researcher on the platform to connect with.</p>

          <form onSubmit={handleSend}>
            <CoauthorPicker selectedCoauthors={selectedRecipient} onChange={setSelectedRecipient} />

            <label className="form-label mt-3">Message (optional)</label>
            <textarea
              className="form-control mb-3"
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce why you'd like to collaborate..."
            />

            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? "Sending..." : "Send request"}
            </button>
          </form>
        </div>
      </div>

      {incoming.length > 0 && (
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Incoming requests ({incoming.length})</h5>
            {incoming.map((req) => (
              <div key={req.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                  <strong>{req.requester.first_name} {req.requester.last_name}</strong>
                  {req.requester.designation && <span className="text-muted"> — {req.requester.designation}</span>}
                  {req.message && <p className="text-muted mb-0 small">"{req.message}"</p>}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-success btn-sm" onClick={() => handleRespond(req.id, true)}>Accept</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleRespond(req.id, false)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Sent requests ({sent.length})</h5>
          {sent.length === 0 ? (
            <p className="text-muted mb-0">You haven't sent any requests yet.</p>
          ) : (
            sent.map((req) => (
              <div key={req.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                  <strong>{req.recipient.first_name} {req.recipient.last_name}</strong>
                </div>
                <span className={statusBadgeClass(req.status)}>{req.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">My collaborators ({collaborators.length})</h5>
          {collaborators.length === 0 ? (
            <p className="text-muted mb-0">No active collaborations yet.</p>
          ) : (
            <div className="row">
              {collaborators.map((c) => {
                const other = c.requester.id === myResearcherId ? c.recipient : c.requester;
                return (
                  <div className="col-md-4 mb-3" key={c.id}>
                    <div className="border rounded-3 p-3">
                      <strong>{other.first_name} {other.last_name}</strong>
                      {other.designation && <p className="text-muted small mb-0">{other.designation}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CollaborationsPage;
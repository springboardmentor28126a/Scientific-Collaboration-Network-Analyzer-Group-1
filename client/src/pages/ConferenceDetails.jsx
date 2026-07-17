import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function ConferenceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConference();
  }, [id]);

  const loadConference = async () => {
    try {
      const response = await API.get(`/conference/details/${id}`);
      setConference(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading conference details...</div>;
  }

  if (!conference) {
    return <div style={{ padding: "30px" }}>Conference not found.</div>;
  }

  const meetingInfo = conference.conference;
  const isOnline = meetingInfo.conference_type === "Online" || meetingInfo.conference_type === "Hybrid";
  const now = new Date();
  const start = new Date(meetingInfo.start_date);
  const end = new Date(meetingInfo.end_date);
  const status = now < start ? "Upcoming" : now <= end ? "Live" : "Completed";

  const getCountdown = () => {
    const diff = start - now;
    if (diff <= 0) return "Starts soon";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={panelCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h1>🏛 {meetingInfo.name}</h1>
            <p style={{ color: "#475569", marginTop: "10px" }}>{meetingInfo.description}</p>
          </div>
          <div style={{ textAlign: "right", minWidth: "220px" }}>
            <div style={{ color: status === "Live" ? "#16a34a" : status === "Upcoming" ? "#0ea5e9" : "#64748b", fontWeight: 700, marginBottom: "10px" }}>{status}</div>
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>Starts In</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>{getCountdown()}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px", marginTop: "20px" }}>
          <DetailChip label="Organizer" value={meetingInfo.organizer} />
          <DetailChip label="Location" value={meetingInfo.location} />
          <DetailChip label="Dates" value={`${meetingInfo.start_date} → ${meetingInfo.end_date}`} />
          <DetailChip label="Type" value={meetingInfo.conference_type || "Physical"} />
        </div>

        {isOnline && (
          <div style={{ marginTop: "25px", padding: "24px", background: "#eef2ff", borderRadius: "18px", border: "1px solid #dbeafe" }}>
            <h2 style={{ margin: 0, color: "#1e3a8a" }}>Online Meeting Details</h2>
            <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
              <MeetingDetail label="Platform" value={meetingInfo.meeting_platform} />
              <MeetingDetail label="Host" value={meetingInfo.host_name} />
              <MeetingDetail label="Time Zone" value={meetingInfo.time_zone} />
              <MeetingDetail label="Meeting ID" value={meetingInfo.meeting_id} />
              <MeetingDetail label="Passcode" value={meetingInfo.passcode} />
              <MeetingDetail label="Joining Instructions" value={meetingInfo.joining_instructions} large />
            </div>
            {meetingInfo.meeting_link && (
              <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <a href={meetingInfo.meeting_link} target="_blank" rel="noreferrer" style={buttonPrimary}>
                  Join Meeting
                </a>
                <button style={buttonSecondary} onClick={() => navigator.clipboard.writeText(meetingInfo.meeting_link)}>
                  Copy Meeting Link
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "20px", marginTop: "30px" }}>
        <StatCard title="Publications" value={conference.statistics.publications} />
        <StatCard title="Researchers" value={conference.statistics.researchers} />
        <StatCard title="Institutions" value={conference.statistics.institutions} />
      </div>

      <Section title="Publications" marginTop>
        {conference.publications.length === 0 ? (
          <p>No publications are currently associated with this conference.</p>
        ) : (
          <div style={listGrid}>
            {conference.publications.map((publication) => (
              <EntityCard key={publication.id} title={publication.title} subtitle={`${publication.authors} • ${publication.publication_year}`} onClick={() => navigate(`/publication/${publication.id}`)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Researchers">
        {conference.researchers.length === 0 ? (
          <p>No researchers are associated with this conference.</p>
        ) : (
          <div style={listGrid}>
            {conference.researchers.map((researcher) => (
              <EntityCard key={researcher.id} title={researcher.name} subtitle={researcher.email} onClick={() => navigate(`/researcher/${researcher.id}`)} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Institutions">
        {conference.institutions.length === 0 ? (
          <p>No institutions are associated with this conference.</p>
        ) : (
          <div style={listGrid}>
            {conference.institutions.map((institution) => (
              <EntityCard key={institution.id} title={institution.name} subtitle={`${institution.city}, ${institution.country}`} onClick={() => navigate(`/institution/${institution.id}`)} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function DetailChip({ label, value }) {
  return (
    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)" }}>
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontWeight: "600", color: "#0f172a" }}>{value || "N/A"}</div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", padding: "24px", borderRadius: "18px", boxShadow: "0 16px 45px rgba(15, 23, 42, 0.06)" }}>
      <div style={{ color: "#334155", fontWeight: 700, fontSize: "18px", marginBottom: "10px" }}>{title}</div>
      <div style={{ fontSize: "34px", fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function Section({ title, children, marginTop }) {
  return (
    <div style={{ marginTop: marginTop ? "30px" : "20px" }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function EntityCard({ title, subtitle, onClick }) {
  return (
    <div style={entityCard} onClick={onClick}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ marginTop: "10px", color: "#475569" }}>{subtitle}</p>
      <button style={entityButton}>View</button>
    </div>
  );
}

function MeetingDetail({ label, value, large }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", minHeight: large ? "100px" : "auto" }}>
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>{label}</div>
      <div style={{ color: "#0f172a", lineHeight: "1.5" }}>{value || "N/A"}</div>
    </div>
  );
}

const buttonPrimary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  fontWeight: 600,
};

const buttonSecondary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  background: "rgba(255,255,255,0.06)",
  color: "#334155",
  cursor: "pointer",
};

const panelCard = {
  background: "rgba(255,255,255,0.06)",
  padding: "28px",
  borderRadius: "18px",
  boxShadow: "0 18px 60px rgba(15, 23, 42, 0.06)",
};

const listGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
  gap: "20px",
};

const entityCard = {
  background: "rgba(255,255,255,0.06)",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const entityButton = {
  marginTop: "20px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  alignSelf: "flex-start",
};

export default ConferenceDetails;

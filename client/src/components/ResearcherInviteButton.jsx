import { useState } from "react";
import api from "../services/api";
import useDismissibleLayer from "../hooks/useDismissibleLayer";
import { getAuthUser } from "../utils/authStorage";
import { hasPermission } from "../utils/permissions";

export default function ResearcherInviteButton({ researcher }) {
    const currentUser = getAuthUser();
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const dialogRef = useDismissibleLayer(() => setOpen(false), open);

    if (!researcher || researcher.id === currentUser?.id || !hasPermission("group:invite")) {
        return null;
    }

    const loadGroups = async () => {
        setOpen(true);
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await api.get(
                `/group-invitations/available-groups/${researcher.id}`,
                { params: { sender_id: currentUser.id } },
            );
            setGroups(response.data || []);
            setSelectedGroup("");
        } catch (requestError) {
            setError(requestError.response?.data?.detail || "Unable to load your research groups.");
        } finally {
            setLoading(false);
        }
    };

    const sendInvitation = async () => {
        if (!selectedGroup) return;
        setSending(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/group-invitations/send", {
                group_id: Number(selectedGroup),
                sender_id: currentUser.id,
                receiver_id: researcher.id,
            });
            setSuccess("Invitation sent successfully.");
            setGroups((current) => current.map((group) => (
                group.group_id === Number(selectedGroup)
                    ? { ...group, status: "pending" }
                    : group
            )));
        } catch (requestError) {
            setError(requestError.response?.data?.detail || "Unable to send the invitation.");
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <button type="button" onClick={loadGroups} style={buttonStyle}>
                Invite to Research Group
            </button>

            {open && (
                <div style={backdropStyle} role="presentation">
                    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="invite-researcher-title" style={dialogStyle}>
                        <div style={headerStyle}>
                            <div>
                                <span style={eyebrowStyle}>COLLABORATION</span>
                                <h2 id="invite-researcher-title" style={{ margin: "6px 0" }}>Invite to Research Group</h2>
                                <p style={{ margin: 0, color: "var(--muted)" }}>Invite {researcher.name} to one of your groups.</p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close invitation dialog" style={closeStyle}>×</button>
                        </div>

                        {loading ? <p>Loading your research groups...</p> : (
                            <>
                                <label htmlFor="researcher-invite-group">Research group</label>
                                <select id="researcher-invite-group" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)} style={selectStyle}>
                                    <option value="">Select a group</option>
                                    {groups.map((group) => (
                                        <option key={group.group_id} value={group.group_id} disabled={group.status !== "available"}>
                                            {group.group_name} ({group.status})
                                        </option>
                                    ))}
                                </select>
                                {groups.length === 0 && <p style={{ color: "var(--muted)" }}>You do not currently own or administer any groups.</p>}
                                {error && <p role="alert" style={errorStyle}>{error}</p>}
                                {success && <p role="status" style={successStyle}>{success}</p>}
                                <div style={actionsStyle}>
                                    <button type="button" onClick={() => setOpen(false)} style={secondaryStyle}>Close</button>
                                    <button type="button" onClick={sendInvitation} disabled={!selectedGroup || sending} style={buttonStyle}>
                                        {sending ? "Sending..." : "Send Invitation"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}

const buttonStyle = { background: "#2563eb", color: "white", border: "none", padding: "11px 17px", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };
const secondaryStyle = { ...buttonStyle, background: "transparent", color: "var(--text)", border: "1px solid var(--border)" };
const backdropStyle = { position: "fixed", inset: 0, background: "rgba(2, 8, 23, .68)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "20px" };
const dialogStyle = { width: "min(520px, 100%)", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "18px", padding: "26px", boxShadow: "var(--shadow)" };
const headerStyle = { display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "flex-start", marginBottom: "24px" };
const eyebrowStyle = { color: "var(--accent)", fontSize: "12px", letterSpacing: "0.12em", fontWeight: 700 };
const closeStyle = { border: 0, background: "transparent", color: "var(--muted)", fontSize: "28px", cursor: "pointer", lineHeight: 1 };
const selectStyle = { width: "100%", marginTop: "8px", padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface-alt)", color: "var(--text)" };
const actionsStyle = { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" };
const errorStyle = { color: "#ef4444" };
const successStyle = { color: "#22c55e" };

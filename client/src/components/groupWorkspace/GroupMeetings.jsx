import { useEffect, useState } from "react";
import api from "../../services/api";

export default function GroupMeetings({ groupId }) {

    const user = JSON.parse(localStorage.getItem("user"));

    const [meetings, setMeetings] = useState([]);

    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        meeting_date: "",
        meeting_time: "",
        meeting_link: ""
    });

    useEffect(() => {
        loadMeetings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    const loadMeetings = async () => {

        try {

            const res = await api.get(`/meetings/group/${groupId}`);

            setMeetings(res.data);

        } catch (err) {

            console.error(err);

        }

    };

    const createMeeting = async () => {

        try {

            await api.post("/meetings/create", {

                group_id: Number(groupId),

                ...form

            });

            setShowModal(false);

            setForm({
                title: "",
                description: "",
                meeting_date: "",
                meeting_time: "",
                meeting_link: ""
            });

            loadMeetings();

        } catch (err) {

            console.error(err);

            alert("Failed to create meeting");

        }

    };

    const deleteMeeting = async (id) => {

        if (!window.confirm("Delete this meeting?")) return;

        try {

            await api.delete(`/meetings/${id}`);

            loadMeetings();

        } catch (err) {

            console.error(err);

        }

    };

    return (

        <div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px"
                }}
            >

                <h2>Meetings</h2>

                <button onClick={() => setShowModal(true)}>
                    + Schedule Meeting
                </button>

            </div>

            {
                meetings.length === 0 && (

                    <div
                        style={{
                            background: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >
                        No meetings scheduled.
                    </div>

                )
            }

            {
                meetings.map(meeting => (

                    <div
                        key={meeting.id}
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            boxShadow: "0 4px 12px rgba(0,0,0,.08)"
                        }}
                    >

                        <h3>{meeting.title}</h3>

                        <p>{meeting.description}</p>

                        <p>
                            📅 {meeting.meeting_date}
                        </p>

                        <p>
                            🕒 {meeting.meeting_time}
                        </p>

                        {
                            meeting.meeting_link && (

                                <a
                                    href={meeting.meeting_link}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Join Meeting
                                </a>

                            )
                        }

                        <br /><br />

                        {(user?.role === "System Admin" || meeting.created_by === user?.id) && (
                            <button onClick={() => deleteMeeting(meeting.id)}>
                                Delete
                            </button>
                        )}

                    </div>

                ))
            }

            {
                showModal && (

                    <div className="modal-overlay">

                        <div className="modal">

                            <h2>Schedule Meeting</h2>

                            <input
                                placeholder="Title"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        title: e.target.value
                                    })
                                }
                            />

                            <textarea
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value
                                    })
                                }
                            />

                            <input
                                type="date"
                                value={form.meeting_date}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        meeting_date: e.target.value
                                    })
                                }
                            />

                            <input
                                type="time"
                                value={form.meeting_time}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        meeting_time: e.target.value
                                    })
                                }
                            />

                            <input
                                placeholder="Meeting Link"
                                value={form.meeting_link}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        meeting_link: e.target.value
                                    })
                                }
                            />

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "20px"
                                }}
                            >

                                <button onClick={createMeeting}>
                                    Create
                                </button>

                                <button
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

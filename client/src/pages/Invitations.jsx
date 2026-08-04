import { useEffect, useState } from "react";
import api from "../services/api";

export default function Invitations() {

    const [invitations, setInvitations] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadInvitations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadInvitations = async () => {

        try {

            const [groupRes, friendRes] = await Promise.all([
                api.get(`/group-invitations/user/${user.id}`),
                api.get(`/friends/requests/${user.id}`)
            ]);

            setInvitations(groupRes.data);
            setFriendRequests(friendRes.data);

        } catch (err) {

            console.error(err);

        }

    };

    const acceptInvitation = async (id) => {

        try {

            await api.put(`/group-invitations/accept/${id}`);

            loadInvitations();

        } catch (err) {

            console.error(err);

        }

    };

    const rejectInvitation = async (id) => {

        try {

            await api.put(`/group-invitations/reject/${id}`);

            loadInvitations();

        } catch (err) {

            console.error(err);

        }

    };

    const acceptFriend = async (id) => {

        try {

            await api.put(`/friends/accept/${id}`);

            loadInvitations();

        } catch (err) {

            console.error(err);

        }

    };

    const rejectFriend = async (id) => {

        try {

            await api.put(`/friends/reject/${id}`);

            loadInvitations();

        } catch (err) {

            console.error(err);

        }

    };

    return (

        <div style={{ padding: 30 }}>

            <h1>My Invitations</h1>

            {/* ---------------- GROUP INVITATIONS ---------------- */}

            <h2>👥 Research Group Invitations</h2>

            {invitations.length === 0 ? (

                <p>No pending group invitations.</p>

            ) : (

                invitations.map((invite) => (

                    <div
                        key={invite.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 10,
                            padding: 20,
                            marginBottom: 20,
                            background: "white"
                        }}
                    >

                        <h3>{invite.group_name}</h3>

                        <p>
                            Invited by <b>{invite.sender_name}</b>
                        </p>

                        <p>Status : {invite.status}</p>

                        <button
                            onClick={() =>
                                acceptInvitation(invite.id)
                            }
                            style={{ marginRight: 10 }}
                        >
                            Accept
                        </button>

                        <button
                            onClick={() =>
                                rejectInvitation(invite.id)
                            }
                        >
                            Reject
                        </button>

                    </div>

                ))

            )}

            <hr style={{ margin: "40px 0" }} />

            {/* ---------------- FRIEND REQUESTS ---------------- */}

            <h2>👤 Friend Requests</h2>

            {friendRequests.length === 0 ? (

                <p>No pending friend requests.</p>

            ) : (

                friendRequests.map((request) => (

                    <div
                        key={request.request_id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 10,
                            padding: 20,
                            marginBottom: 20,
                            background: "white"
                        }}
                    >

                        <h3>{request.sender_name}</h3>

                        <p>{request.sender_email}</p>

                        <p>Status : {request.status}</p>

                        <button
                            onClick={() =>
                                acceptFriend(request.request_id)
                            }
                            style={{ marginRight: 10 }}
                        >
                            Accept
                        </button>

                        <button
                            onClick={() =>
                                rejectFriend(request.request_id)
                            }
                        >
                            Reject
                        </button>

                    </div>

                ))

            )}

        </div>

    );

}

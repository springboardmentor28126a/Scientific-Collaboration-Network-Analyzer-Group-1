import { useEffect, useState } from "react";
import api from "../services/api";

export default function Invitations() {

    const [invitations, setInvitations] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {

        try {

            const res = await api.get(
                `/group-invitations/user/${user.id}`
            );

            setInvitations(res.data);

        } catch (err) {

            console.error(err);

        }

    };

    const acceptInvitation = async (id) => {

        try {

            await api.put(
                `/group-invitations/accept/${id}`
            );

            loadInvitations();

        } catch (err) {

            console.error(err);

        }

    };

    const rejectInvitation = async (id) => {

        try {

            await api.put(
                `/group-invitations/reject/${id}`
            );

            loadInvitations();

        } catch (err) {

            console.error(err);

        }

    };

    return (

        <div style={{ padding: 30 }}>

            <h1>My Invitations</h1>

            {invitations.length === 0 ? (
                <p>No pending invitations.</p>
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

        </div>

    );

}
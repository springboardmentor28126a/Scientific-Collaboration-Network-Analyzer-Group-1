import { useEffect, useState } from "react";
import api from "../../services/api";

export default function GroupMembers({ groupId }) {

    const [members, setMembers] = useState([]);

    useEffect(() => {

        loadMembers();

    }, [groupId]);

    const loadMembers = async () => {

        try {

            const res = await api.get(`/groups/${groupId}/members`);

            setMembers(res.data);

        }

        catch (err) {

            console.error(err);

        }

    };

    return (

        <div
            style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,.08)"
            }}
        >

            <h2>Group Members</h2>

            {
                members.length === 0 ? (

                    <p>No members found.</p>

                ) : (

                    members.map(member => (

                        <div
                            key={member.user_id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "15px",
                                marginTop: "15px",
                                border: "1px solid #e5e7eb",
                                borderRadius: "10px"
                            }}
                        >

                            <div>

                                <h3>{member.name}</h3>

                                <p>{member.email}</p>

                                <small>{member.institution}</small>

                            </div>

                            <div>

                                <strong>{member.role}</strong>

                            </div>

                        </div>

                    ))

                )
            }

        </div>

    );

}
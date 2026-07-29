import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useState } from "react";
function ResearcherCard({ researcher }) {
    const [showInviteModal, setShowInviteModal] = useState(false);
const [groupStatus, setGroupStatus] = useState([]);
const [selectedGroup, setSelectedGroup] = useState("");
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
const loadAvailableGroups = async () => {

    try {

        const res = await api.get(
            `/group-invitations/available-groups/${researcher.id}`,
            {
                params: {
                    sender_id: user.id
                }
            }
        );

        setGroupStatus(res.data);

    } catch (err) {

        console.error(err);

    }

};

const openInviteModal = async () => {

    setShowInviteModal(true);

    try {

        await loadAvailableGroups();

    } catch (err) {

        console.error(err);

    }

};
const sendInvitation = async (groupId) => {

    try {

        await api.post("/group-invitations/send", {
            group_id: groupId,
            sender_id: user.id,
            receiver_id: researcher.id
        });

        alert("Invitation sent successfully!");

        loadAvailableGroups();

    } catch (err) {

        alert(
            err.response?.data?.detail ||
            "Failed to send invitation."
        );

    }

};
//     const sendRequest = async () => {

//     try {

//         await api.post("/collaboration/send", {

//             sender_id: user.id,

//             receiver_id: researcher.id,

//             message: "Let's collaborate."

//         });

//         alert("✅ Collaboration Request Sent");

//     }

//     catch (err) {

//         if (err.response) {

//             alert(err.response.data.detail);

//         }

//         else {

//             alert("Server Error");

//         }

//     }

// };
    return (
          <>  {
    showInviteModal && (

        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999
            }}
        >

            <div
                style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "15px",
                    width: "400px",
                    boxShadow: "0 10px 30px rgba(0,0,0,.25)"
                }}
            >

                <h2>Invite to Research Group</h2>

                <p>
                    Invite <b>{researcher.name}</b> to one of your groups.
                </p>

                <select
                    value={selectedGroup}
                    onChange={(e) =>
                        setSelectedGroup(e.target.value)
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "15px",
                        marginBottom: "20px"
                    }}
                >

                    <option value="">
                        Select Research Group
                    </option>

                    {
                        myGroups.map(group => (

                            <option
                                key={group.id}
                                value={group.id}
                            >
                                {group.name}
                            </option>

                        ))
                    }

                </select>

                <div
    style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginTop: "20px"
    }}
>

{
groupStatus.map(group => (

<div
    key={group.group_id}
    style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    }}
>

<div>

<h3>{group.group_name}</h3>

<small>{group.status}</small>

</div>

{
group.status === "available" && (

<button
onClick={() => sendInvitation(group.group_id)}
>
Invite
</button>

)}

{
group.status === "pending" && (

<button disabled>
Invitation Sent
</button>

)}

{
group.status === "member" && (

<button disabled>
Member
</button>

)}

</div>

))
}

</div>

            </div>

        </div>

    )
}
        <div
            style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "15px",
                padding: "25px",
                boxShadow: "0 5px 18px rgba(0,0,0,.08)",
                transition: ".3s"
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px"
                }}
            >

                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "25px",
                        fontWeight: "bold"
                    }}
                >

                    {researcher.name?.charAt(0).toUpperCase()}

                </div>

                <div>

                    <h3
                        style={{
                            margin: 0
                        }}
                    >
                        {researcher.name}
                    </h3>

                    <small>{researcher.role}</small>

                </div>

            </div>

            <hr />

            <p>🏫 {researcher.institution || "Not Added"}</p>

            <p>💻 {researcher.department || "Not Added"}</p>

            <p>🔬 {researcher.research_interest || "Not Added"}</p>

            <p>🌍 {researcher.country || "Not Added"}</p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px"
                }}
            >

                <button
    onClick={() =>
        navigate(`/researcher/${researcher.id}`)
    }
>

    View Profile

</button>

                <button onClick={openInviteModal}>
    Invite to Group
</button>

            </div>

        </div>
</>
    );

}

export default ResearcherCard;
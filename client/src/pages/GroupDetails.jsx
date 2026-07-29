import { useParams, useNavigate } from "react-router-dom";

export default function GroupDetails() {

    const { groupId } = useParams();

    const navigate = useNavigate();

    return (

        <div style={{ padding: 30 }}>

            <h1>Research Group</h1>

            <p>Group ID : {groupId}</p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: 20,
                    marginTop: 30
                }}
            >

                <div
                    style={cardStyle}
                    onClick={() => navigate(`/groups/${groupId}/members`)}
                >
                    👥
                    <h3>Members</h3>
                    <p>View all group members</p>
                </div>

                <div
                    style={cardStyle}
                    onClick={() => navigate(`/groups/${groupId}/chat`)}
                >
                    💬
                    <h3>Chat</h3>
                    <p>Open group chat</p>
                </div>

                <div
                    style={cardStyle}
                    onClick={() => navigate(`/groups/${groupId}/meetings`)}
                >
                    📅
                    <h3>Meetings</h3>
                    <p>Manage meetings</p>
                </div>

                <div
                    style={cardStyle}
                    onClick={() => navigate(`/groups/${groupId}/files`)}
                >
                    📁
                    <h3>Files</h3>
                    <p>Shared documents</p>
                </div>

            </div>

        </div>

    );

}

const cardStyle = {
    background: "white",
    borderRadius: 12,
    padding: 30,
    cursor: "pointer",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,.1)"
};
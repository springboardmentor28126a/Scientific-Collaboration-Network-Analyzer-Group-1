import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function GroupWorkspace() {

    const { groupId } = useParams();

    const [group, setGroup] = useState(null);

    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {

        loadGroup();

    }, []);

    const loadGroup = async () => {

        try {

            const res = await api.get(`/groups/${groupId}`);

            setGroup(res.data);

        }

        catch (err) {

            console.error(err);

        }

    };

    if (!group)
        return <h2>Loading...</h2>;

    return (

        <div style={{ padding: "30px" }}>

            <h1>{group.name}</h1>

            <p>{group.description}</p>

            <p><b>Created By:</b> {group.created_by_name}</p>

            <p><b>Members:</b> {group.member_count}</p>

            <hr />

            <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px"
                }}
            >

                <button onClick={() => setActiveTab("overview")}>
                    Overview
                </button>

                <button onClick={() => setActiveTab("members")}>
                    Members
                </button>

                <button onClick={() => setActiveTab("chat")}>
                    Chat
                </button>

                <button onClick={() => setActiveTab("meetings")}>
                    Meetings
                </button>

                <button onClick={() => setActiveTab("files")}>
                    Files
                </button>

                <button onClick={() => setActiveTab("analytics")}>
                    Analytics
                </button>

            </div>

            {activeTab === "overview" && (
                <div>
                    <h2>Group Overview</h2>

                    <p>{group.description}</p>
                </div>
            )}

            {activeTab === "members" && (
                <div>
                    Members page coming next...
                </div>
            )}

            {activeTab === "chat" && (
                <div>
                    Chat page coming next...
                </div>
            )}

            {activeTab === "meetings" && (
                <div>
                    Meetings page coming next...
                </div>
            )}

            {activeTab === "files" && (
                <div>
                    Files page coming next...
                </div>
            )}

            {activeTab === "analytics" && (
                <div>
                    Analytics page coming next...
                </div>
            )}

        </div>

    );
}

export default GroupWorkspace;
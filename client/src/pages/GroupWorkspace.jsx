import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

import GroupOverview from "../components/groupWorkspace/GroupOverview";
import GroupMembers from "../components/groupWorkspace/GroupMembers";
import GroupChat from "../components/groupWorkspace/GroupChat";
import GroupMeetings from "../components/groupWorkspace/GroupMeetings";
import GroupFiles from "../components/groupWorkspace/GroupFiles";
import GroupAnalytics from "../components/groupWorkspace/GroupAnalytics";

export default function GroupWorkspace() {

    const { groupId } = useParams();

    const [group, setGroup] = useState(null);

    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {

        loadGroup();

    }, [groupId]);

    const loadGroup = async () => {

        try {

            const res = await api.get(`/groups/${groupId}`);

            setGroup(res.data);

        }

        catch (err) {

            console.error(err);

        }

    };

    if (!group) return <h2>Loading...</h2>;

    return (

        <div
            style={{
                padding: "30px",
                maxWidth: "1200px",
                margin: "0 auto"
            }}
        >

            <div
                style={{
                    background: "#fff",
                    borderRadius: "15px",
                    padding: "25px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.08)"
                }}
            >

                <h1>{group.name}</h1>

                <p>{group.description}</p>

                <div
                    style={{
                        display: "flex",
                        gap: "30px",
                        marginTop: "20px"
                    }}
                >
                    <span>👤 {group.created_by_name}</span>

                    <span>👥 {group.member_count} Members</span>

                    <span>
                        📅 {new Date(group.created_at).toLocaleDateString()}
                    </span>

                </div>

            </div>

            <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "30px",
                    marginBottom: "25px"
                }}
            >

                <button onClick={() => setActiveTab("overview")}>Overview</button>

                <button onClick={() => setActiveTab("members")}>Members</button>

                <button onClick={() => setActiveTab("chat")}>Chat</button>

                <button onClick={() => setActiveTab("meetings")}>Meetings</button>

                <button onClick={() => setActiveTab("files")}>Files</button>

                <button onClick={() => setActiveTab("analytics")}>Analytics</button>

            </div>

            {activeTab === "overview" &&
                <GroupOverview group={group} />
            }

            {activeTab === "members" &&
                <GroupMembers groupId={groupId} />
            }

            {activeTab === "chat" &&
                <GroupChat groupId={groupId} />
            }

            {activeTab === "meetings" &&
                <GroupMeetings groupId={groupId} />
            }

            {activeTab === "files" &&
                <GroupFiles groupId={groupId} />
            }

            {activeTab === "analytics" &&
                <GroupAnalytics groupId={groupId} />
            }

        </div>

    );

}

import { useEffect, useState } from "react";
import API from "../services/api";


function DashboardHome() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [stats, setStats] = useState({

        publications: 0,

        collaborations: 0,

        citations: 0,

        pending_reviews: 0

    });
const [activePanel, setActivePanel] = useState("activity");
const [publications, setPublications] = useState([]);
const [loading, setLoading] = useState(false);
const [collaborations, setCollaborations] = useState([]);
const [citations, setCitations] = useState([]);
const [reviews, setReviews] = useState([]);

const [collabLoading, setCollabLoading] = useState(false);
const [citationLoading, setCitationLoading] = useState(false);
const [reviewLoading, setReviewLoading] = useState(false);
const [meetings, setMeetings] = useState([]);
const [meetingLoading, setMeetingLoading] = useState(false);
useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const response = await API.get(

                `/dashboard/stats/${user.id}`

            );

            setStats(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };
const loadPublications = async () => {

    try {

        setLoading(true);

        const response = await API.get(
            `/publications/user/${user.id}`
        );

        setPublications(response.data);

    }

    catch (error) {

        console.log(error);

    }

    finally {

        setLoading(false);

    }

};
const loadCollaborations = async () => {

    try {

        setCollabLoading(true);

        const response = await API.get(
            `/collaboration/list/${user.id}`
        );

        setCollaborations(response.data);

    }

    catch (error) {

        console.log(error);

    }

    finally {

        setCollabLoading(false);

    }

};
const loadCitations = () => {
    setCitations([
        {
            id: 1,
            total: stats.citations,
            most_cited: "Coming Soon"
        }
    ]);
};
const loadMeetings = () => {
    setMeetings([
        {
            id: 1,
            title: "No Upcoming Meetings"
        }
    ]);
};
const handlePanelClick = (panel, loader = null) => {
    if (activePanel === panel) {
        setActivePanel("activity");
        return;
    }

    setActivePanel(panel);

    if (loader) {
        loader();
    }
};

    return (

        <div>

            <h1>

                Welcome, {user?.name} 👋

            </h1>

            <p
                style={{
                    color: "#666",
                    fontSize: "18px"
                }}
            >

                Role: {user?.role}

            </p>

            <hr />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "20px",
                    marginTop: "30px"
                }}
            >

              <div
    style={cardStyle(activePanel === "publications")}
    onClick={() =>
        handlePanelClick(
            "publications",
            publications.length === 0 ? loadPublications : null
        )
    }
>
                    <h3>📚 Publications</h3>
                    <h1>{stats.publications}</h1>
                </div>

                <div
    style={cardStyle(activePanel === "collaborations")}
    onClick={() =>
        handlePanelClick(
            "collaborations",
            collaborations.length === 0
                ? loadCollaborations
                : null
        )
    }
>
                    <h3>🤝 Collaborations</h3>
                    <h1>{stats.collaborations}</h1>
                </div>

                <div
    style={cardStyle(activePanel === "citations")}
    onClick={() =>
    handlePanelClick(
        "citations",
        citations.length === 0
            ? loadCitations
            : null
    )
}
>
                    <h3>⭐ Citations</h3>
                    <h1>{stats.citations}</h1>
                </div>

               <div
    style={cardStyle(activePanel === "reviews")}
    onClick={() =>
    handlePanelClick(
        "meetings",
        meetings.length === 0
            ? loadMeetings
            : null
    )
}
>
                    <h3>📅 Upcoming Meetings</h3>
                    <h1>{stats.pending_reviews}</h1>
                </div>

            </div>
    <div
    style={{
        marginTop: "40px",
        background: "rgba(255,255,255,.05)",
        borderRadius: "15px",
        padding: "25px",
        minHeight: "350px"
    }}
>

    {activePanel === "activity" && (
        <>
            <h2>📈 Recent Activity</h2>
            <p>Select any dashboard card to view your information.</p>
        </>
    )}

    {activePanel === "publications" && (
    <>
        <h2>📚 My Publications</h2>

        {loading ? (
            <p>Loading publications...</p>
        ) : publications.length === 0 ? (
            <p>No publications found.</p>
        ) : (
            publications.map((pub) => (
                <div
                    key={pub.id}
                    style={{
                        marginTop: "15px",
                        padding: "18px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}
                >
                    <h3>{pub.title}</h3>

                    <p>
                        <strong>Authors:</strong> {pub.authors}
                    </p>

                    <p>
                        <strong>Year:</strong> {pub.publication_year}
                    </p>

                    <p>
                        <strong>Status:</strong> {pub.status}
                    </p>

                    <p>
                        <strong>Type:</strong> {pub.publication_type}
                    </p>
                </div>
            ))
        )}
    </>
)}

   {activePanel === "collaborations" && (
    <>
        <h2>🤝 My Collaborations</h2>

        {collabLoading ? (
            <p>Loading collaborations...</p>
        ) : collaborations.length === 0 ? (
            <p>No collaborations found.</p>
        ) : (
            collaborations.map((collab) => (
                <div
                    key={collab.id}
                    style={{
                        marginTop: "15px",
                        padding: "18px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}
                >
                    <h3>
                        {collab.name || collab.collaborator_name || "Collaborator"}
                    </h3>

                    <p>
                        <strong>Email:</strong> {collab.email}
                    </p>

                    <p>
                        <strong>Institution:</strong> {collab.institution}
                    </p>

                    <p>
                        <strong>Department:</strong> {collab.department}
                    </p>
                </div>
            ))
        )}
    </>
)}

    {activePanel === "citations" && (
    <>
        <h2>⭐ Citation Analytics</h2>

        <div
            style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,.05)"
            }}
        >
            <h3>Total Citations</h3>

            <h1>{stats.citations}</h1>

            <p>
                Detailed citation analytics will be available soon.
            </p>
        </div>
    </>
)}

    {activePanel === "meetings" && (
    <>
        <h2>📅 Upcoming Meetings</h2>

        {meetings.map((meeting) => (
            <div
                key={meeting.id}
                style={{
                    marginTop: "15px",
                    padding: "18px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,.05)"
                }}
            >
                <h3>{meeting.title}</h3>
            </div>
        ))}
    </>
)}

</div>        

        </div>

    );

}

const cardStyle = (isActive) => ({
    background: isActive
        ? "linear-gradient(135deg,#2563eb,#3b82f6)"
        : "rgba(255,255,255,0.06)",

    color: isActive ? "#fff" : "inherit",

    padding: "25px",

    borderRadius: "15px",

    boxShadow: isActive
        ? "0 8px 25px rgba(37,99,235,.45)"
        : "0 4px 12px rgba(0,0,0,.1)",

    textAlign: "center",

    cursor: "pointer",

    transition: "all .3s ease",

    transform: isActive ? "translateY(-5px)" : "translateY(0)"
});

export default DashboardHome;
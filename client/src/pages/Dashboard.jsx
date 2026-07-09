import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem("user")
    );
    const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/");

};

    return (

    <div
        style={{
            display: "flex",
            minHeight: "100vh",
            background: "#f4f7fb"
        }}
    >

        {/* Sidebar */}

        <div
            style={{
                width: "250px",
                background: "#2563eb",
                color: "white",
                padding: "25px"
            }}
        >

            <h2>🔬 SCNA</h2>

            <hr style={{ borderColor: "white" }} />

            <p style={menuStyle}>🏠 Dashboard</p>

            <p
    style={menuStyle}
    onClick={() => navigate("/profile")}
>
👤 Profile
</p>

            <p
    style={menuStyle}
    onClick={() => navigate("/publications")}
>
📚 Publications
</p>

            <p style={menuStyle}>🤝 Collaborations</p>

            <p style={menuStyle}>🔔 Notifications</p>

            <p style={menuStyle}>⚙ Settings</p>

            <p
    style={menuStyle}
    onClick={logout}
>
    🚪 Logout
</p>

        </div>

        {/* Main Content */}

        <div
            style={{
                flex: 1,
                padding: "40px"
            }}
        >

            <h1>

                Welcome,
                {" "}
                {user?.name}
                {" "}
                👋

            </h1>

            <p
                style={{
                    color: "#666",
                    fontSize: "18px"
                }}
            >

                Role :
                {" "}
                {user?.role}

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

    <div style={cardStyle}>
        <h3>📚 Publications</h3>
        <h1>12</h1>
    </div>

    <div style={cardStyle}>
        <h3>🤝 Collaborations</h3>
        <h1>4</h1>
    </div>

    <div style={cardStyle}>
        <h3>⭐ Citations</h3>
        <h1>38</h1>
    </div>

    <div style={cardStyle}>
        <h3>📝 Pending Reviews</h3>
        <h1>2</h1>
    </div>

</div>
        </div>

    </div>

);

}

const menuStyle = {

    padding: "12px",

    cursor: "pointer",

    borderRadius: "8px",

    marginBottom: "10px",

    transition: "0.3s"

};
const cardStyle = {

    background: "white",

    padding: "25px",

    borderRadius: "12px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

    textAlign: "center",

    transition: "0.3s"

};
export default Dashboard;
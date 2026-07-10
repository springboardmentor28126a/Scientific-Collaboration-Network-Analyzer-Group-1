import { useNavigate, useLocation } from "react-router-dom";
function Dashboard() {

    const navigate = useNavigate();
    const location = useLocation();
    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <div
            style={{
                width: "250px",
                background: "#2563eb",
                color: "white",
                padding: "25px",
                minHeight: "100vh"
            }}
        >

            <h2>🔬 SCNA</h2>

            <hr style={{ borderColor: "white" }} />

           <p

    style={
        location.pathname === "/dashboard"
            ? activeMenu
            : menuStyle
    }

    onClick={() => navigate("/dashboard")}

>

🏠 Dashboard

</p>

            
            <p

    style={
        location.pathname === "/publications"
            ? activeMenu
            : menuStyle
    }

    onClick={() => navigate("/publications")}

>

📚 Publications

</p>
            <p
                style={menuStyle}
            >
                🤝 Collaborations
            </p>

            <p
                style={menuStyle}
            >
                🔔 Notifications
            </p>

            
        </div>

    );

}

const menuStyle = {

    padding: "14px 18px",

    cursor: "pointer",

    borderRadius: "10px",

    marginBottom: "10px",

    fontSize: "17px",

    fontWeight: "500",

    transition: "all .3s"

};

const activeMenu = {

    background: "rgba(255,255,255,.18)",

    padding: "14px 18px",

    borderRadius: "10px",

    fontWeight: "bold"

};

export default Dashboard;
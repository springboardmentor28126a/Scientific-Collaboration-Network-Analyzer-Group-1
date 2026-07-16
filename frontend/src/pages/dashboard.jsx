import "../css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        const getProfile = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await API.get("/profile", {

                    headers: {
                        Authorization: `Bearer ${token}`
                    }

                });

                setUser(response.data.user);

            }

            catch (error) {

                console.log(error);

                navigate("/login");

            }

        };

        getProfile();

    }, []);

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };

    return (

        <div className="dashboard-container">

            <div className="dashboard-card">

                <h1>Scientific Collaboration Network Analyzer</h1>

                <h2>Dashboard</h2>

                {user && (

                    <div className="profile-box">

                        <h3>Welcome, {user.name}</h3>

                        <p><b>Email :</b> {user.email}</p>

                    </div>

                )}

                <div className="dashboard-buttons">

                    <button onClick={() => navigate("/researcher")}>
                        Researcher Profile
                    </button>

                    <button disabled>
                        Publications (Coming Soon)
                    </button>

                    <button disabled>
                        Collaborations (Coming Soon)
                    </button>

                    <button disabled>
                        Institutions (Coming Soon)
                    </button>

                </div>

                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>

            </div>

        </div>

    );

}

export default Dashboard;
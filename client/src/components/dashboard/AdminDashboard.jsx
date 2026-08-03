import { useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminDashboard() {

    const [stats, setStats] = useState({});

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        const res = await API.get(
            "/admin/dashboard"
        );

        setStats(res.data);

    };

    return (

        <div>

            <h1>⚙ System Admin Dashboard</h1>

            <div className="dashboard-grid">

                <div className="card">

                    <h2>{stats.users}</h2>

                    <p>Users</p>

                </div>

                <div className="card">

                    <h2>{stats.publications}</h2>

                    <p>Publications</p>

                </div>

                <div className="card">

                    <h2>{stats.institutions}</h2>

                    <p>Institutions</p>

                </div>

                <div className="card">

                    <h2>{stats.researchers}</h2>

                    <p>Researchers</p>

                </div>

                <div className="card">

                    <h2>{stats.reviewers}</h2>

                    <p>Reviewers</p>

                </div>

                <div className="card">

                    <h2>{stats.faculty}</h2>

                    <p>Faculty</p>

                </div>

            </div>

        </div>

    );

}
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function FacultyDashboard() {

    const [data, setData] = useState({});

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        const res = await API.get(
            "/faculty/dashboard"
        );

        setData(res.data);

    };

    return (

        <div>

            <h1>🏫 Faculty Dashboard</h1>

            <div className="dashboard-grid">

                <div className="card">

                    <h2>{data.researchers}</h2>

                    <p>Researchers</p>

                </div>

                <div className="card">

                    <h2>{data.students}</h2>

                    <p>Students</p>

                </div>

                <div className="card">

                    <h2>

                        {data.institution}

                    </h2>

                    <p>Institution</p>

                </div>

            </div>

        </div>

    );

}
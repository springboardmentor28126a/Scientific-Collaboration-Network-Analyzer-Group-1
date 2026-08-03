import { useEffect, useState } from "react";
import API from "../../services/api";

export default function ResearcherDashboard() {

    const user = JSON.parse(localStorage.getItem("user"));
    const [verification, setVerification] = useState(null);

    const [stats, setStats] = useState({});

    useEffect(() => {

        loadDashboard();
        loadVerification();
    }, []);

    const loadDashboard = async () => {

        try {

            const res = await API.get(
                `/dashboard/stats/${user.id}`
            );

            setStats(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };
    const loadVerification = async () => {

    const res = await API.get(
        "/verification/status"
    );

    setVerification(res.data);

};

    return (

        <div>

            <h1>👨‍🔬 Researcher Dashboard</h1>

           <div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>

<h2>

Welcome {user.name}

</h2>

<p>

{user.role}

</p>

</div>

<div>

{verification?.status==="Approved" && (

<span
style={{
color:"green",
fontWeight:"bold"
}}
>

🟢 Verified

</span>

)}

{verification?.status==="Pending" && (

<span
style={{
color:"orange",
fontWeight:"bold"
}}
>

🟡 Pending

</span>

)}

{verification?.status==="Rejected" && (

<span
style={{
color:"red",
fontWeight:"bold"
}}
>

🔴 Rejected

</span>

)}

</div>

</div>

            <div className="dashboard-grid">

                <div className="card">

                    <h2>{stats.publications || 0}</h2>

                    <p>Publications</p>

                </div>

                <div className="card">

                    <h2>{stats.collaborations || 0}</h2>

                    <p>Collaborations</p>

                </div>

                <div className="card">

                    <h2>{stats.citations || 0}</h2>

                    <p>Citations</p>

                </div>

                <div className="card">

                    <h2>{stats.pending_reviews || 0}</h2>

                    <p>Pending Reviews</p>

                </div>

            </div>

        </div>

    );

}

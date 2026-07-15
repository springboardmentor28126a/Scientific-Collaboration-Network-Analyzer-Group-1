// import { useEffect, useState } from "react";
// import API from "../services/api";
// function DashboardHome() {

//     const user = JSON.parse(
//         localStorage.getItem("user")
//     );

//     return (

//         <div>

//             <h1>

//                 Welcome,
//                 {" "}
//                 {user?.name}
//                 👋

//             </h1>

//             <p
//                 style={{
//                     color:"#666",
//                     fontSize:"18px"
//                 }}
//             >

//                 Role :
//                 {" "}
//                 {user?.role}

//             </p>

//             <hr />

//             <div
//                 style={{
//                     display:"grid",
//                     gridTemplateColumns:"repeat(4,1fr)",
//                     gap:"20px",
//                     marginTop:"30px"
//                 }}
//             >

//                 <div style={cardStyle}>
//                     <h3>📚 Publications</h3>
//                     <h1>{stats.publications}</h1>
//                 </div>

//                 <div style={cardStyle}>
//                     <h3>🤝 Collaborations</h3>
//                     <h1>{stats.collaborations}</h1>
//                 </div>

//                 <div style={cardStyle}>
//                     <h3>⭐ Citations</h3>
//                     <h1>{stats.citations}</h1>
//                 </div>

//                 <div style={cardStyle}>
//                     <h3>📝 Pending Reviews</h3>
//                     <h1>{stats.pending_reviews}</h1>
//                 </div>

//             </div>

//         </div>

//     );

// }

// const cardStyle = {

//     background:"white",

//     padding:"25px",

//     borderRadius:"12px",

//     boxShadow:"0 4px 12px rgba(0,0,0,.1)",

//     textAlign:"center"

// };
// const [stats, setStats] = useState({

//     publications: 0,

//     collaborations: 0,

//     citations: 0,

//     pending_reviews: 0

// });
// const loadDashboard = async () => {

//     try {

//         const user = JSON.parse(

//             localStorage.getItem("user")

//         );

//         const response = await API.get(

//             `/dashboard/stats/${user.id}`

//         );

//         setStats(response.data);

//     }

//     catch (error) {

//         console.log(error);

//     }

// };

// export default DashboardHome;
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

                <div style={cardStyle}>
                    <h3>📚 Publications</h3>
                    <h1>{stats.publications}</h1>
                </div>

                <div style={cardStyle}>
                    <h3>🤝 Collaborations</h3>
                    <h1>{stats.collaborations}</h1>
                </div>

                <div style={cardStyle}>
                    <h3>⭐ Citations</h3>
                    <h1>{stats.citations}</h1>
                </div>

                <div style={cardStyle}>
                    <h3>📝 Pending Reviews</h3>
                    <h1>{stats.pending_reviews}</h1>
                </div>

            </div>

        </div>

    );

}

const cardStyle = {

    background: "white",

    padding: "25px",

    borderRadius: "12px",

    boxShadow: "0 4px 12px rgba(0,0,0,.1)",

    textAlign: "center"

};

export default DashboardHome;
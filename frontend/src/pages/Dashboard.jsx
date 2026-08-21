import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBook,
  FaUniversity,
  FaChalkboardTeacher,
} from "react-icons/fa";
import "../Styles/dashboard.css";

function Dashboard() {
    const [researcherCount, setResearcherCount] = useState(0);
const [paperCount, setPaperCount] = useState(0);
const [conferenceCount, setConferenceCount] = useState(0);
const [institutionCount, setInstitutionCount] = useState(0);

const barData = [
  { name: "Researchers", value: researcherCount },
  { name: "Papers", value: paperCount },
  { name: "Conferences", value: conferenceCount },
  { name: "Institutions", value: institutionCount },
];

const pieData = [
  { name: "Researchers", value: researcherCount },
  { name: "Publications", value: paperCount },
  { name: "Conferences", value: conferenceCount },
  { name: "Institutions", value: institutionCount },
];

const COLORS = ["#ff2d2d", "#ff6666", "#cc0000", "#990000"];

const loadDashboard = async () => {
  try {

    const researchers = await api.get("/researchers/");
    const papers = await api.get("/papers/");
    const conferences = await api.get("/conferences/");
    const institutions = await api.get("/institutions/");

    setResearcherCount(researchers.data.length);
    setPaperCount(papers.data.length);
    setConferenceCount(conferences.data.length);
    setInstitutionCount(institutions.data.length);

  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  loadDashboard();
}, []);
  return (
  <div style={{ display: "flex", minHeight: "100vh" }}>

    <Sidebar />

    <div style={{ flex: 1 }}>

      <Navbar />

      <div className="main">

          <div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
    background: "#111111",
    padding: "25px 30px",
    borderRadius: "20px",
    border: "1px solid #2b2b2b",
    boxShadow: "0 0 20px rgba(255,0,0,0.15)",
    boxSizing: "border-box",
  }}
>
  <div>

<h1 className="dashboardTitle">

Scientific Collaboration Network Analyzer

</h1>

<p className="dashboardSub">

Enterprise Dashboard

</p>

</div>

  <div>
    <input
type="text"
placeholder="Search researchers, papers..."
style={{
  width: "280px",
  height: "48px",
  background: "#181818",
  color: "white",
  border: "1px solid #333",
  borderRadius: "14px",
  paddingLeft: "18px",
  outline: "none",
  boxShadow: "0 0 10px rgba(255,0,0,0.08)",
}}
/>
  </div>
  <div className="techBadges">

  <span>⚛ React</span>

  <span>⚡ FastAPI</span>

  <span>🐘 PostgreSQL</span>

  <span>🟢 Online</span>

</div>
</div>
          <div className="cards">

          <Link
  to="/researchers"
  style={{ textDecoration: "none", color: "inherit" }}
>
  <div className="card">

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "15px",
    }}
  >
    <div
style={{
display:"flex",
justifyContent:"space-between",
width:"100%",
alignItems:"center"
}}
>

<FaUsers size={32} color="#ff2d2d"/>

<div
style={{
width:"45px",
height:"45px",
borderRadius:"50%",
background:"#2b1114",
display:"flex",
justifyContent:"center",
alignItems:"center",
color:"#ff2d2d",
fontWeight:"bold"
}}
>

R

</div>

</div>

    <div>
      <h2 style={{ margin: 0 }}>Researchers</h2>
      <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>
        Registered Researchers
      </p>
    </div>
  </div>

  <h1>{researcherCount}</h1>
  <p
  style={{
    color: "#22c55e",
    fontSize: "13px",
    marginTop: "10px",
  }}
>
  ↑ Live Count
</p>

</div>
</Link>

            <Link
  to="/publications"
  style={{ textDecoration: "none", color: "inherit" }}
>
  <div className="card">

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "15px",
    }}
  >
    <FaBook size={30} color="#ff2d2d" />

    <div>
      <h2 style={{ margin: 0 }}>Publications</h2>
      <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>
        Published Papers
      </p>
    </div>
  </div>

  <h1>{paperCount}</h1>
  <p
  style={{
    color: "#22c55e",
    fontSize: "13px",
    marginTop: "10px",
  }}
>
  ↑ Live Count
</p>

</div>
</Link>
<Link to="/conferences" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card">

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "15px",
    }}
  >
    <FaChalkboardTeacher size={30} color="#ff2d2d" />

    <div>
      <h2 style={{ margin: 0 }}>Conferences</h2>
      <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>
        Available Conferences
      </p>
    </div>
  </div>

  <h1>{conferenceCount}</h1>
  <p
  style={{
    color: "#22c55e",
    fontSize: "13px",
    marginTop: "10px",
  }}
>
  ↑ Live Count
</p>

</div>
</Link>

<Link to="/institutions" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card">

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "15px",
    }}
  >
    <FaUniversity size={30} color="#ff2d2d" />

    <div>
      <h2 style={{ margin: 0 }}>Institutions</h2>
      <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>
        Registered Institutions
      </p>
    </div>
  </div>

  <h1>{institutionCount}</h1>
  <p
  style={{
    color: "#22c55e",
    fontSize: "13px",
    marginTop: "10px",
  }}
>
  ↑ Live Count
</p>

</div>
</Link>
</div> {/* cards end */}

<div className="dashboardGrid">

  <div className="tableBox">
    <h2 style={{ marginBottom: "20px" }}>📄 Recent Publications</h2>

    <div className="activityCard">
      <h3>Artificial Intelligence</h3>
      <p>Pankaj Sharma</p>
      <span>2026</span>
    </div>

    <div className="activityCard">
      <h3>Machine Learning</h3>
      <p>Rahul Sharma</p>
      <span>2025</span>
    </div>

    <div className="activityCard">
      <h3>Data Science</h3>
      <p>John Smith</p>
      <span>2024</span>
    </div>
  </div>

  <div className="tableBox">
    <h2 style={{ marginBottom: "20px" }}>👨‍🔬 Recent Researchers</h2>

    <div className="activityCard">
      <h3>Pankaj Sharma</h3>
      <p>CGC Landran</p>
      <span>Information Technology</span>
    </div>

    <div className="activityCard">
      <h3>Rahul Sharma</h3>
      <p>IIT Delhi</p>
      <span>Computer Science</span>
    </div>

    <div className="activityCard">
      <h3>John Smith</h3>
      <p>Stanford University</p>
      <span>Artificial Intelligence</span>
    </div>
  </div>

</div>

<div className="chartGrid">

  <div className="chartCard">
    <h2>Research Statistics</h2>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData}>
        <XAxis dataKey="name" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip />
        <Bar dataKey="value" fill="#ff2d2d" radius={[8,8,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div className="chartCard">
    <h2>System Overview</h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={pieData} dataKey="value" outerRadius={100} label>
          {pieData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>

</div>

<div
  style={{
    marginTop: "40px",
    textAlign: "center",
    color: "#777",
    fontSize: "14px",
  }}
>
  © 2026 Scientific Collaboration Network Analyzer

Developed by Pankaj Sharma
  <br />
  Version 1.0
</div>
        </div>
      </div>
    </div>

  );
}

export default Dashboard;
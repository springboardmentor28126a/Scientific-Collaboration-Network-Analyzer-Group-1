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
  CartesianGrid,
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
  FaProjectDiagram,
  FaQuoteRight,
  FaLink,
  FaSyncAlt,
} from "react-icons/fa";

import "../Styles/dashboard.css";


function Dashboard() {
  const token = localStorage.getItem("token");

let userRole = "researcher";

if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRole = payload.role || "researcher";
  } catch (error) {
    console.log("Invalid token");
  }
}
  const [researcherCount, setResearcherCount] = useState(0);
  const [publications, setPublications] = useState([]);
  const [projects, setProjects] = useState([]);

  const [paperCount, setPaperCount] = useState(0);
  const [conferenceCount, setConferenceCount] = useState(0);
  const [institutionCount, setInstitutionCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [citationCount, setCitationCount] = useState(0);
  const [referenceCount, setReferenceCount] = useState(0);

  const loadDashboard = async () => {
    try {
      const [
        researchers,
        papers,
        conferences,
        institutions,
        projectResponse,
        teams,
        citations,
        references,
      ] = await Promise.all([
        api.get("/researchers/"),
        api.get("/papers/"),
        api.get("/conferences/"),
        api.get("/institutions/"),
        api.get("/projects/"),
        api.get("/teams/"),
        api.get("/citations/"),
        api.get("/references/"),
      ]);

      setPublications(papers.data || []);
      setProjects(projectResponse.data || []);

      setResearcherCount(researchers.data?.length || 0);
      setPaperCount(papers.data?.length || 0);
      setConferenceCount(conferences.data?.length || 0);
      setInstitutionCount(institutions.data?.length || 0);
      setProjectCount(projectResponse.data?.length || 0);
      setTeamCount(teams.data?.length || 0);
      setCitationCount(citations.data?.length || 0);
      setReferenceCount(references.data?.length || 0);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);


  /* =========================
     CHART DATA
  ========================= */

  const overviewData = [
    { name: "Researchers", value: researcherCount },
    { name: "Papers", value: paperCount },
    { name: "Conferences", value: conferenceCount },
    { name: "Institutions", value: institutionCount },
    { name: "Projects", value: projectCount },
    { name: "Teams", value: teamCount },
    { name: "Citations", value: citationCount },
    { name: "References", value: referenceCount },
  ];

  const publicationYearData = Object.values(
    publications.reduce((acc, paper) => {
      const year =
        paper.publication_year ||
        paper.year ||
        "Unknown";

      if (!acc[year]) {
        acc[year] = {
          year,
          publications: 0,
        };
      }

      acc[year].publications += 1;

      return acc;
    }, {})
  );

  const projectStatusData = Object.values(
    projects.reduce((acc, project) => {
      const status = project.status || "Unknown";

      if (!acc[status]) {
        acc[status] = {
          name: status,
          value: 0,
        };
      }

      acc[status].value += 1;

      return acc;
    }, {})
  );

  const COLORS = [
    "#3b82f6",
    "#60a5fa",
    "#2563eb",
    "#1d4ed8",
    "#38bdf8",
    "#818cf8",
  ];


  /* =========================
     STAT CARDS
  ========================= */

  const stats = [
    {
      title: "Researchers",
      subtitle: "Registered Researchers",
      value: researcherCount,
      icon: <FaUsers />,
      link: "/researchers",
    },
    {
      title: "Publications",
      subtitle: "Published Papers",
      value: paperCount,
      icon: <FaBook />,
      link: "/publications",
    },
    {
      title: "Conferences",
      subtitle: "Available Conferences",
      value: conferenceCount,
      icon: <FaChalkboardTeacher />,
      link: "/conferences",
    },
    {
      title: "Institutions",
      subtitle: "Registered Institutions",
      value: institutionCount,
      icon: <FaUniversity />,
      link: "/institutions",
    },
    {
      title: "Projects",
      subtitle: "Active Projects",
      value: projectCount,
      icon: <FaProjectDiagram />,
      link: "/projects",
    },
    {
      title: "Teams",
      subtitle: "Research Teams",
      value: teamCount,
      icon: <FaUsers />,
      link: "/teams",
    },
    {
      title: "Citations",
      subtitle: "Total Citations",
      value: citationCount,
      icon: <FaQuoteRight />,
      link: "/citations",
    },
    {
      title: "References",
      subtitle: "Stored References",
      value: referenceCount,
      icon: <FaLink />,
      link: "/references",
    },
  ];


  return (
    <div className="dashboardLayout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="dashboardContent">

        {/* NAVBAR */}
        <Navbar />

        <main className="main">

          {/* =========================
              HERO HEADER
          ========================= */}

          <section className="dashboardHero">

            <div>
              <span className="heroLabel">
                ENTERPRISE RESEARCH PLATFORM
              </span>

              <h1 className="dashboardTitle">
  Scientific Collaboration
  <br />
  Network Analyzer
</h1>

<p className="dashboardSub">
  {userRole === "client"
    ? "Client Dashboard"
    : "Researcher Dashboard"}
</p>
            </div>

            <div className="heroActions">

              <input
                className="dashboardSearch"
                type="text"
                placeholder="Search researchers, papers..."
              />

              <button
                className="actionBtn"
                onClick={() =>
                  window.open("http://localhost:8000/docs")
                }
              >
                API Docs
              </button>

            </div>

          </section>


          {/* =========================
              QUICK ACTIONS
          ========================= */}

          <section className="quickActions">

            <Link to="/researchers">
              <button className="actionBtn">
                + Researcher
              </button>
            </Link>

            <Link to="/publications">
              <button className="actionBtn">
                + Publication
              </button>
            </Link>

            <Link to="/projects">
              <button className="actionBtn">
                + Project
              </button>
            </Link>

            <Link to="/institutions">
              <button className="actionBtn">
                + Institution
              </button>
            </Link>

            <button
              className="actionBtn refreshBtn"
              onClick={loadDashboard}
            >
              <FaSyncAlt />
              Refresh
            </button>

          </section>


          {/* =========================
              STATISTICS
          ========================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">
              <div>
                <span className="sectionEyebrow">
                  LIVE DATA
                </span>

                <h2>Network Overview</h2>
              </div>

              <span className="liveStatus">
                ● Live
              </span>
            </div>


            <div className="cards">

              {stats.map((item, index) => (

                <Link
                  to={item.link}
                  key={index}
                  className="statLink"
                >

                  <div className="card">

                    <div className="statTop">

                      <div className="statIcon">
                        {item.icon}
                      </div>

                      <span className="statArrow">
                        →
                      </span>

                    </div>

                    <div className="statInfo">

                      <p className="statTitle">
                        {item.title}
                      </p>

                      <p className="statSubtitle">
                        {item.subtitle}
                      </p>

                      <h1>
                        {item.value}
                      </h1>

                    </div>

                    <div className="liveCount">
                      ● Live Count
                    </div>

                  </div>

                </Link>

              ))}

            </div>

          </section>


          {/* =========================
              MODULES
          ========================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>
                <span className="sectionEyebrow">
                  MANAGEMENT
                </span>

                <h2>Research Modules</h2>
              </div>

            </div>


            <div className="moduleGrid">

              <ModuleCard
                icon="👨‍🔬"
                title="Researchers"
                description="Manage researcher profiles and expertise."
                link="/researchers"
              />

              <ModuleCard
                icon="🏛️"
                title="Institutions"
                description="View and manage research institutions."
                link="/institutions"
              />

              <ModuleCard
                icon="📄"
                title="Publications"
                description="Browse publications and journals."
                link="/publications"
              />

              <ModuleCard
                icon="🔗"
                title="Citations"
                description="Track citations and references."
                link="/citations"
              />

              <ModuleCard
                icon="📁"
                title="Projects"
                description="Manage research projects."
                link="/projects"
              />

              <ModuleCard
                icon="👥"
                title="Teams"
                description="Manage research teams."
                link="/teams"
              />

            </div>

          </section>


          {/* =========================
              ANALYTICS
          ========================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>
                <span className="sectionEyebrow">
                  ANALYTICS
                </span>

                <h2>Research Analytics</h2>
              </div>

            </div>


            {/* Analytics summary */}

            <div className="analyticsStats">

              <AnalyticsCard
                title="Institutions"
                value={institutionCount}
              />

              <AnalyticsCard
                title="Researchers"
                value={researcherCount}
              />

              <AnalyticsCard
                title="Publications"
                value={paperCount}
              />

              <AnalyticsCard
                title="Active Projects"
                value={projectCount}
              />

            </div>


            {/* Charts */}

            <div className="chartGrid">

              {/* Publications */}

              <div className="chartCard">

                <div className="chartHeader">

                  <div>
                    <h2>Publications by Year</h2>

                    <p>
                      Publication activity over time
                    </p>
                  </div>

                </div>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={publicationYearData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263449"
                    />

                    <XAxis
                      dataKey="year"
                      stroke="#94a3b8"
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip />

                    <Bar
                      dataKey="publications"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


              {/* System Overview */}

              <div className="chartCard">

                <div className="chartHeader">

                  <div>
                    <h2>System Overview</h2>

                    <p>
                      Distribution across network entities
                    </p>
                  </div>

                </div>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={overviewData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={105}
                      innerRadius={55}
                      paddingAngle={3}
                      label
                    >

                      {overviewData.map(
                        (entry, index) => (

                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                COLORS.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>


              {/* Overall comparison */}

              <div className="chartCard">

                <div className="chartHeader">

                  <div>
                    <h2>Network Comparison</h2>

                    <p>
                      Current system statistics
                    </p>
                  </div>

                </div>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={overviewData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263449"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#60a5fa"
                      radius={[6, 6, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


              {/* Project Status */}

              <div className="chartCard">

                <div className="chartHeader">

                  <div>
                    <h2>Project Status</h2>

                    <p>
                      Current project distribution
                    </p>
                  </div>

                </div>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={projectStatusData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={105}
                      innerRadius={55}
                      label
                    >

                      {projectStatusData.map(
                        (entry, index) => (

                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                COLORS.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

          </section>


          {/* =========================
              FOOTER
          ========================= */}

          <footer className="dashboardFooter">

            <strong>
              Scientific Collaboration Network Analyzer
            </strong>

            <span>
              Version 1.0 • 2026
            </span>

          </footer>

        </main>

      </div>

    </div>
  );
}


/* =========================================
   MODULE CARD
========================================= */

function ModuleCard({
  icon,
  title,
  description,
  link,
}) {
  return (

    <Link
      to={link}
      className="moduleLink"
    >

      <div className="moduleCard">

        <div className="moduleIcon">
          {icon}
        </div>

        <div className="moduleContent">

          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>

        </div>

        <div className="moduleArrow">
          →
        </div>

      </div>

    </Link>
  );
}


/* =========================================
   ANALYTICS CARD
========================================= */

function AnalyticsCard({
  title,
  value,
}) {
  return (

    <div className="analyticsCard">

      <p>
        {title}
      </p>

      <h3>
        {value}
      </h3>

      <span>
        Current total
      </span>

    </div>
  );
}


export default Dashboard;
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

import {
  FaBook,
  FaUsers,
  FaQuoteRight,
  FaUserClock,
  FaCalendarAlt,
  FaSyncAlt,
  FaUserFriends,
  FaUserTie,
} from "react-icons/fa";

import "../Styles/dashboard.css";


function ResearcherDashboard() {

  // =====================================================
  // STATE
  // =====================================================

  const [researcher, setResearcher] = useState(null);

  const [myPublications, setMyPublications] = useState(0);
  const [myCitations, setMyCitations] = useState(0);
  const [myCollaborators, setMyCollaborators] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [upcomingConferences, setUpcomingConferences] = useState(0);

  const [publicationStatistics, setPublicationStatistics] = useState({});
  const [citationStatistics, setCitationStatistics] = useState({});

  const [recentPublications, setRecentPublications] = useState([]);
  const [recommendedResearchers, setRecommendedResearchers] = useState([]);
  const [conferenceList, setConferenceList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  // =====================================================
  // LOAD RESEARCHER DASHBOARD
  // =====================================================

  const loadDashboard = useCallback(async () => {
  try {
    setLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");

if (!token) {
  setErrorMessage("Not authenticated");
  return;
}

const payload = JSON.parse(atob(token.split(".")[1]));
const email = payload.sub;

const response = await fetch(
  `http://127.0.0.1:8000/dashboard/researcher?email=${encodeURIComponent(email)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.detail || "Failed to load researcher dashboard"
      );
    }

    const data = await response.json();

    setResearcher(data.researcher || null);

    setMyPublications(
      data.my_publications || 0
    );

    setMyCitations(
      data.my_citations || 0
    );

    setMyCollaborators(
      data.my_collaborators || 0
    );

    setPendingRequests(
      data.pending_collaboration_requests || 0
    );

    setUpcomingConferences(
      data.upcoming_conferences || 0
    );

    setPublicationStatistics(
      data.publication_statistics || {}
    );

    setCitationStatistics(
      data.citation_statistics || {}
    );

    setRecentPublications(
      data.recent_publications || []
    );

    setRecommendedResearchers(
      data.recommended_researchers || []
    );

    setConferenceList(
      data.upcoming_conference_list || []
    );

  } catch (error) {
    console.error(
      "Researcher dashboard loading error:",
      error
    );

    setErrorMessage(
      error.message ||
      "Unable to load researcher dashboard."
    );

  } finally {
    setLoading(false);
  }
}, []);


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);


  // =====================================================
  // PUBLICATION CHART DATA
  // =====================================================

  const publicationChartData = Object.entries(
    publicationStatistics
  ).map(([year, count]) => ({
    year,
    publications: count,
  }));


  // =====================================================
  // CITATION CHART DATA
  // =====================================================

  const citationChartData = Object.entries(
    citationStatistics
  ).map(([year, count]) => ({
    year,
    citations: count,
  }));


  // =====================================================
  // DASHBOARD CARDS
  // =====================================================

  const stats = [

    {
      title: "My Publications",
      subtitle: "Research Papers",
      value: myPublications,
      icon: <FaBook />,
      link: "/publications",
    },

    {
      title: "My Citations",
      subtitle: "Total Citation Count",
      value: myCitations,
      icon: <FaQuoteRight />,
      link: "/citations",
    },

    {
      title: "My Collaborators",
      subtitle: "Research Collaborators",
      value: myCollaborators,
      icon: <FaUsers />,
      link: "/collaboration-graph",
    },

    {
      title: "Pending Requests",
      subtitle: "Collaboration Requests",
      value: pendingRequests,
      icon: <FaUserClock />,
      link: "/institution-collaborations",
    },

    {
      title: "Upcoming Conferences",
      subtitle: "Upcoming Events",
      value: upcomingConferences,
      icon: <FaCalendarAlt />,
      link: "/conferences",
    },

  ];


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="dashboardLayout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="dashboardContent">

        {/* NAVBAR */}

        <Navbar />


        <main className="main">


          {/* =================================================
              HERO
          ================================================= */}

          <section className="dashboardHero">

            <div>

              <span className="heroLabel">
                RESEARCHER WORKSPACE
              </span>


              <h1 className="dashboardTitle">

                Scientific Collaboration
                <br />

                Network Analyzer

              </h1>


              <p className="dashboardSub">

                Researcher Dashboard

              </p>


              {/* RESEARCHER INFO */}

              {researcher && (

                <div
                  style={{
                    marginTop: "15px",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >

                  <strong
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    {researcher.name}
                  </strong>

                  {" • "}

                  {researcher.department}

                  {" • "}

                  {researcher.university}

                </div>

              )}

            </div>


            <div className="heroActions">

              <button
                className="actionBtn refreshBtn"
                onClick={loadDashboard}
                disabled={loading}
              >

                <FaSyncAlt />

                {loading
                  ? "Loading..."
                  : "Refresh"}

              </button>

            </div>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (

            <div
              style={{
                background: "#3b1111",
                border: "1px solid #7f1d1d",
                color: "#ff8a8a",
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >

              {errorMessage}

            </div>

          )}


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="quickActions">

            <Link to="/publications">

              <button className="actionBtn">
                + Publication
              </button>

            </Link>


            <Link to="/citations">

              <button className="actionBtn">
                View Citations
              </button>

            </Link>


            <Link to="/conferences">

              <button className="actionBtn">
                Conferences
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


          {/* =================================================
              RESEARCH OVERVIEW
          ================================================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>

                <span className="sectionEyebrow">
                  MY RESEARCH
                </span>

                <h2>
                  Research Overview
                </h2>

              </div>


              <span className="liveStatus">
                ● Live
              </span>

            </div>


            {/* CARDS */}

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


          {/* =================================================
              UPCOMING CONFERENCES
          ================================================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>

                <span className="sectionEyebrow">
                  EVENTS
                </span>

                <h2>
                  Upcoming Conferences
                </h2>

              </div>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >

              {conferenceList.length === 0 ? (

                <div className="chartCard">

                  <p
                    style={{
                      color: "#94a3b8",
                      margin: 0,
                    }}
                  >
                    No upcoming conferences found.
                  </p>

                </div>

              ) : (

                conferenceList.map((conference) => (

                  <div
                    key={conference.id}
                    className="chartCard"
                  >

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >

                      <FaCalendarAlt
                        style={{
                          color: "#3b82f6",
                          marginTop: "4px",
                        }}
                      />


                      <div>

                        <h3
                          style={{
                            margin: "0 0 7px",
                          }}
                        >
                          {conference.name}
                        </h3>


                        <p
                          style={{
                            margin: "4px 0",
                            color: "#94a3b8",
                          }}
                        >
                          {conference.organizer}
                        </p>


                        <p
                          style={{
                            margin: "4px 0",
                            color: "#94a3b8",
                          }}
                        >
                          {conference.location}
                        </p>


                        <p
                          style={{
                            margin: "8px 0 0",
                            color: "#60a5fa",
                          }}
                        >
                          {conference.date || "Date not available"}
                        </p>

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>


          {/* =================================================
              RECENT PUBLICATIONS
          ================================================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>

                <span className="sectionEyebrow">
                  PUBLICATIONS
                </span>

                <h2>
                  Recent Publications
                </h2>

              </div>


              <Link
                to="/publications"
                className="moduleLink"
              >
                View All →
              </Link>

            </div>


            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >

              {recentPublications.length === 0 ? (

                <div className="chartCard">

                  <p
                    style={{
                      color: "#94a3b8",
                      margin: 0,
                    }}
                  >
                    No publications found.
                  </p>

                </div>

              ) : (

                recentPublications.map((paper) => (

                  <div
                    key={paper.id}
                    className="chartCard"
                    style={{
                      padding: "18px 20px",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "20px",
                        alignItems: "center",
                      }}
                    >

                      <div>

                        <h3
                          style={{
                            margin: "0 0 7px",
                          }}
                        >
                          {paper.title}
                        </h3>


                        <p
                          style={{
                            margin: 0,
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >

                          {paper.journal || "Journal not specified"}

                          {" • "}

                          {paper.year || "Year unavailable"}

                        </p>

                      </div>


                      <span
                        style={{
                          background: "#172554",
                          color: "#60a5fa",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >

                        {paper.status || "Unknown"}

                      </span>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>


          {/* =================================================
              RECOMMENDED RESEARCHERS
          ================================================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>

                <span className="sectionEyebrow">
                  NETWORK
                </span>

                <h2>
                  Recommended Researchers
                </h2>

              </div>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "15px",
              }}
            >

              {recommendedResearchers.length === 0 ? (

                <div className="chartCard">

                  <p
                    style={{
                      color: "#94a3b8",
                      margin: 0,
                    }}
                  >
                    No recommended researchers available.
                  </p>

                </div>

              ) : (

                recommendedResearchers.map((researcher) => (

                  <div
                    key={researcher.id}
                    className="chartCard"
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >

                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: "#172554",
                          color: "#60a5fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >

                        <FaUserTie />

                      </div>


                      <div>

                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {researcher.name}
                        </h3>


                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#94a3b8",
                            fontSize: "12px",
                          }}
                        >
                          {researcher.department}
                        </p>

                      </div>

                    </div>


                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                        marginBottom: 0,
                      }}
                    >

                      {researcher.university}

                    </p>


                    {researcher.research_interests && (

                      <p
                        style={{
                          color: "#60a5fa",
                          fontSize: "12px",
                        }}
                      >

                        Research Interests:{" "}
                        {researcher.research_interests}

                      </p>

                    )}

                  </div>

                ))

              )}

            </div>

          </section>


          {/* =================================================
              ANALYTICS
          ================================================= */}

          <section className="dashboardSection">

            <div className="sectionHeader">

              <div>

                <span className="sectionEyebrow">
                  ANALYTICS
                </span>

                <h2>
                  Publication & Citation Statistics
                </h2>

              </div>

            </div>


            <div className="chartGrid">


              {/* PUBLICATION STATISTICS */}

              <div className="chartCard">

                <div className="chartHeader">

                  <div>

                    <h2>
                      Publications by Year
                    </h2>

                    <p>
                      Your publication activity
                    </p>

                  </div>

                </div>


                {publicationChartData.length === 0 ? (

                  <p
                    style={{
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "80px 0",
                    }}
                  >
                    No publication statistics available.
                  </p>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <BarChart
                      data={publicationChartData}
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

                )}

              </div>


              {/* CITATION STATISTICS */}

              <div className="chartCard">

                <div className="chartHeader">

                  <div>

                    <h2>
                      Citations by Year
                    </h2>

                    <p>
                      Your citation activity
                    </p>

                  </div>

                </div>


                {citationChartData.length === 0 ? (

                  <p
                    style={{
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "80px 0",
                    }}
                  >
                    No citation statistics available.
                  </p>

                ) : (

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <LineChart
                      data={citationChartData}
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

                      <Line
                        type="monotone"
                        dataKey="citations"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

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


export default ResearcherDashboard;
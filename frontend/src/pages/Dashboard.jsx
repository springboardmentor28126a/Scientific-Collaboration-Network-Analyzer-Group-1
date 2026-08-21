import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppShell from "../components/AppShell";
import { useAuth } from "../hooks/useAuth";
import { getDashboardStats } from "../api/dashboard";

import "./Dashboard.css";


const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};


const formatDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};


const getRoleLabel = (role) => {
  if (role === "SystemAdmin") {
    return "System Administrator";
  }

  if (role === "InstitutionAdmin") {
    return "Institution Administrator";
  }

  if (role === "Researcher") {
    return "Researcher";
  }

  if (role === "Reviewer") {
    return "Reviewer";
  }

  return "Platform User";
};


export default function Dashboard() {

  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const displayName =
    user?.email?.split("@")[0] || "User";


  useEffect(() => {

    let active = true;

    getDashboardStats()

      .then((response) => {

        if (active) {
          setStats(response.data);
          setError("");
        }

      })

      .catch((error) => {

        console.error(
          "Dashboard statistics error:",
          error
        );

        if (active) {
          setError(
            "Unable to load dashboard statistics."
          );
        }

      })

      .finally(() => {

        if (active) {
          setLoading(false);
        }

      });


    return () => {
      active = false;
    };

  }, []);


  const platformStats =
    stats?.platform_stats;

  const adminStats =
    stats?.admin_stats;


  return (

    <AppShell>

      <div className="dashboard-page">


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="dashboard-hero">

          <div className="dashboard-hero-main">

            <div className="dashboard-eyebrow">

              <span className="dashboard-badge">
                Scientific Research Workspace
              </span>

              <span className="dashboard-date">
                {formatDate()}
              </span>

            </div>


            <p className="dashboard-kicker">
              {getGreeting()}, {displayName}
            </p>


            <h1>
              Scientific Collaboration
              <span> Network Analyzer</span>
            </h1>


            <p className="dashboard-description">

              A centralized workspace for managing
              researchers, publications, institutions,
              collaborations and scientific research
              activity.

            </p>


            <div className="dashboard-hero-actions">

              <Link
                to="/publications"
                className="dashboard-primary-button"
              >
                View Publications
              </Link>


              <Link
                to="/collaborations"
                className="dashboard-secondary-button"
              >
                Explore Collaborations
              </Link>

            </div>

          </div>


          {/* PROFILE */}

          <div className="dashboard-profile-card">

            <div className="dashboard-avatar">

              {user?.email?.[0]?.toUpperCase() || "U"}

            </div>


            <div className="dashboard-profile-details">

              <span className="profile-label">
                Signed in as
              </span>


              <strong>
                {user?.email || "User"}
              </strong>


              <span className="profile-role">

                {getRoleLabel(user?.role)}

              </span>

            </div>


            <div className="profile-status">

              <span className="status-dot"></span>

              Active session

            </div>

          </div>

        </section>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (

          <section className="dashboard-status-card">

            <div className="loading-spinner"></div>

            <p>
              Loading research workspace...
            </p>

          </section>

        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <section className="dashboard-status-card dashboard-error-card">

            <strong>
              Dashboard unavailable
            </strong>

            <p>
              {error}
            </p>

          </section>

        )}


        {/* =====================================================
            DASHBOARD CONTENT
        ===================================================== */}

        {!loading && !error && stats && (

          <>


            {/* =================================================
                ROLE-BASED OVERVIEW
            ================================================= */}

            <section className="dashboard-section">

              <div className="dashboard-section-heading">

                <div>

                  <span className="section-label">

                    {stats.role === "Researcher"
                      ? "My Research"
                      : stats.role === "InstitutionAdmin"
                      ? "My Institution"
                      : stats.role === "SystemAdmin"
                      ? "Platform Administration"
                      : "Research Workspace"}

                  </span>


                  <h2>

                    {stats.role === "Researcher"
                      ? "Your research overview"
                      : stats.role === "InstitutionAdmin"
                      ? "Your institution at a glance"
                      : stats.role === "SystemAdmin"
                      ? "Platform overview"
                      : "Research ecosystem at a glance"}

                  </h2>

                </div>


                <span className="section-caption">
                  Live platform data
                </span>

              </div>


              <div className="overview-grid">


                {/* =================================================
                    RESEARCHER OVERVIEW
                ================================================= */}

                {stats.role === "Researcher" &&
                  stats.researcher_stats && (

                    <>

                      {/* MY PUBLICATIONS */}

                      <Link
                        to="/publications"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          📚
                        </div>

                        <div className="overview-content">

                          <span>
                            My Publications
                          </span>

                          <strong>
                            {stats.researcher_stats.publications_count ?? 0}
                          </strong>

                          <small>
                            Publications associated with you
                          </small>

                        </div>

                      </Link>


                      {/* MY PROJECTS */}

                      <Link
                        to="/projects"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🔬
                        </div>

                        <div className="overview-content">

                          <span>
                            My Projects
                          </span>

                          <strong>
                            {stats.researcher_stats.projects_count ?? 0}
                          </strong>

                          <small>
                            Projects you created or joined
                          </small>

                        </div>

                      </Link>


                      {/* MY CONFERENCES */}

                      <Link
                        to="/conferences"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🎙
                        </div>

                        <div className="overview-content">

                          <span>
                            My Conferences
                          </span>

                          <strong>
                            {stats.researcher_stats.conferences_count ?? 0}
                          </strong>

                          <small>
                            Conference participation
                          </small>

                        </div>

                      </Link>


                      {/* MY COLLABORATORS */}

                      <Link
                        to="/collaborations"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🤝
                        </div>

                        <div className="overview-content">

                          <span>
                            My Collaborators
                          </span>

                          <strong>
                            {stats.researcher_stats.collaborators_count ?? 0}
                          </strong>

                          <small>
                            Researchers connected to you
                          </small>

                        </div>

                      </Link>


                      {/* PLATFORM RESEARCHERS */}

                      <Link
                        to="/researchers"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          👥
                        </div>

                        <div className="overview-content">

                          <span>
                            Researchers
                          </span>

                          <strong>
                            {platformStats?.researchers ?? 0}
                          </strong>

                          <small>
                            Across the platform
                          </small>

                        </div>

                      </Link>


                      {/* PLATFORM INSTITUTIONS */}

                      <Link
                        to="/institutions"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🏛
                        </div>

                        <div className="overview-content">

                          <span>
                            Institutions
                          </span>

                          <strong>
                            {platformStats?.institutions ?? 0}
                          </strong>

                          <small>
                            Research organizations
                          </small>

                        </div>

                      </Link>

                    </>

                  )}


                {/* =================================================
                    INSTITUTION ADMIN OVERVIEW
                ================================================= */}

                {stats.role === "InstitutionAdmin" &&
                  stats.institution_stats && (

                    <>

                      {/* DEPARTMENTS */}

                      <Link
                        to="/departments"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🏛
                        </div>

                        <div className="overview-content">

                          <span>
                            Departments
                          </span>

                          <strong>
                            {stats.institution_stats.departments_count ?? 0}
                          </strong>

                          <small>
                            Departments in your institution
                          </small>

                        </div>

                      </Link>


                      {/* PUBLICATIONS */}

                      <Link
                        to="/publications"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          📚
                        </div>

                        <div className="overview-content">

                          <span>
                            Publications
                          </span>

                          <strong>
                            {stats.institution_stats.publications_count ?? 0}
                          </strong>

                          <small>
                            Institution research publications
                          </small>

                        </div>

                      </Link>


                      {/* ACTIVE PROJECTS */}

                      <Link
                        to="/projects"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🔬
                        </div>

                        <div className="overview-content">

                          <span>
                            Active Projects
                          </span>

                          <strong>
                            {stats.institution_stats.active_projects_count ?? 0}
                          </strong>

                          <small>
                            Currently active projects
                          </small>

                        </div>

                      </Link>


                      {/* COLLABORATIONS */}

                      <Link
                        to="/collaborations"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🤝
                        </div>

                        <div className="overview-content">

                          <span>
                            Collaborations
                          </span>

                          <strong>
                            {stats.institution_stats
                              .collaboration_statistics
                              ?.total_collaborations ?? 0}
                          </strong>

                          <small>
                            Institutional partnerships
                          </small>

                        </div>

                      </Link>


                      {/* RESEARCHERS */}

                      <Link
                        to="/researchers"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          👥
                        </div>

                        <div className="overview-content">

                          <span>
                            Researchers
                          </span>

                          <strong>
                            {platformStats?.researchers ?? 0}
                          </strong>

                          <small>
                            Researchers across platform
                          </small>

                        </div>

                      </Link>


                      {/* INSTITUTIONS */}

                      <Link
                        to="/institutions"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🏛
                        </div>

                        <div className="overview-content">

                          <span>
                            Institutions
                          </span>

                          <strong>
                            {platformStats?.institutions ?? 0}
                          </strong>

                          <small>
                            Research organizations
                          </small>

                        </div>

                      </Link>

                    </>

                  )}


                {/* =================================================
                    SYSTEM ADMIN OVERVIEW
                ================================================= */}

                {stats.role === "SystemAdmin" && (

                  <>

                    {/* RESEARCHERS */}

                    <Link
                      to="/researchers"
                      className="overview-card"
                    >

                      <div className="overview-icon">
                        👥
                      </div>

                      <div className="overview-content">

                        <span>
                          Researchers
                        </span>

                        <strong>
                          {platformStats?.researchers ?? 0}
                        </strong>

                        <small>
                          Registered researchers
                        </small>

                      </div>

                    </Link>


                    {/* INSTITUTIONS */}

                    <Link
                      to="/institutions"
                      className="overview-card"
                    >

                      <div className="overview-icon">
                        🏛
                      </div>

                      <div className="overview-content">

                        <span>
                          Institutions
                        </span>

                        <strong>
                          {platformStats?.institutions ?? 0}
                        </strong>

                        <small>
                          Research organizations
                        </small>

                      </div>

                    </Link>


                    {/* PUBLICATIONS */}

                    <Link
                      to="/publications"
                      className="overview-card"
                    >

                      <div className="overview-icon">
                        📚
                      </div>

                      <div className="overview-content">

                        <span>
                          Publications
                        </span>

                        <strong>
                          {platformStats?.publications ?? 0}
                        </strong>

                        <small>
                          Research records
                        </small>

                      </div>

                    </Link>


                    {/* PROJECTS */}

                    <Link
                      to="/projects"
                      className="overview-card"
                    >

                      <div className="overview-icon">
                        🔬
                      </div>

                      <div className="overview-content">

                        <span>
                          Research Projects
                        </span>

                        <strong>
                          {platformStats?.projects ?? 0}
                        </strong>

                        <small>
                          Research initiatives
                        </small>

                      </div>

                    </Link>


                    {/* COLLABORATIONS */}

                    <Link
                      to="/collaborations"
                      className="overview-card"
                    >

                      <div className="overview-icon">
                        🤝
                      </div>

                      <div className="overview-content">

                        <span>
                          Collaborations
                        </span>

                        <strong>
                          {platformStats?.collaborations ?? 0}
                        </strong>

                        <small>
                          Research partnerships
                        </small>

                      </div>

                    </Link>


                    {/* CITATIONS */}

                    <Link
                      to="/citations"
                      className="overview-card"
                    >

                      <div className="overview-icon">
                        🔗
                      </div>

                      <div className="overview-content">

                        <span>
                          Citations
                        </span>

                        <strong>
                          {platformStats?.citations ?? 0}
                        </strong>

                        <small>
                          Publication references
                        </small>

                      </div>

                    </Link>

                  </>

                )}


                {/* =================================================
                    REVIEWER / OTHER USER OVERVIEW
                ================================================= */}

                {stats.role !== "Researcher" &&
                  stats.role !== "InstitutionAdmin" &&
                  stats.role !== "SystemAdmin" && (

                    <>

                      {/* PUBLICATIONS */}

                      <Link
                        to="/publications"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          📚
                        </div>

                        <div className="overview-content">

                          <span>
                            Publications
                          </span>

                          <strong>
                            {platformStats?.publications ?? 0}
                          </strong>

                          <small>
                            Research publications
                          </small>

                        </div>

                      </Link>


                      {/* RESEARCHERS */}

                      <Link
                        to="/researchers"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          👥
                        </div>

                        <div className="overview-content">

                          <span>
                            Researchers
                          </span>

                          <strong>
                            {platformStats?.researchers ?? 0}
                          </strong>

                          <small>
                            Research community
                          </small>

                        </div>

                      </Link>


                      {/* INSTITUTIONS */}

                      <Link
                        to="/institutions"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🏛
                        </div>

                        <div className="overview-content">

                          <span>
                            Institutions
                          </span>

                          <strong>
                            {platformStats?.institutions ?? 0}
                          </strong>

                          <small>
                            Research organizations
                          </small>

                        </div>

                      </Link>


                      {/* CITATIONS */}

                      <Link
                        to="/citations"
                        className="overview-card"
                      >

                        <div className="overview-icon">
                          🔗
                        </div>

                        <div className="overview-content">

                          <span>
                            Citations
                          </span>

                          <strong>
                            {platformStats?.citations ?? 0}
                          </strong>

                          <small>
                            Publication references
                          </small>

                        </div>

                      </Link>

                    </>

                  )}

              </div>

            </section>


            {/* =================================================
                RESEARCH NETWORK
            ================================================= */}

            <section className="dashboard-section">

              <div className="dashboard-section-heading">

                <div>

                  <span className="section-label">
                    Research Network
                  </span>

                  <h2>
                    Explore the research ecosystem
                  </h2>

                </div>

                <p>
                  Access the main research modules
                </p>

              </div>


              <div className="network-grid">


                <Link
                  to="/publications"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    📚
                  </div>

                  <div>

                    <h3>
                      Publications
                    </h3>

                    <p>
                      Manage papers, journals and
                      scientific research records.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/institutions"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    🏛
                  </div>

                  <div>

                    <h3>
                      Institutions
                    </h3>

                    <p>
                      Organize universities, research
                      organizations and departments.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/researchers"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    👥
                  </div>

                  <div>

                    <h3>
                      Researchers
                    </h3>

                    <p>
                      Explore researcher profiles,
                      expertise and scientific activity.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/projects"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    🔬
                  </div>

                  <div>

                    <h3>
                      Research Projects
                    </h3>

                    <p>
                      Track research projects,
                      members, budgets and progress.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/conferences"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    🎙
                  </div>

                  <div>

                    <h3>
                      Conferences
                    </h3>

                    <p>
                      Track scientific events,
                      organizers and participation.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/collaborations"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    🤝
                  </div>

                  <div>

                    <h3>
                      Collaborations
                    </h3>

                    <p>
                      Discover connections between
                      institutions and researchers.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/citations"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    🔗
                  </div>

                  <div>

                    <h3>
                      Citations
                    </h3>

                    <p>
                      Track citation relationships and
                      publication references.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>


                <Link
                  to="/reports"
                  className="network-card"
                >

                  <div className="network-card-icon">
                    📊
                  </div>

                  <div>

                    <h3>
                      Reports
                    </h3>

                    <p>
                      Review research activity and
                      generate analytical insights.
                    </p>

                  </div>

                  <span className="network-arrow">
                    →
                  </span>

                </Link>

              </div>

            </section>


            {/* =================================================
                RESEARCHER WORKSPACE
            ================================================= */}

            {stats.role === "Researcher" &&
              stats.researcher_stats && (

                <div className="dashboard-two-column">


                  {/* PROJECTS */}

                  <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                      <div>

                        <span className="section-label">
                          Your Workspace
                        </span>

                        <h2>
                          Active Projects
                        </h2>

                      </div>

                    </div>


                    <div className="activity-list">

                      {stats.researcher_stats.projects?.length === 0 ? (

                        <div className="empty-state">
                          No projects assigned yet.
                        </div>

                      ) : (

                        stats.researcher_stats.projects?.map(
                          (project) => (

                            <div
                              className="activity-row"
                              key={project.id}
                            >

                              <div className="activity-icon">
                                🔬
                              </div>

                              <div className="activity-info">

                                <strong>
                                  {project.title}
                                </strong>

                                <span>
                                  Research project
                                </span>

                              </div>

                              <span className="activity-status">
                                {project.status}
                              </span>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </section>


                  {/* CONFERENCES */}

                  <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                      <div>

                        <span className="section-label">
                          Upcoming
                        </span>

                        <h2>
                          Conferences
                        </h2>

                      </div>

                    </div>


                    <div className="activity-list">

                      {stats.researcher_stats.conferences?.length === 0 ? (

                        <div className="empty-state">
                          No conference registrations yet.
                        </div>

                      ) : (

                        stats.researcher_stats.conferences?.map(
                          (conference) => (

                            <div
                              className="activity-row"
                              key={conference.id}
                            >

                              <div className="conference-code">
                                {conference.acronym || "CONF"}
                              </div>

                              <div className="activity-info">

                                <strong>
                                  {conference.name}
                                </strong>

                                <span>
                                  {conference.location ||
                                    "Location not specified"}
                                </span>

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </section>

                </div>

              )}


            {/* =================================================
                INSTITUTION ADMIN WORKSPACE
            ================================================= */}

            {stats.role === "InstitutionAdmin" &&
              stats.institution_stats && (

                <div className="dashboard-two-column">


                  {/* DEPARTMENTS */}

                  <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                      <div>

                        <span className="section-label">
                          Institution
                        </span>

                        <h2>
                          Departments
                        </h2>

                      </div>

                    </div>


                    <div className="activity-list">

                      {stats.institution_stats.departments?.length === 0 ? (

                        <div className="empty-state">
                          No departments registered.
                        </div>

                      ) : (

                        stats.institution_stats.departments?.map(
                          (department) => (

                            <div
                              className="activity-row"
                              key={department.id}
                            >

                              <div className="activity-icon">
                                🏛
                              </div>

                              <div className="activity-info">

                                <strong>
                                  {department.name}
                                </strong>

                                <span>
                                  {department.description ||
                                    "Department"}
                                </span>

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </section>


                  {/* PROJECTS */}

                  <section className="dashboard-section">

                    <div className="dashboard-section-heading">

                      <div>

                        <span className="section-label">
                          Research
                        </span>

                        <h2>
                          Active Projects
                        </h2>

                      </div>

                    </div>


                    <div className="activity-list">

                      {stats.institution_stats.projects?.length === 0 ? (

                        <div className="empty-state">
                          No active projects.
                        </div>

                      ) : (

                        stats.institution_stats.projects?.map(
                          (project) => (

                            <div
                              className="activity-row"
                              key={project.id}
                            >

                              <div className="activity-icon">
                                🔬
                              </div>

                              <div className="activity-info">

                                <strong>
                                  {project.title}
                                </strong>

                                <span>
                                  Active research project
                                </span>

                              </div>

                              <strong className="project-budget">

                                {project.budget != null
                                  ? `$${project.budget.toLocaleString()}`
                                  : "—"}

                              </strong>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </section>

                </div>

              )}


            {/* =================================================
                SYSTEM ADMIN AUDIT
            ================================================= */}

            {(stats.role === "SystemAdmin" ||
              (!stats.researcher_stats &&
                !stats.institution_stats)) &&
              adminStats && (

                <section className="dashboard-section">

                  <div className="dashboard-section-heading">

                    <div>

                      <span className="section-label">
                        Security & Compliance
                      </span>

                      <h2>
                        Recent Audit Activity
                      </h2>

                    </div>


                    <Link
                      to="/audit"
                      className="section-link"
                    >
                      View full audit log →
                    </Link>

                  </div>


                  <div className="audit-list">

                    {adminStats.recent_logs?.length === 0 ? (

                      <div className="empty-state">
                        No recent audit activity recorded.
                      </div>

                    ) : (

                      adminStats.recent_logs?.map(
                        (log) => (

                          <div
                            className="audit-row"
                            key={log.id}
                          >

                            <div className="audit-action">
                              {log.action}
                            </div>

                            <div className="audit-table">
                              {log.table_name || "System"}
                            </div>

                            <div className="audit-details">
                              {log.details ||
                                "No additional details provided"}
                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                </section>

              )}

          </>

        )}

      </div>

    </AppShell>
  );
}
import { Link } from "react-router-dom";
import NetworkHero from "../components/landing/NetworkHero";
import "../styles/landing.css";

const FEATURES = [
  {
    title: "Find your collaborators",
    body: "See who at your institution — and beyond — is working on adjacent problems, before you start from zero.",
  },
  {
    title: "Track every publication",
    body: "Papers, patents, and reports in one record, linked to the people and projects behind them.",
  },
  {
    title: "Institution-verified profiles",
    body: "Every researcher is approved by their own institution admin, so the network stays trustworthy.",
  },
  {
    title: "Built-in peer review",
    body: "Route submissions to reviewers and track feedback without leaving the platform.",
  },
];

function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <span className="landing-logo">SciConnect</span>
          <nav className="landing-nav-links">
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <NetworkHero />
        <div className="container landing-hero-content">
          <p className="landing-eyebrow">Scientific Collaboration Network</p>
          <h1 className="landing-headline">
            Every researcher is a node.<br />Every paper draws a line.
          </h1>
          <p className="landing-sub">
            SciConnect maps who's working with whom, across institutions and
            departments — so the next collaboration is easier to find than the last one.
          </p>
          <div className="landing-cta-row">
            <Link to="/register" className="btn-primary btn-lg">Join as a researcher</Link>
            <Link to="/login" className="btn-ghost btn-lg">I already have an account</Link>
          </div>
        </div>
      </section>

      <section className="landing-features container">
        <h2 className="landing-section-title">What the network gives you</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-roles container">
        <h2 className="landing-section-title">Built for four roles</h2>
        <div className="role-grid">
          <div className="role-card">
            <span className="role-tag">Researcher</span>
            <p>Register, get approved by your institution, and start listing your work.</p>
          </div>
          <div className="role-card">
            <span className="role-tag">Institution Admin</span>
            <p>Approve researchers from your institution and manage reviewers.</p>
          </div>
          <div className="role-card">
            <span className="role-tag">Reviewer</span>
            <p>Added by an admin. Review submitted work and leave feedback.</p>
          </div>
          <div className="role-card">
            <span className="role-tag">System Admin</span>
            <p>Oversees the platform and onboards institutions.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <span>© {new Date().getFullYear()} SciConnect — Scientific Collaboration Network Analyzer</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
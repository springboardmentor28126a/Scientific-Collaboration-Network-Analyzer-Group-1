function WelcomeBanner() {
  return (
    <div
      className="p-5 mb-4 rounded-4 shadow-sm"
      style={{
        background: "linear-gradient(135deg,#2563EB,#1E40AF)",
        color: "white",
      }}
    >
      <h2 className="fw-bold">
        Welcome Back 👋
      </h2>

      <h4 className="mt-3">
        Scientific Collaboration Network Analyzer
      </h4>

      <p className="mt-3 mb-0">
        A centralized platform for managing researchers,
        institutions, publications, collaborations,
        conferences and research analytics.
      </p>
    </div>
  );
}

export default WelcomeBanner;
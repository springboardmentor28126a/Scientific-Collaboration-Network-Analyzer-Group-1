function ResearcherToolbar({ onAdd }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">

      <div>
        <h2 className="fw-bold mb-1">
          Researcher Management
        </h2>

        <p className="text-muted mb-0">
          Manage researcher profiles and academic information.
        </p>
      </div>

      <button
        className="btn btn-primary rounded-pill px-4"
        onClick={onAdd}
      >
        <i className="bi bi-plus-circle me-2"></i>

        Add Researcher
      </button>

    </div>
  );
}

export default ResearcherToolbar;
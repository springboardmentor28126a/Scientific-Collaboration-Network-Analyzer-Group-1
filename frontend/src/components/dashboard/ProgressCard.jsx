function ProgressCard() {
  return (
    <div className="card shadow-sm border-0 rounded-4">

      <div className="card-body">

        <h4 className="fw-bold mb-4">
          Milestone Progress
        </h4>

        <p>
          Milestone 1
        </p>

        <div className="progress mb-3">

          <div
            className="progress-bar bg-success"
            style={{
              width: "85%",
            }}
          >

            85%

          </div>

        </div>

        <small className="text-muted">

          Backend completed.

          Frontend dashboard in progress.

        </small>

      </div>

    </div>
  );
}

export default ProgressCard;
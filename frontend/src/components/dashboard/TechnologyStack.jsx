function TechnologyStack() {

  const tech = [
    "React",
    "FastAPI",
    "PostgreSQL",
    "SQLAlchemy",
    "JWT",
    "Bootstrap",
  ];

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">

      <div className="card-body">

        <h4 className="fw-bold mb-4">
          Technology Stack
        </h4>

        {tech.map((item) => (

          <span
            key={item}
            className="badge rounded-pill text-bg-primary me-2 mb-2 p-3"
          >

            {item}

          </span>

        ))}

      </div>

    </div>
  );
}

export default TechnologyStack;
function ResearcherTable({ researchers, departments, institutions, loading, onManage }) {
  if (loading) {
    return (
      <div className="card shadow-sm border-0 rounded-4 mt-4">
        <div className="card-body text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p className="mb-0">Loading researchers...</p>
        </div>
      </div>
    );
  }

  const getDepartmentName = (id) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.department_name : "-";
  };

  const getInstitutionName = (id) => {
    const inst = institutions.find((i) => i.id === id);
    return inst ? inst.institution_name : "-";
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Researchers</h4>
          <span className="badge bg-primary fs-6">{researchers.length} Researchers</span>
        </div>

        {researchers.length === 0 ? (
          <div className="text-center py-5">
            <h5>No approved researchers yet</h5>
            <p className="text-muted">
              Researchers appear here once they register and are approved.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Institution</th>
                  <th>Department</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {researchers.map((researcher) => (
                  <tr key={researcher.id}>
                    <td><strong>{researcher.first_name} {researcher.last_name}</strong></td>
                    <td>{researcher.designation || "-"}</td>
                    <td>{getInstitutionName(researcher.institution_id)}</td>
                    <td>{getDepartmentName(researcher.department_id)}</td>
                    <td className="text-center">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => onManage(researcher)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearcherTable;
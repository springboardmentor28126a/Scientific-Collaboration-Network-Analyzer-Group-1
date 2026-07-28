function DepartmentTable({
  departments,
  institutions,
  loading,
  onEdit,
  onDelete,
}) {

  if (loading) {
    return (
      <div className="card shadow-sm border-0 rounded-4 mt-4">

        <div className="card-body text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3 mb-0">
            Loading departments...
          </p>

        </div>

      </div>
    );
  }

  const getInstitutionName = (institutionId) => {

    const institution = institutions.find(
      (item) => item.id === institutionId
    );

    return institution
      ? institution.institution_name
      : "Unknown";

  };

  return (

    <div className="card shadow-sm border-0 rounded-4 mt-4">

      <div className="card-body">

        <h4 className="fw-bold mb-4">
          Departments
        </h4>

        {departments.length === 0 ? (

          <div className="text-center py-5">

            <i
              className="bi bi-diagram-3"
              style={{
                fontSize: "60px",
                color: "#cbd5e1",
              }}
            ></i>

            <h5 className="mt-3">
              No Departments Found
            </h5>

            <p className="text-muted mb-0">
              Create your first department.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>Institution</th>

                  <th>Department</th>

                  <th>Description</th>

                  <th className="text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {departments.map((department) => (

                  <tr key={department.id}>

                    <td>

                      {getInstitutionName(
                        department.institution_id
                      )}

                    </td>

                    <td>

                      <strong>
                        {department.department_name}
                      </strong>

                    </td>

                    <td>

                      {department.description || "-"}

                    </td>

                    <td className="text-center">

                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() =>
                          onEdit(department)
                        }
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          onDelete(department.id)
                        }
                      >
                        <i className="bi bi-trash"></i>
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

export default DepartmentTable;
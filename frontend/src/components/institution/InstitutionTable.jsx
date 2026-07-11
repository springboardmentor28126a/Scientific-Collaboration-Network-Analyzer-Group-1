function InstitutionTable({
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
            Loading institutions...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 rounded-4 mt-4">

      <div className="card-body">

        <h4 className="fw-bold mb-4">

          Institutions

        </h4>

        {institutions.length === 0 ? (

          <div className="text-center py-5">

            <i
              className="bi bi-building"
              style={{
                fontSize: "60px",
                color: "#cbd5e1",
              }}
            ></i>

            <h5 className="mt-3">

              No Institutions Found

            </h5>

            <p className="text-muted mb-0">

              Create your first institution.

            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>Institution</th>

                  <th>Email</th>

                  <th>Location</th>

                  <th>Website</th>

                  <th className="text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {institutions.map((institution) => (

                  <tr key={institution.id}>

                    <td>

                      <strong>

                        {institution.institution_name}

                      </strong>

                    </td>

                    <td>

                      {institution.email}

                    </td>

                    <td>

                      {institution.city}, {institution.state}

                    </td>

                    <td>

                      {institution.website ? (

                        <a
                          href={institution.website}
                          target="_blank"
                          rel="noreferrer"
                        >

                          Visit

                        </a>

                      ) : (

                        "-"

                      )}

                    </td>

                    <td className="text-center">

                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() =>
                          onEdit(institution)
                        }
                      >

                        <i className="bi bi-pencil-square"></i>

                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          onDelete(institution.id)
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

export default InstitutionTable;
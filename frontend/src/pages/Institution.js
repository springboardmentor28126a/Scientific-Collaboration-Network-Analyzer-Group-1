import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function Institution() {
  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await API.get("/institution/");
      setInstitutions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteInstitution = async (id) => {
    if (window.confirm("Delete this institution?")) {
      try {
        await API.delete(`/institution/${id}`);
        alert("Institution deleted");
        fetchInstitutions();
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Search Filter
  const filteredInstitutions = institutions.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">

      <h2 className="text-center mb-4">Institution Management</h2>

      <div className="d-flex justify-content-between mb-3">

        <input
          type="text"
          className="form-control w-50"
          placeholder="Search Institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Link
          to="/add-institution"
          className="btn btn-success"
        >
          Add Institution
        </Link>

      </div>

      <table className="table table-bordered table-striped">

        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Website</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {filteredInstitutions.length > 0 ? (

            filteredInstitutions.map((item) => (

              <tr key={item.id}>

                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.location}</td>
                <td>{item.website}</td>

                <td>

                  <Link
                    to={`/edit-institution/${item.id}`}
                    className="btn btn-primary btn-sm me-2"
                  >
                    Edit
                  </Link>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteInstitution(item.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td colSpan="5" className="text-center">
                No Institutions Found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default Institution;
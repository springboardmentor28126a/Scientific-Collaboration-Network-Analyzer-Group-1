import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/api";


function Citation() {

  const [citations, setCitations] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    authors: "",
    publication_year: "",
    journal: "",
    doi: "",
    url: "",
    citation_type: "Journal Article",
    notes: ""
  });


  // GET ALL CITATIONS

  useEffect(() => {
    loadCitations();
  }, []);


  const loadCitations = async () => {

    try {

      const response = await api.get("/citations/");

      console.log("Citations from API:", response.data);

      setCitations(response.data);

    }

    catch (error) {

      console.log("Error loading citations:", error);

    }

  };


  // HANDLE INPUT CHANGE

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  // RESET FORM

  const resetForm = () => {

    setForm({
      title: "",
      authors: "",
      publication_year: "",
      journal: "",
      doi: "",
      url: "",
      citation_type: "Journal Article",
      notes: ""
    });

    setEditingId(null);
    setShowForm(false);

  };


  // ADD / UPDATE CITATION

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const data = {
        ...form,
        publication_year: Number(form.publication_year)
      };


      if (editingId) {

        await api.put(
          `/citations/${editingId}`,
          data
        );

      }

      else {

        await api.post(
          "/citations/",
          data
        );

      }


      await loadCitations();

      resetForm();

    }

    catch (error) {

      console.log("Error saving citation:", error);

      alert("Unable to save citation.");

    }

  };


  // EDIT CITATION

  const handleEdit = (citation) => {

    setForm({
      title: citation.title || "",
      authors: citation.authors || "",
      publication_year: citation.publication_year || "",
      journal: citation.journal || "",
      doi: citation.doi || "",
      url: citation.url || "",
      citation_type: citation.citation_type || "Journal Article",
      notes: citation.notes || ""
    });

    setEditingId(citation.id);

    setShowForm(true);

  };


  // DELETE CITATION

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this citation?")) {
      return;
    }


    try {

      await api.delete(`/citations/${id}`);

      await loadCitations();

    }

    catch (error) {

      console.log("Error deleting citation:", error);

      alert("Unable to delete citation.");

    }

  };


  // SEARCH

  const filteredCitations = citations.filter((citation) => {

    const text = `
      ${citation.title || ""}
      ${citation.authors || ""}
      ${citation.journal || ""}
      ${citation.doi || ""}
      ${citation.citation_type || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());

  });


  return (

    <div className="citation-page">


      {/* SAME SIDEBAR AS INSTITUTIONS */}

      <Navbar />


      {/* RIGHT SIDE CONTENT */}

      <div className="citation-content">


        {/* PAGE HEADER */}

        <div className="page-header">

          <BookOpen size={45} />

          <div>

            <h1>
              Citation Management
            </h1>

            <p>
              Manage and organize research citations.
            </p>

          </div>

        </div>


        {/* ADD / UPDATE FORM */}

        {showForm && (

          <div className="citation-form-card">

            <h2>
              {editingId
                ? "Update Citation"
                : "Add New Citation"}
            </h2>


            <form onSubmit={handleSubmit}>

              <div className="citation-grid">


                <div className="citation-field full">

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Citation Title"
                    required
                  />

                </div>


                <div className="citation-field full">

                  <input
                    name="authors"
                    value={form.authors}
                    onChange={handleChange}
                    placeholder="Authors"
                    required
                  />

                </div>


                <div className="citation-field">

                  <input
                    type="number"
                    name="publication_year"
                    value={form.publication_year}
                    onChange={handleChange}
                    placeholder="Publication Year"
                    min="1900"
                    max="2100"
                    required
                  />

                </div>


                <div className="citation-field">

                  <select
                    name="citation_type"
                    value={form.citation_type}
                    onChange={handleChange}
                  >

                    <option>Journal Article</option>

                    <option>Conference Paper</option>

                    <option>Book</option>

                    <option>Book Chapter</option>

                    <option>Thesis</option>

                    <option>Website</option>

                  </select>

                </div>


                <div className="citation-field">

                  <input
                    name="journal"
                    value={form.journal}
                    onChange={handleChange}
                    placeholder="Journal / Publication"
                  />

                </div>


                <div className="citation-field">

                  <input
                    name="doi"
                    value={form.doi}
                    onChange={handleChange}
                    placeholder="DOI"
                  />

                </div>


                <div className="citation-field full">

                  <input
                    name="url"
                    value={form.url}
                    onChange={handleChange}
                    placeholder="Website URL"
                  />

                </div>


                <div className="citation-field full">

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Notes"
                    rows="3"
                  />

                </div>


              </div>


              <div className="citation-form-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingId
                    ? "Update Citation"
                    : "Add Citation"}
                </button>

              </div>

            </form>

          </div>

        )}


        {/* ADD CITATION BUTTON */}

        {!showForm && (

          <button
            className="add-citation-btn"
            onClick={() => setShowForm(true)}
          >

            <Plus size={18} />

            Add New Citation

          </button>

        )}


        {/* SEARCH */}

        <div className="citation-search-container">

          <Search />

          <input
            placeholder="Search citation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        {/* CITATION TABLE */}

        <div className="citation-table-container">

          <table className="citation-table">

            <thead>

              <tr>

                <th>Title</th>

                <th>Authors</th>

                <th>Year</th>

                <th>Type</th>

                <th>Journal</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {filteredCitations.map((citation) => (

                <tr key={citation.id}>

                  <td>
                    {citation.title}
                  </td>

                  <td>
                    {citation.authors}
                  </td>

                  <td>
                    {citation.publication_year}
                  </td>

                  <td>
                    {citation.citation_type}
                  </td>

                  <td>
                    {citation.journal || "-"}
                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(citation)}
                      >

                        <Edit size={16} />

                        Edit

                      </button>


                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(citation.id)}
                      >

                        <Trash2 size={16} />

                        Delete

                      </button>

                    </div>

                  </td>

                </tr>

              ))}


            </tbody>

          </table>


          {filteredCitations.length === 0 && (

            <div className="empty-citations">

              <BookOpen size={35} />

              <h3>
                No citations found
              </h3>

              <p>
                Add your first research citation.
              </p>

            </div>

          )}

        </div>


      </div>

    </div>

  );

}


export default Citation;
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

function EditPublication() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState({
    title: "",
    author: "",
    journal: "",
    year: ""
  });

  useEffect(() => {

    const fetchPublication = async () => {

      try {

        const response = await API.get(`/publication/${id}`);

        setPublication({
          title: response.data.title,
          author: response.data.author,
          journal: response.data.journal,
          year: response.data.year
        });

      } catch (error) {
        console.log(error);
        alert("Failed to load publication.");
      }

    };

    fetchPublication();

  }, [id]);

  const handleChange = (e) => {
    setPublication({
      ...publication,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.put(`/publication/${id}`, publication);

      alert("Publication updated successfully.");

      navigate("/publication");

    } catch (error) {
      console.log(error);
      alert("Failed to update publication.");
    }

  };

  return (

    <div style={{ padding: "30px" }}>

      <h1>Edit Publication</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          value={publication.title}
          onChange={handleChange}
          placeholder="Title"
        />

        <br /><br />

        <input
          type="text"
          name="author"
          value={publication.author}
          onChange={handleChange}
          placeholder="Author"
        />

        <br /><br />

        <input
          type="text"
          name="journal"
          value={publication.journal}
          onChange={handleChange}
          placeholder="Journal"
        />

        <br /><br />

        <input
          type="number"
          name="year"
          value={publication.year}
          onChange={handleChange}
          placeholder="Year"
        />

        <br /><br />

        <button type="submit">
          Update Publication
        </button>

      </form>

    </div>

  );
}

export default EditPublication;
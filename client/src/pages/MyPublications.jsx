import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { FaTrash } from "react-icons/fa";

function Publications() {
  const [publications, setPublications] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [customType, setCustomType] = useState("");
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    id: null,
    title: "",
    authors: "",
    journal: "",
    publication_year: "",
    doi: "",
    keywords: "",
    abstract: "",
    pdf_file: "",
    status: "Draft",
    researcher_id: null,
  });

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      const response = await API.get("/publications/");
      setPublications(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const searchPublication = async () => {
    try {
      if (searchTitle.trim() === "") {
        loadPublications();
        return;
      }

      const response = await API.get(
        `/publications/search/${searchTitle}`
      );

      setPublications(response.data);
    } catch (error) {
      alert("No publications found");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const uploadPDF = async () => {

    if (!selectedFile) return "";

    const data = new FormData();

    data.append("file", selectedFile);

    try {

        const response = await API.post(

            "/publications/upload",

            data,

            {

                headers: {

                    "Content-Type": "multipart/form-data"

                }

            }

        );

        return response.data.pdf_url;

    }

    catch (error) {

        console.log(error);

        alert("PDF Upload Failed");

        return "";

    }

};

const addPublication = async () => {

    try {

        const pdfURL = await uploadPDF();

        const publicationData = {

            ...form,

            publication_type:

                form.publication_type === "Others"
                    ? customType
                    : form.publication_type,

            pdf_file: pdfURL

        };

        await API.post(

            "/publications/",

            publicationData

        );

        alert("Publication Added Successfully");

        loadPublications();

        setForm({

            id: null,

            title: "",

            authors: "",

            journal: "",

            publication_type: "Journal Article",

            publication_year: "",

            doi: "",

            keywords: "",

            status: "Draft",

            researcher_id: null

        });

        setCustomType("");

        setSelectedFile(null);

        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }

    }

    catch (error) {

        console.log(error);

    }

};
const updatePublication = async () => {

    try {

        let pdfURL = form.pdf_file;

        if (selectedFile) {

            pdfURL = await uploadPDF();

        }

        const publicationData = {

            ...form,

            publication_type:

                form.publication_type === "Others"

                    ? customType

                    : form.publication_type,

            pdf_file: pdfURL

        };

        await API.put(

            `/publications/${form.id}`,

            publicationData

        );

        alert("Publication Updated Successfully");

        loadPublications();

        setForm({

            id: null,

            title: "",

            authors: "",

            journal: "",

            publication_type: "Journal Article",

            publication_year: "",

            doi: "",

            keywords: "",

            abstract: "",

            pdf_file: "",

            status: "Draft",

            researcher_id: null

        });

        setCustomType("");

        setSelectedFile(null);

        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }

    }

    catch (error) {

        console.log(error);

    }

};
        

  const deletePublication = async (id) => {
    try {
      await API.delete(`/publications/${id}`);

      alert("Publication Deleted Successfully");

      loadPublications();
    } catch (error) {
      console.log(error);
    }
  };
  const searchPublications = async () => {

    try {

        const params = {};

        switch (filterType) {

            case "Title":

                params.title = filterValue;

                break;

            case "Author":

                params.author = filterValue;

                break;

            case "Journal":

                params.journal = filterValue;

                break;

            case "Publication Type":

                params.publication_type = filterValue;

                break;

            case "Keyword":

                params.keyword = filterValue;

                break;

            case "Year":

                params.year = filterValue;

                break;

            case "Status":

                params.status = filterValue;

                break;

            case "DOI":

                params.doi = filterValue;

                break;

            default:

                break;

        }

        const response = await API.get(

            "/publications/search",

            {

                params

            }

        );

        setPublications(response.data);

    }

    catch(error){

        console.log(error);

    }

};
  const editPublication = (publication) => {
    console.log("Edit clicked", publication);

    setForm({

        id: publication.id,

        title: publication.title,

        authors: publication.authors,

        journal: publication.journal,

        publication_type:
            publication.publication_type || "Journal Article",

        publication_year: publication.publication_year,

        doi: publication.doi,

        keywords: publication.keywords,

        abstract: publication.abstract || "",

        pdf_file: publication.pdf_file || "",

        status: publication.status,

        researcher_id: publication.researcher_id

    });

    if (
        publication.publication_type &&
        ![
            "Journal Article",
            "Conference Paper",
            "Book Chapter",
            "Thesis",
            "Patent",
            "Technical Report"
        ].includes(publication.publication_type)
    ) {

        setForm((prev) => ({
            ...prev,
            publication_type: "Others"
        }));

        setCustomType(publication.publication_type);

    } else {

        setCustomType("");

    }

};
    const statsCard = {

    background: "white",

    padding: "25px",

    borderRadius: "15px",

    textAlign: "center",

    boxShadow: "0 5px 15px rgba(0,0,0,.1)"

};
  return (
    <div style={{ padding: "30px" }}>

      <h1>Scientific Collaboration Network Analyzer</h1>

      <h2>Publication Management</h2>

      {/* Search */}

      <div style={{ marginBottom: "20px" }}>

        <input
          type="text"
          placeholder="Search by Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />

        <button
          onClick={searchPublication}
          style={{ marginLeft: "10px" }}
        >
          Search
        </button>

        <button
          onClick={loadPublications}
          style={{ marginLeft: "10px" }}
        >
          Show All
        </button>

      </div>

      {/* Add Publication */}

      <div style={{ marginBottom: "20px" }}>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <input
          type="text"
          name="authors"
          placeholder="Authors"
          value={form.authors}
          onChange={handleChange}
        />

        <input
          type="text"
          name="journal"
          placeholder="Journal"
          value={form.journal}
          onChange={handleChange}
        />

        <input
          type="number"
          name="publication_year"
          placeholder="Year"
          value={form.publication_year}
          onChange={handleChange}
        />

        <input
          type="text"
          name="doi"
          placeholder="DOI"
          value={form.doi}
          onChange={handleChange}
        />

        <input
          type="text"
          name="keywords"
          placeholder="Keywords"
          value={form.keywords}
          onChange={handleChange}
        />
        <textarea

    name="abstract"

    placeholder="Research Abstract"

    value={form.abstract}

    onChange={handleChange}

    rows={4}

    style={{

        width: "100%",

        marginTop: "10px"

    }}

/>
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  }}
>
<input
  ref={fileInputRef}
  type="file"
  accept=".pdf"
  onChange={(e) => setSelectedFile(e.target.files[0])}
/>

  {selectedFile && (
    <>
     
      <button
        type="button"
onClick={() => {
    setSelectedFile(null);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
}}        style={{
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "35px",
          height: "35px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaTrash />
      </button>
    </>
  )}
</div>
<select
    name="publication_type"
    value={form.publication_type}
    onChange={handleChange}
>

    <option>Journal Article</option>

    <option>Conference Paper</option>

    <option>Book Chapter</option>

    <option>Thesis</option>

    <option>Patent</option>

    <option>Technical Report</option>

    <option>Others</option>

</select>
{
    form.publication_type === "Others" && (

        <input

            type="text"

            placeholder="Enter Publication Type"

            value={customType}

            onChange={(e)=>

                setCustomType(e.target.value)

            }

        />

    )
}


        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option>Draft</option>
          <option>Submitted</option>
          <option>Published</option>
          <option>Archived</option>
        </select>

        <button

    onClick={

        form.id

            ? updatePublication

            : addPublication

    }

>

    {

        form.id

            ? "Update Publication"

            : "Add Publication"

    }

</button>

      </div>
    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    marginBottom: "30px",
  }}
>
  <div style={statsCard}>
    <h3>📚 Total</h3>
    <h1>{publications.length}</h1>
  </div>

  <div style={statsCard}>
    <h3>🟢 Published</h3>
    <h1>
      {
        publications.filter(
          (p) => p.status === "Published"
        ).length
      }
    </h1>
  </div>

  <div style={statsCard}>
    <h3>🟡 Draft</h3>
    <h1>
      {
        publications.filter(
          (p) => p.status === "Draft"
        ).length
      }
    </h1>
  </div>

  <div style={statsCard}>
    <h3>🔵 Submitted</h3>
    <h1>
      {
        publications.filter(
          (p) => p.status === "Submitted"
        ).length
      }
    </h1>
  </div>
</div> 

     <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  }}
>
  {publications.map((publication) => (
    <div
      key={publication.id}
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "20px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#2563eb" }}>
        📄 {publication.title}
      </h2>

      <p><b>👨‍🔬 Authors:</b> {publication.authors}</p>

      <p><b>📚 Journal:</b> {publication.journal}</p>

      <p><b>📅 Year:</b> {publication.publication_year}</p>

      <p>
        <b>Status:</b>{" "}
        <span
          style={{
            color:
              publication.status === "Published"
                ? "green"
                : publication.status === "Draft"
                ? "orange"
                : "blue",
            fontWeight: "bold",
          }}
        >
          {publication.status}
        </span>
      </p>

      <p><b>🔗 DOI:</b> {publication.doi || "N/A"}</p>

      <p><b>🏷 Keywords:</b> {publication.keywords || "N/A"}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          👁 View
        </button>

        <button

    onClick={() =>
        editPublication(publication)
    }

    style={{
        background: "#22c55e",
        color: "white",
        border: "none",
        padding: "8px 14px",
        borderRadius: "8px",
        cursor: "pointer"
    }}

>

    ✏ Edit

</button>

        <button
          onClick={() => deletePublication(publication.id)}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}

export default Publications;

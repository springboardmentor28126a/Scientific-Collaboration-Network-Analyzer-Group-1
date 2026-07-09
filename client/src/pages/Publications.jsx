import { useEffect, useState } from "react";
import API from "../services/api";

function Publications() {
  const [publications, setPublications] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");

  const [form, setForm] = useState({
    id: null,
    title: "",
    authors: "",
    journal: "",
    publication_year: "",
    doi: "",
    keywords: "",
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

  const addPublication = async () => {
    try {
      await API.post("/publications/", form);

      alert("Publication Added Successfully");

      loadPublications();

      setForm({
        id: null,
        title: "",
        authors: "",
        journal: "",
        publication_year: "",
        doi: "",
        keywords: "",
        status: "Draft",
        researcher_id: null,
      });

    } catch (error) {
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

        <button onClick={addPublication}>
          Add Publication
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
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
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
// import { useEffect, useState } from "react";
// import API from "../services/api";

// function Publications() {

//     const [publications, setPublications] = useState([]);
//     const [searchTitle, setSearchTitle] = useState("");

//     const [showModal, setShowModal] = useState(false);
//     const [viewModal, setViewModal] = useState(false);
//     const [editModal, setEditModal] = useState(false);

//     const [selectedPublication, setSelectedPublication] = useState(null);

//     const [form, setForm] = useState({
//         id: null,
//         title: "",
//         authors: "",
//         journal: "",
//         publication_year: "",
//         doi: "",
//         keywords: "",
//         status: "Draft",
//         researcher_id: null
//     });
//     /* ===================== STYLES ===================== */

// const statsCard = {

//     background: "#2563eb",

//     color: "white",

//     padding: "25px",

//     borderRadius: "15px",

//     textAlign: "center",

//     boxShadow: "0 8px 20px rgba(0,0,0,.15)"

// };

// const publicationCard = {

//     background: "white",

//     borderRadius: "15px",

//     padding: "20px",

//     boxShadow: "0 6px 15px rgba(0,0,0,.12)",

//     transition: "0.3s",

//     cursor: "pointer"

// };

// const overlayStyle = {

//     position: "fixed",

//     top: 0,

//     left: 0,

//     right: 0,

//     bottom: 0,

//     background: "rgba(0,0,0,.45)",

//     display: "flex",

//     justifyContent: "center",

//     alignItems: "center",

//     zIndex: 999

// };

// const modalStyle = {

//     width: "650px",

//     maxWidth: "90%",

//     background: "white",

//     borderRadius: "15px",

//     padding: "30px",

//     boxShadow: "0 15px 40px rgba(0,0,0,.25)",

//     animation: "fadeIn .25s ease"

// };

// const inputStyle = {

//     width: "100%",

//     padding: "12px",

//     marginBottom: "15px",

//     border: "1px solid #ddd",

//     borderRadius: "8px",

//     fontSize: "15px",

//     outline: "none",

//     boxSizing: "border-box"

// };

// const blueButton = {

//     background: "#2563eb",

//     color: "white",

//     border: "none",

//     padding: "10px 18px",

//     borderRadius: "8px",

//     cursor: "pointer",

//     fontWeight: "bold"

// };

// const greenButton = {

//     background: "#22c55e",

//     color: "white",

//     border: "none",

//     padding: "10px 18px",

//     borderRadius: "8px",

//     cursor: "pointer",

//     fontWeight: "bold"

// };

// const redButton = {

//     background: "#ef4444",

//     color: "white",

//     border: "none",

//     padding: "10px 18px",

//     borderRadius: "8px",

//     cursor: "pointer",

//     fontWeight: "bold"

// };

// const grayButton = {

//     background: "#64748b",

//     color: "white",

//     border: "none",

//     padding: "10px 18px",

//     borderRadius: "8px",

//     cursor: "pointer",

//     fontWeight: "bold"

// };
//     useEffect(() => {
//         loadPublications();
//     }, []);

//     const loadPublications = async () => {

//         try {

//             const response = await API.get("/publications/");

//             setPublications(response.data);

//         }

//         catch (error) {

//             console.log(error);

//         }

//     };

//     const searchPublication = async () => {

//         try {

//             if (searchTitle.trim() === "") {

//                 loadPublications();

//                 return;

//             }

//             const response = await API.get(
//                 `/publications/search/${searchTitle}`
//             );

//             setPublications(response.data);

//         }

//         catch {

//             alert("No Publications Found");

//         }

//     };

//     const handleChange = (e) => {

//         setForm({

//             ...form,

//             [e.target.name]: e.target.value

//         });

//     };

//     const clearForm = () => {

//         setForm({

//             id: null,
//             title: "",
//             authors: "",
//             journal: "",
//             publication_year: "",
//             doi: "",
//             keywords: "",
//             status: "Draft",
//             researcher_id: null

//         });

//     };

//     const addPublication = async () => {

//         try {

//             await API.post("/publications/", form);

//             alert("Publication Added Successfully");

//             clearForm();

//             setShowModal(false);

//             loadPublications();

//         }

//         catch (error) {

//             console.log(error);

//         }

//     };

//     const updatePublication = async () => {

//         try {

//             await API.put(

//                 `/publications/${form.id}`,

//                 form

//             );

//             alert("Publication Updated");

//             setEditModal(false);

//             clearForm();

//             loadPublications();

//         }

//         catch (error) {

//             console.log(error);

//         }

//     };

//     const deletePublication = async (id) => {

//         const confirmDelete = window.confirm(

//             "Delete this publication?"

//         );

//         if (!confirmDelete) return;

//         try {

//             await API.delete(`/publications/${id}`);

//             alert("Publication Deleted");

//             loadPublications();

//         }

//         catch (error) {

//             console.log(error);

//         }

//     };

//     const openView = (publication) => {

//         setSelectedPublication(publication);

//         setViewModal(true);

//     };

//     const openEdit = (publication) => {

//         setForm(publication);

//         setEditModal(true);

//   };    return (

//         <div
//             style={{
//                 minHeight: "100vh",
//                 background: "#f5f7fb",
//                 padding: "30px"
//             }}
//         >

//             {/* Header */}

//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "30px"
//                 }}
//             >

//                 <div>

//                     <h1
//                         style={{
//                             color: "#2563eb",
//                             marginBottom: "5px"
//                         }}
//                     >
//                         🔬 Scientific Collaboration Network Analyzer
//                     </h1>

//                     <p
//                         style={{
//                             color: "#666",
//                             fontSize: "17px"
//                         }}
//                     >
//                         Manage all research publications in one place.
//                     </p>

//                 </div>

//                 <button

//                     onClick={() => {

//                         clearForm();

//                         setShowModal(true);

//                     }}

//                     style={{

//                         background: "#2563eb",

//                         color: "white",

//                         border: "none",

//                         padding: "14px 24px",

//                         borderRadius: "10px",

//                         cursor: "pointer",

//                         fontSize: "16px",

//                         fontWeight: "bold"

//                     }}

//                 >

//                     ➕ New Publication

//                 </button>

//             </div>

//             {/* Statistics */}

//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
//                     gap: "20px",
//                     marginBottom: "30px"
//                 }}
//             >

//                 <div style={statsCard}>

//                     <h3>📚 Total</h3>

//                     <h1>{publications.length}</h1>

//                 </div>

//                 <div style={statsCard}>

//                     <h3>🟢 Published</h3>

//                     <h1>

//                         {
//                             publications.filter(

//                                 p => p.status === "Published"

//                             ).length
//                         }

//                     </h1>

//                 </div>

//                 <div style={statsCard}>

//                     <h3>🟡 Draft</h3>

//                     <h1>

//                         {
//                             publications.filter(

//                                 p => p.status === "Draft"

//                             ).length
//                         }

//                     </h1>

//                 </div>

//                 <div style={statsCard}>

//                     <h3>🔵 Submitted</h3>

//                     <h1>

//                         {
//                             publications.filter(

//                                 p => p.status === "Submitted"

//                             ).length
//                         }

//                     </h1>

//                 </div>

//             </div>

//             {/* Search */}

//             <div
//                 style={{
//                     display: "flex",
//                     marginBottom: "30px",
//                     gap: "15px"
//                 }}
//             >

//                 <input

//                     value={searchTitle}

//                     onChange={(e) =>

//                         setSearchTitle(e.target.value)

//                     }

//                     placeholder="🔍 Search Publications..."

//                     style={{

//                         flex: 1,

//                         padding: "14px",

//                         borderRadius: "10px",

//                         border: "1px solid #ddd",

//                         fontSize: "16px"

//                     }}

//                 />

//                 <button
//                     onClick={searchPublication}
//                     style={blueButton}
//                 >
//                     Search
//                 </button>

//                 <button
//                     onClick={loadPublications}
//                     style={greenButton}
//                 >
//                     Show All
//                 </button>

//             </div>

//             {/* Cards */}

//             <div

//                 style={{

//                     display: "grid",

//                     gridTemplateColumns:
//                         "repeat(auto-fill,minmax(350px,1fr))",

//                     gap: "25px"

//                 }}

//             >

//                 {

//                     publications.map((publication) => (

//                         <div

//                             key={publication.id}

//                             style={publicationCard}

//                         >

//                             <h2
//                                 style={{
//                                     color: "#2563eb"
//                                 }}
//                             >

//                                 📄 {publication.title}

//                             </h2>

//                             <p>

//                                 👨‍🔬 <b>Authors:</b>

//                                 {" "}

//                                 {publication.authors}

//                             </p>

//                             <p>

//                                 📚 <b>Journal:</b>

//                                 {" "}

//                                 {publication.journal}

//                             </p>

//                             <p>

//                                 📅 <b>Year:</b>

//                                 {" "}

//                                 {publication.publication_year}

//                             </p>

//                             <p>

//                                 🔗 <b>DOI:</b>

//                                 {" "}

//                                 {publication.doi || "N/A"}

//                             </p>

//                             <p>

//                                 🏷 <b>Keywords:</b>

//                                 {" "}

//                                 {publication.keywords || "N/A"}

//                             </p>

//                             <div
//                                 style={{
//                                     marginTop: "12px"
//                                 }}
//                             >

//                                 <span
//                                     style={{

//                                         padding:
//                                             "6px 14px",

//                                         borderRadius:
//                                             "20px",

//                                         background:

//                                             publication.status === "Published"

//                                                 ? "#dcfce7"

//                                                 : publication.status === "Draft"

//                                                 ? "#fef3c7"

//                                                 : "#dbeafe",

//                                         color:

//                                             publication.status === "Published"

//                                                 ? "#15803d"

//                                                 : publication.status === "Draft"

//                                                 ? "#b45309"

//                                                 : "#2563eb",

//                                         fontWeight: "bold"

//                                     }}
//                                 >

//                                     {publication.status}

//                                 </span>

//                             </div>

//                             <div
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     marginTop: "25px"
//                                 }}
//                             >

//                                 <button

//                                     style={blueButton}

//                                     onClick={() =>

//                                         openView(publication)

//                                     }

//                                 >

//                                     👁 View

//                                 </button>

//                                 <button

//                                     style={greenButton}

//                                     onClick={() =>

//                                         openEdit(publication)

//                                     }

//                                 >

//                                     ✏ Edit

//                                 </button>

//                                 <button

//                                     style={redButton}

//                                     onClick={() =>

//                                         deletePublication(publication.id)

//                                     }

//                                 >

//                                     🗑 Delete

//                                 </button>

//                             </div>

//                         </div>

//                     ))

//                 }

//             </div>
// {/* ===================== ADD PUBLICATION MODAL ===================== */}

// {
// showModal && (

// <div
//     style={overlayStyle}
// >

//     <div
//         style={modalStyle}
//     >

//         <h2
//             style={{
//                 color:"#2563eb",
//                 marginBottom:"20px"
//             }}
//         >

//             ➕ Add New Publication

//         </h2>

//         <input
//             type="text"
//             name="title"
//             placeholder="Publication Title"
//             value={form.title}
//             onChange={handleChange}
//             style={inputStyle}
//         />

//         <input
//             type="text"
//             name="authors"
//             placeholder="Authors"
//             value={form.authors}
//             onChange={handleChange}
//             style={inputStyle}
//         />

//         <input
//             type="text"
//             name="journal"
//             placeholder="Journal Name"
//             value={form.journal}
//             onChange={handleChange}
//             style={inputStyle}
//         />

//         <input
//             type="number"
//             name="publication_year"
//             placeholder="Publication Year"
//             value={form.publication_year}
//             onChange={handleChange}
//             style={inputStyle}
//         />

//         <input
//             type="text"
//             name="doi"
//             placeholder="DOI"
//             value={form.doi}
//             onChange={handleChange}
//             style={inputStyle}
//         />

//         <input
//             type="text"
//             name="keywords"
//             placeholder="Keywords"
//             value={form.keywords}
//             onChange={handleChange}
//             style={inputStyle}
//         />

//         <select
//             name="status"
//             value={form.status}
//             onChange={handleChange}
//             style={inputStyle}
//         >

//             <option>Draft</option>

//             <option>Submitted</option>

//             <option>Published</option>

//             <option>Archived</option>

//         </select>

//         <div
//             style={{
//                 display:"flex",
//                 justifyContent:"flex-end",
//                 gap:"15px",
//                 marginTop:"25px"
//             }}
//         >

//             <button

//                 onClick={() => {

//                     clearForm();

//                     setShowModal(false);

//                 }}

//                 style={grayButton}

//             >

//                 Cancel

//             </button>

//             <button

//                 onClick={addPublication}

//                 style={greenButton}

//             >

//                 Save Publication

//             </button>

//         </div>

//     </div>

// </div>

// )
// }
// {/* ===================== VIEW MODAL ===================== */}

// {
// viewModal && selectedPublication && (

// <div style={overlayStyle}>

//     <div style={modalStyle}>

//         <h2
//             style={{
//                 color:"#2563eb",
//                 marginBottom:"20px"
//             }}
//         >
//             📄 Publication Details
//         </h2>

//         <p><b>Title:</b> {selectedPublication.title}</p>

//         <p><b>Authors:</b> {selectedPublication.authors}</p>

//         <p><b>Journal:</b> {selectedPublication.journal}</p>

//         <p><b>Year:</b> {selectedPublication.publication_year}</p>

//         <p><b>DOI:</b> {selectedPublication.doi}</p>

//         <p><b>Keywords:</b> {selectedPublication.keywords}</p>

//         <p><b>Status:</b> {selectedPublication.status}</p>

//         <div
//             style={{
//                 display:"flex",
//                 justifyContent:"flex-end",
//                 marginTop:"25px"
//             }}
//         >

//             <button

//                 style={blueButton}

//                 onClick={()=>setViewModal(false)}

//             >

//                 Close

//             </button>

//         </div>

//     </div>

// </div>

// )
// }

// {/* ===================== EDIT MODAL ===================== */}

// {
// editModal && (

// <div style={overlayStyle}>

//     <div style={modalStyle}>

//         <h2
//             style={{
//                 color:"#22c55e",
//                 marginBottom:"20px"
//             }}
//         >

//             ✏ Edit Publication

//         </h2>

//         <input

//             name="title"

//             value={form.title}

//             placeholder="Title"

//             onChange={handleChange}

//             style={inputStyle}

//         />

//         <input

//             name="authors"

//             value={form.authors}

//             placeholder="Authors"

//             onChange={handleChange}

//             style={inputStyle}

//         />

//         <input

//             name="journal"

//             value={form.journal}

//             placeholder="Journal"

//             onChange={handleChange}

//             style={inputStyle}

//         />

//         <input

//             name="publication_year"

//             value={form.publication_year}

//             placeholder="Year"

//             onChange={handleChange}

//             style={inputStyle}

//         />

//         <input

//             name="doi"

//             value={form.doi}

//             placeholder="DOI"

//             onChange={handleChange}

//             style={inputStyle}

//         />

//         <input

//             name="keywords"

//             value={form.keywords}

//             placeholder="Keywords"

//             onChange={handleChange}

//             style={inputStyle}

//         />

//         <select

//             name="status"

//             value={form.status}

//             onChange={handleChange}

//             style={inputStyle}

//         >

//             <option>Draft</option>

//             <option>Submitted</option>

//             <option>Published</option>

//             <option>Archived</option>

//         </select>

//         <div
//             style={{
//                 display:"flex",
//                 justifyContent:"flex-end",
//                 gap:"15px",
//                 marginTop:"25px"
//             }}
//         >

//             <button

//                 style={grayButton}

//                 onClick={()=>{

//                     clearForm();

//                     setEditModal(false);

//                 }}

//             >

//                 Cancel

//             </button>

//             <button

//                 style={greenButton}

//                 onClick={updatePublication}

//             >

//                 Update Publication

//             </button>

//         </div>

//     </div>

// </div>

// )
// }
// export default Publications; 
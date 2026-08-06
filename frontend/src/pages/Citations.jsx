import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    getCitations,
    createCitation,
    updateCitation,
    deleteCitation
} from "../services/citationService";

function Citations() {
    const [citations, setCitations] = useState([]);
    const [search, setSearch] = useState("");

const [showForm, setShowForm] = useState(false);

const [isEditing, setIsEditing] = useState(false);

const [editingId, setEditingId] = useState(null);

const [newCitation, setNewCitation] = useState({
    paper_id: "",
    cited_paper_title: "",
    authors: "",
    publication_year: "",
    doi: "",
    citation_count: ""
});

    const loadCitations = async () => {
        try {
            const data = await getCitations();
            setCitations(data);
        } catch (error) {
            console.log(error);
        }
    };
    const filteredCitations = citations.filter((citation) =>
    citation.cited_paper_title
        .toLowerCase()
        .includes(search.toLowerCase())
);
const handleSaveCitation = async () => {

    try {

        if (isEditing) {

            await updateCitation(editingId, newCitation);
            alert("Citation updated successfully!");
        } else {

            await createCitation(newCitation);
            alert("Citation added successfully!");

        }

        loadCitations();

        setShowForm(false);

        setIsEditing(false);

        setEditingId(null);

        setNewCitation({
            paper_id: "",
            cited_paper_title: "",
            authors: "",
            publication_year: "",
            doi: "",
            citation_count: ""
        });

    } catch (error) {

        console.log(error);

    }

};
const handleEditCitation = (citation) => {

    setIsEditing(true);

    setEditingId(citation.id);

    setNewCitation({
        paper_id: citation.paper_id,
        cited_paper_title: citation.cited_paper_title,
        authors: citation.authors,
        publication_year: citation.publication_year,
        doi: citation.doi,
        citation_count: citation.citation_count
    });

    setShowForm(true);

};
const handleDeleteCitation = async (id) => {

    if (!window.confirm("Delete Citation?")) return;

    await deleteCitation(id);
    alert("Citation deleted successfully!");

    loadCitations();

};

    useEffect(() => {
        loadCitations();
    }, []);

    return (
    <DashboardLayout>

        <h1 style={{ color: "white" }}>Citation Management</h1>

        <input
            type="text"
            placeholder="Search Citation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
                width: "320px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#1d1d1d",
                color: "white",
                marginBottom: "20px",
                marginRight: "20px"
            }}
        />

        <button
            onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setNewCitation({
                    paper_id: "",
                    cited_paper_title: "",
                    authors: "",
                    publication_year: "",
                    doi: "",
                    citation_count: ""
                });
                setShowForm(true);
            }}
            style={{
                background: "#ff2d2d",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "20px"
            }}
        >
            + Add Citation
        </button>

        <table
            border="1"
            cellPadding="10"
            style={{
                background: "white",
                color: "black",
                marginTop: "20px",
                width: "100%"
            }}
        >
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Paper ID</th>
                    <th>Title</th>
                        <th>Authors</th>
                        <th>Year</th>
                        <th>DOI</th>
                        <th>Citation Count</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredCitations.length === 0 ? (
    <tr>
        <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
            No Citations Found
        </td>
    </tr>
) : (
    filteredCitations.map((citation) => (

<tr key={citation.id}>

    <td>{citation.id}</td>
    <td>{citation.paper_id}</td>
    <td>{citation.cited_paper_title}</td>
    <td>{citation.authors}</td>
    <td>{citation.publication_year}</td>
    <td>{citation.doi}</td>
    <td>{citation.citation_count}</td>

    <td>

        <button
            onClick={() => handleEditCitation(citation)}
            style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                marginRight: "10px",
                cursor: "pointer"
            }}
        >
            Edit
        </button>

        <button
            onClick={() => handleDeleteCitation(citation.id)}
            style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer"
            }}
        >
            Delete
        </button>

    </td>

</tr>

))
)
}

                </tbody>
                
            </table>
           {showForm && (

<div
style={{
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.7)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:1000
}}
>

<div
style={{
background:"#1d1d1d",
padding:"30px",
borderRadius:"12px",
width:"500px",
color:"white"
}}
>

<h2>

{isEditing ? "Edit Citation" : "Add Citation"}

</h2>

<input
type="number"
placeholder="Paper ID"
value={newCitation.paper_id}
onChange={(e)=>
setNewCitation({
...newCitation,
paper_id:Number(e.target.value)
})
}
style={inputStyle}
/>

<input
type="text"
placeholder="Citation Title"
value={newCitation.cited_paper_title}
onChange={(e)=>
setNewCitation({
...newCitation,
cited_paper_title:e.target.value
})
}
style={inputStyle}
/>

<input
type="text"
placeholder="Authors"
value={newCitation.authors}
onChange={(e)=>
setNewCitation({
...newCitation,
authors:e.target.value
})
}
style={inputStyle}
/>

<input
type="number"
placeholder="Publication Year"
value={newCitation.publication_year}
onChange={(e)=>
setNewCitation({
...newCitation,
publication_year:Number(e.target.value)
})
}
style={inputStyle}
/>

<input
type="text"
placeholder="DOI"
value={newCitation.doi}
onChange={(e)=>
setNewCitation({
...newCitation,
doi:e.target.value
})
}
style={inputStyle}
/>

<input
type="number"
placeholder="Citation Count"
value={newCitation.citation_count}
onChange={(e)=>
setNewCitation({
...newCitation,
citation_count:Number(e.target.value)
})
}
style={inputStyle}
/>

<div
style={{
display:"flex",
justifyContent:"flex-end",
gap:"10px"
}}
>

<button
style={cancelButton}
onClick={()=>setShowForm(false)}
>

Cancel

</button>

<button
style={saveButton}
onClick={handleSaveCitation}
>

Save

</button>

</div>

</div>

</div>

)}
        </DashboardLayout>
    );
}

export default Citations;
const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#111",
    color: "white",
    boxSizing: "border-box"
};

const saveButton = {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer"
};

const cancelButton = {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer"
};
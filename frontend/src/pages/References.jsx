import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    getReferences,
    createReference,
    updateReference,
    deleteReference
} from "../services/referenceService";

function References() {

    const [references, setReferences] = useState([]);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

const [isEditing, setIsEditing] = useState(false);

const [editingId, setEditingId] = useState(null);

const [newReference, setNewReference] = useState({
    paper_id: "",
    title: "",
    authors: "",
    publication_year: "",
    journal: "",
    doi: ""
});

    const loadReferences = async () => {
        try {
            const data = await getReferences();
            setReferences(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadReferences();
    }, []);

    const filteredReferences = references.filter((reference) =>
        reference.title.toLowerCase().includes(search.toLowerCase())
    );
const handleSaveReference = async () => {

    try {

        if (isEditing) {

            await updateReference(editingId, newReference);

            alert("Reference updated successfully!");

        } else {

            await createReference(newReference);

            alert("Reference added successfully!");

        }

        loadReferences();

        setShowForm(false);

        setIsEditing(false);

        setEditingId(null);

        setNewReference({
            paper_id: "",
            title: "",
            authors: "",
            publication_year: "",
            journal: "",
            doi: ""
        });

    } catch (error) {

        console.log(error);

        alert("Something went wrong!");

    }

};
const handleEditReference = (reference) => {

    setIsEditing(true);

    setEditingId(reference.id);

    setNewReference({
        paper_id: reference.paper_id,
        title: reference.title,
        authors: reference.authors,
        publication_year: reference.publication_year,
        journal: reference.journal,
        doi: reference.doi
    });

    setShowForm(true);

};
const handleDeleteReference = async (id) => {

    if (!window.confirm("Delete Reference?")) return;

    try {

        await deleteReference(id);

        alert("Reference deleted successfully!");

        loadReferences();

    } catch (error) {

        console.log(error);

        alert("Unable to delete reference!");

    }

};
    return (
        <DashboardLayout>

            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap"
    }}
>

    <h1 style={{ color: "white" }}>
        Reference Management
    </h1>

    <button
        onClick={() => {

            setIsEditing(false);

            setEditingId(null);

            setNewReference({
                paper_id: "",
                title: "",
                authors: "",
                publication_year: "",
                journal: "",
                doi: ""
            });

            setShowForm(true);

        }}
        style={{
            background: "#ff2d2d",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer"
        }}
    >
        + Add Reference
    </button>

</div>

            <input
                type="text"
                placeholder="Search Reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "320px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    background: "#1d1d1d",
                    color: "white",
                    marginBottom: "20px"
                }}
            />

            <table
    style={{
        width: "100%",
        borderCollapse: "collapse",
        color: "white",
        background: "#1a1a1a"
    }}
>

                <thead
    style={{
        background: "#c00000"
    }}
>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Paper ID</th>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Authors</th>
                        <th style={thStyle}>Year</th>
                        <th style={thStyle}>Journal</th>
                        <th style={thStyle}>DOI</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>

                <tbody>

                    {filteredReferences.length === 0 ? (

                        <tr>
                            <td
                                colSpan="8"
                                style={{
                                    textAlign: "center",
                                    padding: "20px"
                                }}
                            >
                                No References Found
                            </td>
                        </tr>

                    ) : (

                        filteredReferences.map((reference) => (

                            <tr key={reference.id}>
                                <td style={tdStyle}>{reference.id}</td>
                                <td style={tdStyle}>{reference.paper_id}</td>
                                <td style={tdStyle}>{reference.title}</td>
                                <td style={tdStyle}>{reference.authors}</td>
                                <td style={tdStyle}>{reference.publication_year}</td>
                                <td style={tdStyle}>{reference.journal}</td>
                                <td style={tdStyle}>{reference.doi}</td>
                                <td style={tdStyle}>

        <button
            onClick={() => handleEditReference(reference)}
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
            onClick={() => handleDeleteReference(reference.id)}
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

                    )}

                </tbody>

            </table>
{showForm && (
    <div
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}
    >
        <div
            style={{
                background: "#1f1f1f",
                padding: "30px",
                borderRadius: "12px",
                width: "500px"
            }}
        >
            <h2 style={{ color: "white", marginBottom: "20px" }}>
                {isEditing ? "Edit Reference" : "Add Reference"}
            </h2>

            <input
                type="number"
                placeholder="Paper ID"
                value={newReference.paper_id}
                onChange={(e) =>
                    setNewReference({
                        ...newReference,
                        paper_id: e.target.value
                    })
                }
                style={inputStyle}
            />

            <input
                type="text"
                placeholder="Title"
                value={newReference.title}
                onChange={(e) =>
                    setNewReference({
                        ...newReference,
                        title: e.target.value
                    })
                }
                style={inputStyle}
            />

            <input
                type="text"
                placeholder="Authors"
                value={newReference.authors}
                onChange={(e) =>
                    setNewReference({
                        ...newReference,
                        authors: e.target.value
                    })
                }
                style={inputStyle}
            />

            <input
                type="number"
                placeholder="Publication Year"
                value={newReference.publication_year}
                onChange={(e) =>
                    setNewReference({
                        ...newReference,
                        publication_year: e.target.value
                    })
                }
                style={inputStyle}
            />

            <input
                type="text"
                placeholder="Journal"
                value={newReference.journal}
                onChange={(e) =>
                    setNewReference({
                        ...newReference,
                        journal: e.target.value
                    })
                }
                style={inputStyle}
            />

            <input
                type="text"
                placeholder="DOI"
                value={newReference.doi}
                onChange={(e) =>
                    setNewReference({
                        ...newReference,
                        doi: e.target.value
                    })
                }
                style={inputStyle}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px"
                }}
            >
                <button
                    onClick={() => setShowForm(false)}
                    style={{
                        padding: "10px 18px"
                    }}
                >
                    Cancel
                </button>

                <button
                    onClick={handleSaveReference}
                    style={{
                        background: "#16a34a",
                        color: "white",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "6px"
                    }}
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
const thStyle = {
    padding: "18px",
    textAlign: "left",
    borderBottom: "1px solid #333",
    fontWeight: "600",
    color: "white"
};

const tdStyle = {
    padding: "18px",
    borderBottom: "1px solid #2d2d2d",
    color: "white"
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#2b2b2b",
    color: "white",
    outline: "none",
    boxSizing: "border-box"
};

export default References;

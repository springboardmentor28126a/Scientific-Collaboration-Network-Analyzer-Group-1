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


    // =========================
    // LOAD CITATIONS
    // =========================

    const loadCitations = async () => {

        try {

            const data = await getCitations();

            // Remove invalid / empty records
            const validData = Array.isArray(data)
                ? data.filter((citation) => citation && citation.id)
                : [];

            setCitations(validData);

        } catch (error) {

            console.error("Error loading citations:", error);
            setCitations([]);

        }

    };


    // =========================
    // SEARCH
    // =========================

    const filteredCitations = citations.filter((citation) => {

        const title = citation.cited_paper_title || "";

        return title
            .toLowerCase()
            .includes(search.toLowerCase());

    });


    // =========================
    // SAVE / UPDATE CITATION
    // =========================

    const handleSaveCitation = async () => {

        try {

            if (!newCitation.paper_id) {
                alert("Please enter Paper ID");
                return;
            }

            if (!newCitation.cited_paper_title) {
                alert("Please enter Citation Title");
                return;
            }


            if (isEditing) {

                await updateCitation(
                    editingId,
                    newCitation
                );

                alert("Citation updated successfully!");

            } else {

                await createCitation(newCitation);

                alert("Citation added successfully!");

            }


            await loadCitations();


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

            console.error("Citation save error:", error);

            alert(
                error?.response?.data?.detail ||
                "Failed to save citation"
            );

        }

    };


    // =========================
    // EDIT
    // =========================

    const handleEditCitation = (citation) => {

        setIsEditing(true);

        setEditingId(citation.id);

        setNewCitation({

            paper_id: citation.paper_id ?? "",

            cited_paper_title:
                citation.cited_paper_title ?? "",

            authors:
                citation.authors ?? "",

            publication_year:
                citation.publication_year ?? "",

            doi:
                citation.doi ?? "",

            citation_count:
                citation.citation_count ?? ""

        });

        setShowForm(true);

    };


    // =========================
    // DELETE
    // =========================

    const handleDeleteCitation = async (id) => {

        if (!window.confirm("Delete Citation?")) {
            return;
        }

        try {

            await deleteCitation(id);

            alert("Citation deleted successfully!");

            await loadCitations();

        } catch (error) {

            console.error("Delete citation error:", error);

            alert("Failed to delete citation");

        }

    };


    // =========================
    // OPEN ADD FORM
    // =========================

    const handleAddCitation = () => {

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

    };


    // =========================
    // LOAD ON PAGE OPEN
    // =========================

    useEffect(() => {

        loadCitations();

    }, []);


    return (

        <DashboardLayout>

            <div style={{ padding: "10px" }}>

                <h1
                    style={{
                        color: "white",
                        marginBottom: "20px"
                    }}
                >
                    Citation Management
                </h1>


                {/* SEARCH */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        marginBottom: "20px"
                    }}
                >

                    <input
                        type="text"
                        placeholder="Search Citation..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "320px",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #444",
                            background: "#1d1d1d",
                            color: "white"
                        }}
                    />


                    <button
                        onClick={handleAddCitation}
                        style={{
                            background: "#ff2d2d",
                            color: "white",
                            border: "none",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        + Add Citation
                    </button>


                    <button
                        onClick={loadCitations}
                        style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* TABLE */}

                <div
                    style={{
                        width: "100%",
                        overflowX: "auto"
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            background: "#181818",
                            color: "white"
                        }}
                    >

                        <thead>

                            <tr
                                style={{
                                    background: "#14213d"
                                }}
                            >

                                <th style={thStyle}>
                                    ID
                                </th>

                                <th style={thStyle}>
                                    Paper ID
                                </th>

                                <th style={thStyle}>
                                    Title
                                </th>

                                <th style={thStyle}>
                                    Authors
                                </th>

                                <th style={thStyle}>
                                    Year
                                </th>

                                <th style={thStyle}>
                                    DOI
                                </th>

                                <th style={thStyle}>
                                    Citation Count
                                </th>

                                <th style={thStyle}>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredCitations.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        style={{
                                            textAlign: "center",
                                            padding: "30px",
                                            color: "#aaa"
                                        }}
                                    >
                                        No Citations Found
                                    </td>

                                </tr>

                            ) : (

                                filteredCitations.map((citation) => (

                                    <tr
                                        key={citation.id}
                                        style={{
                                            borderBottom:
                                                "1px solid #333"
                                        }}
                                    >

                                        {/* ID */}

                                        <td style={tdStyle}>
                                            {citation.id}
                                        </td>


                                        {/* PAPER ID */}

                                        <td style={tdStyle}>
                                            {citation.paper_id ?? "-"}
                                        </td>


                                        {/* TITLE */}

                                        <td style={tdStyle}>
                                            {citation.cited_paper_title || "-"}
                                        </td>


                                        {/* AUTHORS */}

                                        <td style={tdStyle}>
                                            {citation.authors || "-"}
                                        </td>


                                        {/* YEAR */}

                                        <td style={tdStyle}>
                                            {citation.publication_year ?? "-"}
                                        </td>


                                        {/* DOI */}

                                        <td style={tdStyle}>
                                            {citation.doi || "-"}
                                        </td>


                                        {/* CITATION COUNT */}

                                        <td style={tdStyle}>
                                            {citation.citation_count ?? 0}
                                        </td>


                                        {/* ACTION */}

                                        <td style={tdStyle}>

                                            <button
                                                onClick={() =>
                                                    handleEditCitation(
                                                        citation
                                                    )
                                                }
                                                style={{
                                                    background: "#2563eb",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    marginRight: "8px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Edit
                                            </button>


                                            <button
                                                onClick={() =>
                                                    handleDeleteCitation(
                                                        citation.id
                                                    )
                                                }
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

                </div>


                {/* =========================
                    ADD / EDIT MODAL
                ========================= */}

                {showForm && (

                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                                "rgba(0,0,0,0.7)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000
                        }}
                    >

                        <div
                            style={{
                                background: "#1d1d1d",
                                padding: "30px",
                                borderRadius: "12px",
                                width: "500px",
                                maxWidth: "90%",
                                color: "white"
                            }}
                        >

                            <h2
                                style={{
                                    marginTop: 0,
                                    marginBottom: "20px"
                                }}
                            >
                                {isEditing
                                    ? "Edit Citation"
                                    : "Add Citation"}
                            </h2>


                            {/* PAPER ID */}

                            <input
                                type="number"
                                placeholder="Paper ID"
                                value={newCitation.paper_id}
                                onChange={(e) =>
                                    setNewCitation({
                                        ...newCitation,
                                        paper_id:
                                            e.target.value
                                                ? Number(
                                                    e.target.value
                                                )
                                                : ""
                                    })
                                }
                                style={inputStyle}
                            />


                            {/* TITLE */}

                            <input
                                type="text"
                                placeholder="Citation Title"
                                value={
                                    newCitation.cited_paper_title
                                }
                                onChange={(e) =>
                                    setNewCitation({
                                        ...newCitation,
                                        cited_paper_title:
                                            e.target.value
                                    })
                                }
                                style={inputStyle}
                            />


                            {/* AUTHORS */}

                            <input
                                type="text"
                                placeholder="Authors"
                                value={newCitation.authors}
                                onChange={(e) =>
                                    setNewCitation({
                                        ...newCitation,
                                        authors:
                                            e.target.value
                                    })
                                }
                                style={inputStyle}
                            />


                            {/* YEAR */}

                            <input
                                type="number"
                                placeholder="Publication Year"
                                value={
                                    newCitation.publication_year
                                }
                                onChange={(e) =>
                                    setNewCitation({
                                        ...newCitation,
                                        publication_year:
                                            e.target.value
                                                ? Number(
                                                    e.target.value
                                                )
                                                : ""
                                    })
                                }
                                style={inputStyle}
                            />


                            {/* DOI */}

                            <input
                                type="text"
                                placeholder="DOI"
                                value={newCitation.doi}
                                onChange={(e) =>
                                    setNewCitation({
                                        ...newCitation,
                                        doi: e.target.value
                                    })
                                }
                                style={inputStyle}
                            />


                            {/* CITATION COUNT */}

                            <input
                                type="number"
                                placeholder="Citation Count"
                                value={
                                    newCitation.citation_count
                                }
                                onChange={(e) =>
                                    setNewCitation({
                                        ...newCitation,
                                        citation_count:
                                            e.target.value
                                                ? Number(
                                                    e.target.value
                                                )
                                                : ""
                                    })
                                }
                                style={inputStyle}
                            />


                            {/* BUTTONS */}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-end",
                                    gap: "10px",
                                    marginTop: "10px"
                                }}
                            >

                                <button
                                    style={cancelButton}
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    style={saveButton}
                                    onClick={
                                        handleSaveCitation
                                    }
                                >
                                    {isEditing
                                        ? "Update"
                                        : "Save"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </DashboardLayout>

    );

}


export default Citations;


// =========================
// STYLES
// =========================

const thStyle = {
    padding: "12px",
    border: "1px solid #334155",
    textAlign: "left",
    color: "#60a5fa",
    fontSize: "14px"
};


const tdStyle = {
    padding: "12px",
    border: "1px solid #333",
    fontSize: "14px"
};


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
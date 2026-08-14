import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
    getCollaborations,
    createCollaboration,
    updateCollaboration,
    deleteCollaboration,
    acceptCollaboration,
    rejectCollaboration
} from "../services/institutionCollaborationService";

function InstitutionCollaborations() {

    const [collaborations, setCollaborations] = useState([]);
    const [showForm, setShowForm] = useState(false);

const [isEditing, setIsEditing] = useState(false);

const [editingId, setEditingId] = useState(null);

const [newCollaboration, setNewCollaboration] = useState({
    institution_a_id: "",
    institution_b_id: "",
    collaboration_type: "",
    status: ""
});
    const [search, setSearch] = useState("");

const filteredCollaborations = collaborations.filter((item) =>
    item.collaboration_type
        .toLowerCase()
        .includes(search.toLowerCase())
);
    const loadCollaborations = async () => {

        try {

            const data = await getCollaborations();

            setCollaborations(data);

        } catch (error) {

            console.log(error);

        }

    };const handleSave = async () => {

    try {

        if (isEditing) {

            await updateCollaboration(
                editingId,
                newCollaboration
            );

        } else {

            await createCollaboration(
                newCollaboration
            );

        }

        loadCollaborations();

        setShowForm(false);

        setIsEditing(false);

        setEditingId(null);

        setNewCollaboration({
            institution_a_id:"",
            institution_b_id:"",
            collaboration_type:"",
            status:""
        });

    } catch (error) {

        console.log(error);

    }

};

const handleEdit = (item) => {

    setEditingId(item.id);

    setIsEditing(true);

    setNewCollaboration(item);

    setShowForm(true);

};

const handleDelete = async(id)=>{

    if(!window.confirm("Delete Collaboration?")) return;

    await deleteCollaboration(id);

    loadCollaborations();

};

    useEffect(() => {

        loadCollaborations();

    }, []);

    return (

        <DashboardLayout>

            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px"
    }}
>

    <div>

        <h1 style={{ color: "white" }}>
            Institution Collaborations
        </h1>

        <p style={{ color: "#999" }}>
            Manage Institution Collaborations
        </p>

    </div>

    <input
        type="text"
        placeholder="Search Collaboration..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
            width: "300px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#1d1d1d",
            color: "white"
        }}
    />

    <button
    style={{
        background: "#ff2d2d",
        color: "white",
        border: "none",
        padding: "12px 20px",
        borderRadius: "8px",
        cursor: "pointer"
    }}
    onClick={() => {
        setShowForm(true);
        setIsEditing(false);
        setNewCollaboration({
            institution_a_id: "",
            institution_b_id: "",
            collaboration_type: "",
            status: ""
        });
    }}
>
    + Add Collaboration
</button>

</div>
<div
    style={{
        background: "#1a1a1a",
        borderRadius: "15px",
        overflow: "hidden",
        border: "1px solid #333"
    }}
>

<table
    style={{
        width: "100%",
        borderCollapse: "collapse",
        color: "white"
    }}
>

<thead style={{ background: "#202020" }}>

<tr>

<th style={thStyle}>Institution A</th>

<th style={thStyle}>Institution B</th>

<th style={thStyle}>Type</th>

<th style={thStyle}>Status</th>

<th style={thStyle}>Action</th>

</tr>

</thead>

<tbody>

{
filteredCollaborations.length===0 ?

(
<tr>

<td
colSpan="5"
style={{
textAlign:"center",
padding:"30px",
color:"#999"
}}
>
No Collaborations Found
</td>

</tr>
)

:

filteredCollaborations.map((item)=>(

<tr key={item.id}>

<td style={tdStyle}>
{item.institution_a_id}
</td>

<td style={tdStyle}>
{item.institution_b_id}
</td>

<td style={tdStyle}>
{item.collaboration_type}
</td>

<td style={tdStyle}>
{item.status}
</td>

<td style={tdStyle}>

    <button
        style={editButton}
        onClick={() => handleEdit(item)}
    >
        Edit
    </button>

    <button
        style={deleteButton}
        onClick={() => handleDelete(item.id)}
    >
        Delete
    </button>

</td>

</tr>

))

}

</tbody>

</table>

</div>
{showForm && (
    <div
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
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
                width: "450px"
            }}
        >
            <h2 style={{ color: "white", marginBottom: "20px" }}>
                {isEditing ? "Edit Collaboration" : "Add Collaboration"}
            </h2>

            <input
                type="number"
                placeholder="Institution A ID"
                value={newCollaboration.institution_a_id}
                onChange={(e) =>
                    setNewCollaboration({
                        ...newCollaboration,
                        institution_a_id: Number(e.target.value)
                    })
                }
                style={inputStyle}
            />

            <input
                type="number"
                placeholder="Institution B ID"
                value={newCollaboration.institution_b_id}
                onChange={(e) =>
                    setNewCollaboration({
                        ...newCollaboration,
                        institution_b_id: Number(e.target.value)
                    })
                }
                style={inputStyle}
            />

            <input
                type="text"
                placeholder="Collaboration Type"
                value={newCollaboration.collaboration_type}
                onChange={(e) =>
                    setNewCollaboration({
                        ...newCollaboration,
                        collaboration_type: e.target.value
                    })
                }
                style={inputStyle}
            />

           

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px"
                }}
            >
                <button
                    style={editButton}
                    onClick={handleSave}
                >
                    Save
                </button>

                <button
                    style={deleteButton}
                    onClick={() => {
                        setShowForm(false);
                        setIsEditing(false);
                    }}
                >
                    Cancel
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
    fontWeight: "600"
};

const tdStyle = {
    padding: "18px",
    borderBottom: "1px solid #2d2d2d"
};

const editButton = {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    marginRight: "10px",
    cursor: "pointer"
};

const deleteButton = {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer"
};
const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#2a2a2a",
    color: "white",
    boxSizing: "border-box"
};
export default InstitutionCollaborations;
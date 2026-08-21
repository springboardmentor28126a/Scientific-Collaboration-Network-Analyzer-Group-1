import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
} from "../services/projectAssignmentService";
function ProjectAssignments() {

    const [assignments, setAssignments] = useState([]);
    const [showForm, setShowForm] = useState(false);

const [isEditing, setIsEditing] = useState(false);

const [editingId, setEditingId] = useState(null);

const [newAssignment, setNewAssignment] = useState({
    project_id: "",
    researcher_id: "",
    role: ""
});
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const data = await getAssignments();
            setAssignments(data);
        } catch (error) {
            console.log(error);
        }
    };

    const filteredAssignments = assignments.filter((assignment) =>
        assignment.role.toLowerCase().includes(search.toLowerCase())
    );
    const handleSaveAssignment = async () => {

    try {

        if (isEditing) {

            await updateAssignment(
                editingId,
                newAssignment
            );

        } else {

            await createAssignment(
                newAssignment
            );

        }

        loadAssignments();

        setShowForm(false);

        setIsEditing(false);

        setEditingId(null);

        setNewAssignment({
            project_id: "",
            researcher_id: "",
            role: ""
        });

    } catch (error) {

    console.log(error);
    console.log(error.response);
    console.log(error.response?.data);

    alert(JSON.stringify(error.response?.data));

}

};

const handleEditAssignment = (assignment) => {

    setIsEditing(true);

    setEditingId(assignment.id);

    setNewAssignment({
        project_id: assignment.project_id,
        researcher_id: assignment.researcher_id,
        role: assignment.role
    });

    setShowForm(true);

};

const handleDeleteAssignment = async (id) => {

    if (!window.confirm("Delete Assignment?")) return;

    await deleteAssignment(id);

    loadAssignments();

};

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
                        Project Assignments
                    </h1>

                    <p style={{ color: "#999" }}>
                        Manage Project Assignments
                    </p>

                </div>

                <input
                    type="text"
                    placeholder="Search Role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
    onClick={() => {
        setIsEditing(false);
        setEditingId(null);
        setNewAssignment({
            project_id: "",
            researcher_id: "",
            role: ""
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
                    + Add Assignment
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

                    <thead
                        style={{
                            background: "#202020"
                        }}
                    >

                        <tr>

                            <th style={thStyle}>Project ID</th>

                            <th style={thStyle}>Researcher ID</th>

                            <th style={thStyle}>Role</th>

                            <th style={thStyle}>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredAssignments.length === 0 ?

                                (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            style={{
                                                textAlign: "center",
                                                padding: "30px",
                                                color: "#999"
                                            }}
                                        >

                                            No Assignments Found

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    filteredAssignments.map((assignment) => (

                                        <tr key={assignment.id}>

                                            <td style={tdStyle}>
                                                {assignment.project_id}
                                            </td>

                                            <td style={tdStyle}>
                                                {assignment.researcher_id}
                                            </td>

                                            <td style={tdStyle}>
                                                {assignment.role}
                                            </td>

                                            <td style={tdStyle}>

                                                <button
    style={editButton}
    onClick={() => handleEditAssignment(assignment)}
>
    Edit
</button>

                                                <button
    style={deleteButton}
    onClick={() => handleDeleteAssignment(assignment.id)}
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

            </div>
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
width:"450px",
color:"white"
}}
>

<h2>
{isEditing ? "Edit Assignment" : "Add Assignment"}
</h2>

<input
type="number"
placeholder="Project ID"
value={newAssignment.project_id}
onChange={(e)=>
setNewAssignment({
...newAssignment,
project_id:Number(e.target.value)
})
}
style={inputStyle}
/>

<input
type="number"
placeholder="Researcher ID"
value={newAssignment.researcher_id}
onChange={(e)=>
setNewAssignment({
...newAssignment,
researcher_id:Number(e.target.value)
})
}
style={inputStyle}
/>

<input
type="text"
placeholder="Role"
value={newAssignment.role}
onChange={(e)=>
setNewAssignment({
...newAssignment,
role:e.target.value
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
onClick={() => setShowForm(false)}
>
Cancel
</button>

<button
style={saveButton}
onClick={handleSaveAssignment}
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
    borderBottom: "1px solid #333"
};

const tdStyle = {
    padding: "18px",
    borderBottom: "1px solid #333"
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
export default ProjectAssignments;
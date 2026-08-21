import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam
} from "../services/teamService";

function Teams() {

    const [teams, setTeams] = useState([]);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
const [editingId, setEditingId] = useState(null);

const [newTeam, setNewTeam] = useState({
    team_name: "",
    team_leader: "",
    department: "",
    description: ""
});
    const filteredTeams = teams.filter((team) =>
    team.team_name.toLowerCase().includes(search.toLowerCase()) ||
    team.team_leader.toLowerCase().includes(search.toLowerCase()) ||
    team.department.toLowerCase().includes(search.toLowerCase())
);
    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            const data = await getTeams();
            setTeams(data);
        } catch (error) {
            console.log(error);
        }
    };
   const handleSaveTeam = async () => {

    try {

        if (isEditing) {

            await updateTeam(editingId, newTeam);

        } else {

            await createTeam(newTeam);

        }

        setShowForm(false);
        setIsEditing(false);
        setEditingId(null);

        setNewTeam({
            team_name: "",
            team_leader: "",
            department: "",
            description: ""
        });

        loadTeams();

    } catch (error) {

        console.log(error);

    }

};
const handleDeleteTeam = async (id) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this team?"
    );

    if (!confirmDelete) return;

    try {

        await deleteTeam(id);

        loadTeams();

    } catch (error) {

        console.log(error);

    }

};
const handleEditTeam = (team) => {

    setIsEditing(true);

    setEditingId(team.id);

    setNewTeam({
        team_name: team.team_name,
        team_leader: team.team_leader,
        department: team.department,
        description: team.description
    });

    setShowForm(true);

};

    return (

        <DashboardLayout>

            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        gap: "20px",
        flexWrap: "wrap"
    }}
>

                <div>
                    <h1 style={{ color: "white" }}>Team Management</h1>
                    <p style={{ color: "#999" }}>
                        Manage Research Teams
                    </p>
                </div>

                <button
    onClick={() => setShowForm(true)}
                    style={{
                        background: "#ff2d2d",
                        color: "white",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    <input
    type="text"
    placeholder="Search Team..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
        width: "320px",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #444",
        background: "#1d1d1d",
        color: "white",
        outline: "none"
    }}
/>
                    + Add Team
                </button>

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

<h2 style={{marginBottom:"20px"}}>
    {isEditing ? "Edit Team" : "Add Team"}
</h2>

<input
type="text"
placeholder="Team Name"
value={newTeam.team_name}
onChange={(e)=>
setNewTeam({
...newTeam,
team_name:e.target.value
})
}
style={inputStyle}
/>

<input
type="text"
placeholder="Team Leader"
value={newTeam.team_leader}
onChange={(e)=>
setNewTeam({
...newTeam,
team_leader:e.target.value
})
}
style={inputStyle}
/>

<input
type="text"
placeholder="Department"
value={newTeam.department}
onChange={(e)=>
setNewTeam({
...newTeam,
department:e.target.value
})
}
style={inputStyle}
/>

<textarea
placeholder="Description"
value={newTeam.description}
onChange={(e)=>
setNewTeam({
...newTeam,
description:e.target.value
})
}
style={{
...inputStyle,
height:"100px",
resize:"none"
}}
/>

<div
style={{
display:"flex",
justifyContent:"flex-end",
gap:"10px"
}}
>

<button
onClick={()=>setShowForm(false)}
style={cancelButton}
>
Cancel
</button>

<button
onClick={handleSaveTeam}
style={saveButton}
>
Save
</button>

</div>

</div>

</div>

)}
            <table
                style={{
                    width: "100%",
                    color: "white",
                    borderCollapse: "collapse"
                }}
            >

                <thead>

                    <tr>

                        <th style={thStyle}>Team</th>

                        <th style={thStyle}>Leader</th>

                        <th style={thStyle}>Department</th>

                        <th style={thStyle}>Description</th>

                        <th style={thStyle}>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {
                    filteredTeams.map((team) => (

                        <tr key={team.id}>

                            <td style={tdStyle}>
                                {team.team_name}
                            </td>

                            <td style={tdStyle}>
                                {team.team_leader}
                            </td>

                            <td style={tdStyle}>
                                {team.department}
                            </td>

                            <td style={tdStyle}>
                                {team.description}
                            </td>

                            <td style={tdStyle}>
                                <button
    style={editButton}
    onClick={() => handleEditTeam(team)}
>
    Edit
</button>
                                <button
    style={deleteButton}
    onClick={() => handleDeleteTeam(team.id)}
>
    Delete
</button>
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

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
width:"100%",
padding:"12px",
marginBottom:"15px",
borderRadius:"8px",
border:"1px solid #444",
background:"#111",
color:"white",
boxSizing:"border-box"
};

const saveButton = {
background:"#16a34a",
color:"white",
border:"none",
padding:"10px 18px",
borderRadius:"8px",
cursor:"pointer"
};

const cancelButton = {
background:"#dc2626",
color:"white",
border:"none",
padding:"10px 18px",
borderRadius:"8px",
cursor:"pointer"
};

export default Teams;
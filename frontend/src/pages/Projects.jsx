import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";

import { getProjects } from "../services/projectService";

function Projects() {

    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
);
    const loadProjects = async () => {

        try {

            const data = await getProjects();

            setProjects(data);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        loadProjects();

    }, []);

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

                    <h1 style={{ color: "white" }}>
                        Research Projects
                    </h1>

                    <p style={{ color: "#999" }}>
                        Manage Research Projects
                    </p>

                </div>
<input
    type="text"
    placeholder="Search Project..."
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
                <button
                    style={{
                        background: "#ff2d2d",
                        color: "white",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    + Add Project
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
    <th style={thStyle}>Project</th>
    <th style={thStyle}>Status</th>
    <th style={thStyle}>Budget</th>
    <th style={thStyle}>Start</th>
    <th style={thStyle}>End</th>
    <th style={thStyle}>Action</th>
</tr>

</thead>

<tbody>

{
projects.length === 0 ?

(
<tr>
    <td
        colSpan="6"
        style={{
            textAlign:"center",
            padding:"30px",
            color:"#999"
        }}
    >
        No Projects Found
    </td>
</tr>
)

:

(

filteredProjects.map((project) => (

<tr key={project.id}>

<td style={tdStyle}>
    {project.title}
</td>

<td style={tdStyle}>

<span
style={{
background:
project.status==="Active"
?"#16a34a"
:"#dc2626",

padding:"6px 12px",

borderRadius:"20px",

fontSize:"13px"
}}
>
{project.status}
</span>

</td>

<td style={tdStyle}>
₹ {project.budget}
</td>

<td style={tdStyle}>
{project.start_date}
</td>

<td style={tdStyle}>
{project.end_date}
</td>

<td style={tdStyle}>

<button style={editButton}>
    Edit
</button>

<button style={deleteButton}>
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

        </DashboardLayout>

    );

}

export default Projects;
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
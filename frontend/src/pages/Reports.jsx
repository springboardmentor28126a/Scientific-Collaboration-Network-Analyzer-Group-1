import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardLayout from "../components/DashboardLayout";
import {
    getResearchers,
    getPublications,
    getProjects,
    getTeams,
    getInstitutions,
    getCitations,
    getReferences,
} from "../services/reportService";

function Reports() {

    const [researchers, setResearchers] = useState([]);
    const [publications, setPublications] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [citations, setCitations] = useState([]);
    const [references, setReferences] = useState([]);

    const loadReports = async () => {
        try {
            setResearchers(await getResearchers());
            setPublications(await getPublications());
            setProjects(await getProjects());
            setTeams(await getTeams());
            setInstitutions(await getInstitutions());
            setCitations(await getCitations());
            setReferences(await getReferences());
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const exportExcel = () => {

    const data = publications.map((paper) => ({
        Title: paper.title,
        Authors: paper.authors,
        Year: paper.publication_year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Publications"
    );

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const file = new Blob(
        [excelBuffer],
        {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }
    );

    saveAs(file, "SCNA_Report.xlsx");
};
    const exportPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("Scientific Collaboration Network Analyzer", 14, 20);

    doc.setFontSize(12);

    doc.text("Reports Summary", 14, 30);

    autoTable(doc, {

        startY: 40,

        head: [["Module", "Count"]],

        body: [

            ["Researchers", researchers.length],

            ["Publications", publications.length],

            ["Projects", projects.length],

            ["Teams", teams.length],

            ["Institutions", institutions.length],

            ["Citations", citations.length],

            ["References", references.length]

        ]

    });

    doc.save("SCNA_Report.pdf");

};
const COLORS = [
    "#ff2d2d",
    "#ff6666",
    "#cc0000",
    "#990000",
    "#ff9900",
    "#00c853",
    "#2979ff"
];

const chartData = [
    { name: "Researchers", value: researchers.length },
    { name: "Publications", value: publications.length },
    { name: "Projects", value: projects.length },
    { name: "Teams", value: teams.length },
    { name: "Institutions", value: institutions.length },
    { name: "Citations", value: citations.length },
    { name: "References", value: references.length },
];
// Publications by Year
const publicationYearData = Object.values(
    publications.reduce((acc, paper) => {
        const year = paper.publication_year || "Unknown";

        if (!acc[year]) {
            acc[year] = {
                year: year,
                value: 0,
            };
        }

        acc[year].value++;

        return acc;
    }, {})
).sort((a, b) => String(a.year).localeCompare(String(b.year)));


// Researchers by Department
const departmentData = Object.values(
    researchers.reduce((acc, researcher) => {
        const department = researcher.department || "Unknown";

        if (!acc[department]) {
            acc[department] = {
                name: department,
                value: 0,
            };
        }

        acc[department].value++;

        return acc;
    }, {})
);


// Institutions by City
const cityData = Object.values(
    institutions.reduce((acc, institution) => {
        const city = institution.city || "Unknown";

        if (!acc[city]) {
            acc[city] = {
                name: city,
                value: 0,
            };
        }

        acc[city].value++;

        return acc;
    }, {})
);
    return (
        <DashboardLayout>

            <>
    <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap"
    }}
>

    <div>
        <h1
    style={{
        color: "white",
        margin: 0,
        fontSize: "36px",
        fontWeight: "700"
    }}
>
    📊 Reports Dashboard
</h1>

       <p
    style={{
        color: "#999",
        marginTop: "10px",
        fontSize: "18px"
    }}
>
    Research Analytics & Export Center
</p>
    </div>

    <div
        style={{
            display: "flex",
            gap: "12px"
        }}
    >

        <button
    className="actionBtn"
    onClick={exportPDF}
>
    📄 Export PDF
</button>

        <button
    className="actionBtn"
    onClick={exportExcel}
>
    📊 Export Excel
</button>

    </div>

</div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "35px"
        }}
    >

        <Card title="Researchers" value={researchers.length} />
        <Card title="Publications" value={publications.length} />
        <Card title="Projects" value={projects.length} />
        <Card title="Teams" value={teams.length} />
        <Card title="Institutions" value={institutions.length} />
        <Card title="Citations" value={citations.length} />
        <Card title="References" value={references.length} />

    </div>
</>
<div
    style={{
        display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "25px",
        marginBottom: "40px",
    }}
>
    {/* Publications Overview */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            📊 Publications Overview
        </h2>

        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />

                <Bar
                    dataKey="value"
                    fill="#ff2d2d"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>


    {/* Research Distribution */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            🔬 Research Distribution
        </h2>

        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    outerRadius={110}
                    label
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    </div>


    {/* Project Status */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            📁 Project Status
        </h2>

        <ResponsiveContainer width="100%" height={260}>
            <BarChart
                data={[
                    {
                        name: "Completed",
                        value: projects.length,
                    },
                    {
                        name: "Running",
                        value: teams.length,
                    },
                    {
                        name: "Pending",
                        value: institutions.length,
                    },
                ]}
            >
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />

                <Bar
                    dataKey="value"
                    fill="#00c853"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>


    {/* Citation Analysis */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            📈 Citation Analysis
        </h2>

        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={[
                        {
                            name: "Citations",
                            value: citations.length,
                        },
                        {
                            name: "References",
                            value: references.length,
                        },
                    ]}
                    dataKey="value"
                    outerRadius={80}
                    label
                >
                    <Cell fill="#ff2d2d" />
                    <Cell fill="#00c853" />
                </Pie>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    </div>


    {/* Publications by Year */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            📅 Publications by Year
        </h2>

        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={publicationYearData}>
                <XAxis dataKey="year" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />

                <Bar
                    dataKey="value"
                    fill="#ff2d2d"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>


    {/* Researchers by Department */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            👨‍🔬 Researchers by Department
        </h2>

        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentData}>
                <XAxis
                    dataKey="name"
                    stroke="#fff"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                />

                <YAxis stroke="#fff" />

                <Tooltip />

                <Bar
                    dataKey="value"
                    fill="#2979ff"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>


    {/* Institutions by City */}
    <div
        style={{
            background: "#1b1b1b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2f2f2f",
            gridColumn: "1 / -1",
            boxShadow: "0 0 15px rgba(255,0,0,0.08)",
        }}
    >
        <h2 style={{ color: "white" }}>
            🏫 Institutions by City
        </h2>

        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cityData}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />

                <Tooltip />

                <Bar
                    dataKey="value"
                    fill="#00c853"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>

</div>
<div
    style={{
        background: "#1b1b1b",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "30px"
    }}
>

    <h2 style={{ color: "white", marginBottom: "20px" }}>
        📄 Recent Publications
    </h2>

    <table
        style={{
            width: "100%",
            color: "white",
            borderCollapse: "collapse"
        }}
    >

        <thead>

            <tr style={{ background: "#c00000" }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Authors</th>
                <th style={thStyle}>Year</th>
            </tr>

        </thead>

        <tbody>

            {publications.slice(0,5).map((paper)=>(

                <tr key={paper.id}>

                    <td style={tdStyle}>{paper.title}</td>

                    <td style={tdStyle}>{paper.authors}</td>

                    <td style={tdStyle}>{paper.publication_year}</td>

                </tr>

            ))}

        </tbody>

    </table>

</div>
<div
    style={{
        background:"#1b1b1b",
        padding:"20px",
        borderRadius:"12px",
        marginBottom:"30px"
    }}
>

<h2
style={{
color:"white",
marginBottom:"20px"
}}
>
👨 Recent Researchers
</h2>

<table
style={{
width:"100%",
borderCollapse:"collapse",
color:"white"
}}
>

<thead>

<tr style={{background:"#c00000"}}>

<th style={thStyle}>Name</th>

<th style={thStyle}>Department</th>

<th style={thStyle}>Email</th>

</tr>

</thead>

<tbody>

{researchers.slice(0,5).map((r)=>(

<tr key={r.id}>

<td style={tdStyle}>{r.name}</td>

<td style={tdStyle}>{r.department}</td>

<td style={tdStyle}>{r.email}</td>

</tr>

))}

</tbody>

</table>

</div>
<div
    style={{
        background:"#1b1b1b",
        padding:"20px",
        borderRadius:"12px",
        marginBottom:"30px"
    }}
>

<h2
style={{
color:"white",
marginBottom:"20px"
}}
>
🏫 Top Institutions
</h2>

<table
style={{
width:"100%",
borderCollapse:"collapse",
color:"white"
}}
>

<thead>

<tr style={{background:"#c00000"}}>

<th style={thStyle}>Institution</th>

<th style={thStyle}>City</th>

<th style={thStyle}>Country</th>

</tr>

</thead>

<tbody>

{institutions.slice(0,5).map((inst)=>(

<tr key={inst.id}>

<td style={tdStyle}>{inst.name}</td>

<td style={tdStyle}>{inst.city}</td>

<td style={tdStyle}>{inst.country}</td>

</tr>

))}

</tbody>

</table>

</div>
<div
    style={{
        background: "#1b1b1b",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "30px"
    }}
>

<h2
style={{
color:"white",
marginBottom:"20px"
}}
>
🏆 Top Researchers
</h2>

<table
style={{
width:"100%",
borderCollapse:"collapse",
color:"white"
}}
>

<thead>

<tr style={{background:"#c00000"}}>

<th style={thStyle}>Name</th>

<th style={thStyle}>Department</th>

<th style={thStyle}>Email</th>

</tr>

</thead>

<tbody>

{researchers.slice(0,5).map((r)=>(

<tr key={r.id}>

<td style={tdStyle}>{r.name}</td>

<td style={tdStyle}>{r.department}</td>

<td style={tdStyle}>{r.email}</td>

</tr>

))}

</tbody>

</table>

</div>
        </DashboardLayout>
    );
}
const thStyle = {
    padding: "15px",
    color: "white",
    textAlign: "left",
    borderBottom: "1px solid #444"
};

const tdStyle = {
    padding: "15px",
    color: "white",
    borderBottom: "1px solid #333"
};
export default Reports;
function Card({ title, value }) {

    return (

        <div
            style={{
                background: "#1b1b1b",
                borderRadius: "12px",
                padding: "25px",
                color: "white",
                border: "1px solid #333",
                boxShadow: "0 0 12px rgba(255,0,0,0.15)"
            }}
        >

            <h3
                style={{
                    color: "#bbb",
                    marginBottom: "15px"
                }}
            >
                {title}
            </h3>

            <h1
                style={{
                    color: "#ff2d2d",
                    margin: 0
                }}
            >
                {value}
            </h1>

        </div>

    );

}

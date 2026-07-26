// ===========================================
// Collaboration Dashboard
// ===========================================

const dashboardURL = "/collaborations/dashboard";
const recentURL = "/collaborations/recent";
const networkURL = "/collaborations/network";


// ===========================================
// Dashboard Summary
// ===========================================

async function loadDashboard() {

    try {

        const response = await fetch(dashboardURL);

        const data = await response.json();

        document.getElementById("totalCollaborations").textContent =
            data.summary.total_collaborations;

        document.getElementById("connectedResearchers").textContent =
            data.summary.connected_researchers;

        document.getElementById("averageAuthors").textContent =
            data.summary.average_authors;

    }

    catch (error) {

        console.error("Dashboard Error:", error);

    }

}



// ===========================================
// Recent Collaborations Table
// ===========================================

async function loadRecentCollaborations() {

    try {

        const response = await fetch(recentURL);

        const data = await response.json();

        const table = document.getElementById(
            "recentCollaborationTable"
        );

        table.innerHTML = "";

        if (data.length === 0) {

            table.innerHTML = `
                <tr>

                    <td colspan="4"
                        class="text-center text-muted py-4">

                        No collaboration records found.

                    </td>

                </tr>
            `;

            return;

        }

        data.forEach(item => {

            table.innerHTML += `

                <tr>

                    <td>

                        ${item.publication}

                    </td>

                    <td>

                        ${item.researcher}

                    </td>

                    <td>

                        ${item.author_order ?? "-"}

                    </td>

                    <td>

                        ${item.contribution ?? "-"}

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}



// ===========================================
// Refresh Dashboard
// ===========================================

async function refreshDashboard() {

    await loadDashboard();

    await loadRecentCollaborations();

}
// ===========================================
// Add Collaboration
// ===========================================

const authorForm = document.getElementById("authorForm");

if (authorForm) {

    authorForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData(authorForm);

        const payload = {

            publication_id: Number(formData.get("publication_id")),

            researcher_id: Number(formData.get("researcher_id")),

            author_order: formData.get("author_order")
                ? Number(formData.get("author_order"))
                : null,

            contribution: formData.get("contribution") || null

        };

        try {

            const response = await fetch(
                "/collaborations/publication-authors",
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(payload)

                }
            );

            if (!response.ok) {

                throw new Error("Failed to save collaboration");

            }

            authorForm.reset();

            const modal =
                bootstrap.Modal.getInstance(
                    document.getElementById("addCollaborationModal")
                );

            modal.hide();

            await refreshDashboard();

            alert("Collaboration added successfully!");

        }

        catch (error) {

            console.error(error);

            alert("Unable to save collaboration.");

        }

    });

}



// ===========================================
// Project Form
// ===========================================

const projectForm = document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData(projectForm);

        const payload = {

            title: formData.get("title"),

            description: formData.get("description"),

            funding_agency: formData.get("funding_agency"),

            budget: formData.get("budget"),

            institution_name: formData.get("institution_name"),

            start_date: formData.get("start_date"),

            end_date: formData.get("end_date"),

            status: formData.get("status")

        };

        try {

            const response = await fetch("/projects/", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(payload)

            });

            if (!response.ok) {

                throw new Error("Project creation failed");

            }

            projectForm.reset();

            alert("Project added successfully!");

        }

        catch (error) {

            console.error(error);

            alert("Unable to add project.");

        }

    });

}



// ===========================================
// Conference Form
// ===========================================

const conferenceForm = document.getElementById("conferenceForm");

if (conferenceForm) {

    conferenceForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData(conferenceForm);

        const payload = {

            name: formData.get("name"),

            organizer: formData.get("organizer"),

            location: formData.get("location"),

            start_date: formData.get("start_date"),

            end_date: formData.get("end_date"),

            website: formData.get("website")

        };

        try {

            const response = await fetch("/conferences/", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(payload)

            });

            if (!response.ok) {

                throw new Error("Conference creation failed");

            }

            conferenceForm.reset();

            alert("Conference added successfully!");

        }

        catch (error) {

            console.error(error);

            alert("Unable to add conference.");

        }

    });

}
// ===========================================
// Cytoscape Collaboration Network
// ===========================================

let cy = null;

async function loadNetwork() {

    try {

        const response = await fetch("/collaborations/network");

        const graph = await response.json();

        if (cy) {

            cy.destroy();

        }

        cy = cytoscape({

            container: document.getElementById("networkGraph"),

            elements: [

                ...graph.nodes,

                ...graph.edges

            ],

            style: [

                {

                    selector: "node",

                    style: {

                        "background-color": "#198754",

                        "label": "data(label)",

                        "color": "#fff",

                        "text-valign": "center",

                        "text-halign": "center",

                        "font-size": "11px",

                        "width": 38,

                        "height": 38

                    }

                },

                {

                    selector: "edge",

                    style: {

                        "width": 2,

                        "line-color": "#9CA3AF",

                        "curve-style": "bezier",

                        "target-arrow-shape": "none"

                    }

                }

            ],

            layout: {

                name: "cose",

                animate: true,

                padding: 20

            }

        });

    }

    catch (error) {

        console.error("Network Error:", error);

    }

}



// ===========================================
// Refresh Everything
// ===========================================

async function refreshAll() {

    await loadDashboard();

    await loadRecentCollaborations();

    await loadNetwork();

}



// ===========================================
// Initial Page Load
// ===========================================

document.addEventListener("DOMContentLoaded", () => {

    refreshAll();

});
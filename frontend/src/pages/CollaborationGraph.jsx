import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

import DashboardLayout from "../components/DashboardLayout";
import { getCollaborations } from "../services/institutionCollaborationService";

function CollaborationGraph() {
    const [graphData, setGraphData] = useState({
        nodes: [],
        links: []
    });

    useEffect(() => {
        loadCollaborations();
    }, []);

    const loadCollaborations = async () => {
        try {
            const data = await getCollaborations();

            console.log("COLLABORATION GRAPH DATA:", data);

            const nodes = {};
            const links = [];
data
    .filter((item) => item.status === "Accepted")
    .forEach((item) => {

                const sourceId = String(item.institution_a_id);
                const targetId = String(item.institution_b_id);

                // Create source node
                nodes[sourceId] = {
                    id: sourceId,
                    label: `Institution ${sourceId}`
                };

                // Create target node
                nodes[targetId] = {
                    id: targetId,
                    label: `Institution ${targetId}`
                };

                // Create connection
                links.push({
                    source: sourceId,
                    target: targetId,
                    type: item.collaboration_type,
                    status: item.status
                });
            });

            setGraphData({
                nodes: Object.values(nodes),
                links: links
            });

            console.log("GRAPH NODES:", Object.values(nodes));
            console.log("GRAPH LINKS:", links);

        } catch (error) {
            console.error("Collaboration Graph Error:", error);
        }
    };

    return (
        <DashboardLayout>

            <h1
    style={{
        color: "white",
        marginBottom: "10px"
    }}
>
    Institution Collaboration Network
</h1>

<p style={{ color: "#aaa", marginBottom: "20px" }}>
    Showing active institution collaborations
</p>

            <div
                style={{
                    background: "#181818",
                    borderRadius: "20px",
                    height: "75vh",
                    overflow: "hidden"
                }}
            >

                <ForceGraph2D
                    graphData={graphData}
d3VelocityDecay={0.4}
d3AlphaDecay={0.015}
d3Force="charge"
d3ForceStrength={-600}
                    nodeLabel={(node) =>
                        node.label
                    }

                    nodeAutoColorBy="id"
                    linkColor={() => "#60a5fa"}
linkWidth={2}
linkDirectionalArrowLength={4}
linkDirectionalArrowRelPos={1}

                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.004}

                    linkLabel={(link) =>
                        `${link.type} - ${link.status}`
                    }

                    nodeCanvasObject={(node, ctx) => {

                        const label = node.label;

                        const fontSize = 14;

                        ctx.font = `${fontSize}px Sans-Serif`;

                        ctx.fillStyle = node.color || "#3498db";

                        ctx.beginPath();

                        ctx.arc(
    node.x,
    node.y,
    10,
    0,
    2 * Math.PI
);

                        ctx.fill();

                        ctx.fillStyle = "white";

                        ctx.fillText(
                            label,
                            node.x + 12,
                            node.y + 4
                        );
                    }}

                />

            </div>

        </DashboardLayout>
    );
}

export default CollaborationGraph;
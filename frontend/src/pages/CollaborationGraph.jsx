import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

import DashboardLayout from "../components/DashboardLayout";
import { getNetwork } from "../services/collaborationService";

function CollaborationGraph() {

    const [graphData, setGraphData] = useState({
        nodes: [],
        links: []
    });

    useEffect(() => {
        loadNetwork();
    }, []);

    const loadNetwork = async () => {

        const data = await getNetwork();

        const nodes = {};
        const links = [];

        data.forEach((item) => {

            nodes[item.source] = {
                id: item.source,
                ...item.source_details
            };

            nodes[item.target] = {
                id: item.target,
                ...item.target_details
            };

            links.push({
                source: item.source,
                target: item.target
            });

        });

        setGraphData({
            nodes: Object.values(nodes),
            links
        });

    };

    return (

        <DashboardLayout>

            <h1
                style={{
                    color: "white",
                    marginBottom: "20px"
                }}
            >
                Collaboration Network
            </h1>

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
                    nodeLabel={(node) => node.id}
                    nodeAutoColorBy="id"
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.004}
                    nodeCanvasObject={(node, ctx) => {

                        const label = node.id;

                        const fontSize = 14;

                        ctx.font = `${fontSize}px Sans-Serif`;

                        ctx.fillStyle = node.color;

                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI);
                        ctx.fill();

                        ctx.fillStyle = "white";

                        ctx.fillText(
                            label,
                            node.x + 10,
                            node.y + 4
                        );

                    }}
                />

            </div>

        </DashboardLayout>

    );

}

export default CollaborationGraph;
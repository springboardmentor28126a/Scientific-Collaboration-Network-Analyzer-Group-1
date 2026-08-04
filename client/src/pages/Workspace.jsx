import "./Workspace.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Workspace() {

    const { id } = useParams();
    const [members, setMembers] = useState([]);
    const navigate = useNavigate();

useEffect(() => {

    loadWorkspace();

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const loadWorkspace = async () => {

    try{

        const response = await api.get(

            `/collaboration/workspace/${id}`

        );

        setMembers(response.data.members);

    }

    catch(error){

        console.log(error);

    }

};

    return (

        <div className="workspace-container">

            <div className="workspace-header">

                <div
    style={{
        background: "var(--surface)",
        padding:"20px",
        borderRadius:"15px",
        marginBottom:"30px",
        border:"1px solid var(--border)",
        color:"var(--text)"
    }}
>

    <h2 style={{ color: "var(--text)" }}>Members</h2>

    {

        members.map((member)=>(

            <p key={member.id} style={{ color: "var(--muted)" }}>

                👤 {member.name}

            </p>

        ))

    }

</div>

                <h1>Research Collaboration Workspace</h1>

                <p style={{ color: "var(--muted)" }}>Workspace ID : {id}</p>

            </div>

            <div className="workspace-grid">


                <div

    className="workspace-card"

    onClick={() =>

        navigate(`/chat/${id}`)

    }

>

    <h2 style={{ color: "var(--text)" }}>

        💬 Chat

    </h2>

    <p style={{ color: "var(--muted)" }}>

        Start discussing research.

    </p>

</div>


                <div className="workspace-card">
                    <h2 style={{ color: "var(--text)" }}>📁 Shared Files</h2>
                    <p style={{ color: "var(--muted)" }}>Upload datasets and documents.</p>
                </div>

                <div className="workspace-card">
                    <h2 style={{ color: "var(--text)" }}>📄 Publications</h2>
                    <p style={{ color: "var(--muted)" }}>Manage research papers.</p>
                </div>

                <div className="workspace-card">
                    <h2 style={{ color: "var(--text)" }}>📅 Meetings</h2>
                    <p style={{ color: "var(--muted)" }}>Schedule research meetings.</p>
                </div>


            </div>

        </div>

    );

}

export default Workspace;

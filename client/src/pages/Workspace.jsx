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
        background:"white",
        padding:"20px",
        borderRadius:"15px",
        marginBottom:"30px"
    }}
>

    <h2>Members</h2>

    {

        members.map((member)=>(

            <p key={member.id}>

                👤 {member.name}

            </p>

        ))

    }

</div>

                <h1>Research Collaboration Workspace</h1>

                <p>Workspace ID : {id}</p>

            </div>

            <div className="workspace-grid">

                <div

    className="workspace-card"

    onClick={() =>

        navigate(`/chat/${id}`)

    }

>

    <h2>

        💬 Chat

    </h2>

    <p>

        Start discussing research.

    </p>

</div>

                <div className="workspace-card">
                    <h2>📁 Shared Files</h2>
                    <p>Upload datasets and documents.</p>
                </div>

                <div className="workspace-card">
                    <h2>📄 Publications</h2>
                    <p>Manage research papers.</p>
                </div>

                <div className="workspace-card">
                    <h2>📅 Meetings</h2>
                    <p>Schedule research meetings.</p>
                </div>

            </div>

        </div>

    );

}

export default Workspace;
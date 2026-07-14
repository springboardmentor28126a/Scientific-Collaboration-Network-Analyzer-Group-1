import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Collaborations() {
    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [collaborations, setCollaborations] = useState([]);

    useEffect(() => {

        loadCollaborations();

    }, []);

    const loadCollaborations = async () => {

        try {

            const response = await api.get(
                `/collaboration/list/${user.id}`
            );

            setCollaborations(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div>

            <h1>

                My Collaborations

            </h1>

            {

                collaborations.length === 0 ?

                (

                    <h3>

                        No Collaborations Yet

                    </h3>

                )

                :

                collaborations.map((person) => (

                    <div
                        key={person.id}
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            boxShadow: "0 2px 10px rgba(0,0,0,.1)"
                        }}
                    >

                        <h2>

                            {person.name}

                        </h2>

                        <p>

                            🏫 {person.institution}

                        </p>

                        <p>

                            💻 {person.department}

                        </p>

                        <p>

                            🔬 {person.research_interest}

                        </p>
<button

    onClick={() =>

        navigate(

            `/workspace/${person.id}`

        )

    }

>

    Open Workspace

</button>

                    </div>

                ))

            }

        </div>

    );

}

export default Collaborations;
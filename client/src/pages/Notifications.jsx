import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Notifications() {

    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [requests, setRequests] = useState([]);

    useEffect(() => {

        loadRequests();

    }, []);

    const loadRequests = async () => {

        const response = await api.get(

            `/collaboration/received/${user.id}`

        );

        setRequests(response.data);

    };

    const accept = async (id) => {

        await api.put(

            `/collaboration/accept/${id}`

        );

        loadRequests();

    };

    const reject = async (id) => {

        await api.put(

            `/collaboration/reject/${id}`

        );

        loadRequests();

    };

    return (

        <div>

            <h1>

                Notifications

            </h1>

            {

                requests.length === 0 ?

                (

                    <h3>

                        No Requests

                    </h3>

                )

                :

                requests.map((request) => (

                    <div

                        key={request.id}

                        style={{

                            background: "white",

                            padding: "20px",

                            borderRadius: "10px",

                            marginBottom: "15px"

                        }}

                    >

                        <h3>

    👤 {request.sender_name}

</h3>

                       <p>

    🏫 {request.institution || "Institution not added"}

</p>

<p>

    💻 {request.department || "Department not added"}

</p>

<p>

    🔬 {request.research_interest || "Research interests not added"}

</p>

<p>

    wants to collaborate with you.

</p> 

                        <p>

                            Status :
                            {" "}
                            {request.status}

                        </p>

                        {

                            request.status === "Pending" && (

                                <>
<button

    onClick={() =>

        navigate(`/researcher/${request.sender_id}`)

    }

>

    View Profile

</button>
                                    <button

                                        onClick={() =>

                                            accept(request.id)

                                        }

                                    >

                                        Accept

                                    </button>

                                    <button

                                        onClick={() =>

                                            reject(request.id)

                                        }

                                        style={{

                                            marginLeft: "10px"

                                        }}

                                    >

                                        Reject

                                    </button>

                                </>

                            )

                        }

                    </div>

                ))

            }

        </div>

    );

}

export default Notifications;
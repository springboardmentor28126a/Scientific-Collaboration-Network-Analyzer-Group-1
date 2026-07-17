import { useNavigate } from "react-router-dom";
import api from "../services/api";
function ResearcherCard({ researcher }) {

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const sendRequest = async () => {

    try {

        await api.post("/collaboration/send", {

            sender_id: user.id,

            receiver_id: researcher.id,

            message: "Let's collaborate."

        });

        alert("✅ Collaboration Request Sent");

    }

    catch (err) {

        if (err.response) {

            alert(err.response.data.detail);

        }

        else {

            alert("Server Error");

        }

    }

};
    return (

        <div
            style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "15px",
                padding: "25px",
                boxShadow: "0 5px 18px rgba(0,0,0,.08)",
                transition: ".3s"
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px"
                }}
            >

                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "25px",
                        fontWeight: "bold"
                    }}
                >

                    {researcher.name?.charAt(0).toUpperCase()}

                </div>

                <div>

                    <h3
                        style={{
                            margin: 0
                        }}
                    >
                        {researcher.name}
                    </h3>

                    <small>{researcher.role}</small>

                </div>

            </div>

            <hr />

            <p>🏫 {researcher.institution || "Not Added"}</p>

            <p>💻 {researcher.department || "Not Added"}</p>

            <p>🔬 {researcher.research_interest || "Not Added"}</p>

            <p>🌍 {researcher.country || "Not Added"}</p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px"
                }}
            >

                <button
    onClick={() =>
        navigate(`/researcher/${researcher.id}`)
    }
>

    View Profile

</button>

                <button
    onClick={sendRequest}
>

    Connect

</button>

            </div>

        </div>

    );

}

export default ResearcherCard;
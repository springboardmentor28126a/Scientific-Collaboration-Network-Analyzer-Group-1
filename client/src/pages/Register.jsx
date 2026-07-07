import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Researcher"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {

        try {

            const response = await api.post("/auth/register", formData);

            alert(response.data.message);

            navigate("/");

        } catch (error) {

            if (error.response) {
                alert(error.response.data.detail);
            } else {
                alert("Server Error");
            }

        }

    };

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f5f5f5"
            }}
        >

            <div
                style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "10px",
                    width: "350px",
                    boxShadow: "0 0 10px gray"
                }}
            >

                <h2>Create Account</h2>

                <input
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="role"
                    onChange={handleChange}
                >

                    <option>Researcher</option>

                    <option>Institution Admin</option>

                    <option>Reviewer</option>

                    <option>System Admin</option>

                </select>

                <br /><br />

                <button onClick={handleSubmit}>

                    Register

                </button>

            </div>

        </div>

    );

}

export default Register;
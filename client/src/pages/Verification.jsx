import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Verification() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [file, setFile] = useState(null);

    const [documentType, setDocumentType] = useState("");

    useEffect(() => {

        // System Admin does not need verification
        if (user?.role === "System Admin") {

            navigate("/dashboard");

        }

    }, [navigate, user]);

    const uploadDocument = async () => {

        if (!documentType) {

            alert("Please select a document type.");

            return;

        }

        if (!file) {

            alert("Please select a document.");

            return;

        }

        const formData = new FormData();

        formData.append("role", user.role);

        formData.append("document_type", documentType);

        formData.append("file", file);

        try {

            await API.post(

                "/verification/upload",

                formData,

                {

                    headers: {

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            alert("Verification document uploaded successfully.");

            navigate("/verification-pending");

        }

        catch (err) {

            console.log(err);

            alert(

                err.response?.data?.detail ||

                "Upload failed."

            );

        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h1>Identity Verification</h1>

            <p>

                Please upload a valid document to verify your account.

            </p>

            <br />

            <select

                value={documentType}

                onChange={(e) =>

                    setDocumentType(e.target.value)

                }

            >

                <option value="">

                    Select Document Type

                </option>

                <option value="Researcher ID">

                    Researcher ID

                </option>

                <option value="Faculty ID">

                    Faculty ID

                </option>

                <option value="Student ID">

                    Student ID

                </option>

                <option value="Reviewer Certificate">

                    Reviewer Certificate

                </option>

            </select>

            <br />

            <br />

            <input

                type="file"

                accept=".pdf,.jpg,.jpeg,.png"

                onChange={(e) =>

                    setFile(e.target.files[0])

                }

            />

            <br />

            <br />

            <button

                onClick={uploadDocument}

            >

                Upload Verification Document

            </button>

        </div>

    );

}
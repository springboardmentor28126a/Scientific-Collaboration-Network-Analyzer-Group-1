import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function VerificationPending() {

    const navigate = useNavigate();
    const [verification, setVerification] = useState(null);

    useEffect(() => {

        const checkStatus = async () => {

            try {

                const response = await API.get(
                    "/verification/status"
                );

                const status = response.data.status;
                setVerification(response.data);

                // Approved
                if (status === "Approved") {

                    const user = JSON.parse(
                        localStorage.getItem("user")
                    );

                    user.is_verified = true;
                    user.verification_status = "Approved";

                    localStorage.setItem(
                        "user",
                        JSON.stringify(user)
                    );

                    alert(
                        "🎉 Your account has been verified."
                    );

                    navigate("/dashboard");

                }

                // Rejected
                else if (status === "Rejected") {

                    const user = JSON.parse(
                        localStorage.getItem("user")
                    );

                    user.is_verified = false;
                    user.verification_status = "Rejected";

                    localStorage.setItem(
                        "user",
                        JSON.stringify(user)
                    );

                    alert(
                        "❌ Your verification was rejected."
                    );

                    // Keep the reason visible so the user can decide when to
                    // upload a replacement document.

                }

                // A stale user record may say Pending even though no
                // verification document exists. Send that user to upload.
                else if (status === "Not Submitted") {

                    const user = JSON.parse(
                        localStorage.getItem("user") || "null"
                    );

                    if (user) {
                        user.is_verified = false;
                        user.verification_status = "Not Submitted";
                        localStorage.setItem(
                            "user",
                            JSON.stringify(user)
                        );
                    }

                    navigate("/verification");

                }

            }

            catch (err) {

                console.log(err);

            }

        };

        // Check immediately
        checkStatus();

        // Check every 5 seconds
        const interval = setInterval(
            checkStatus,
            5000
        );

        return () => clearInterval(interval);

    }, [navigate]);

    return (

        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                textAlign: "center",
                padding: "40px",
                background: "#f5f7fb"
            }}
        >

            <div
                style={{
                    background: "#fff",
                    padding: "40px",
                    borderRadius: "15px",
                    boxShadow: "0 4px 15px rgba(0,0,0,.15)",
                    maxWidth: "650px"
                }}
            >

                    <h1>{verification?.status === "Rejected" ? "🔴 Verification Rejected" : "🟡 Verification Pending"}</h1>

                <p
                    style={{
                        fontSize: "18px",
                        marginTop: "20px"
                    }}
                >
                    {verification?.status === "Rejected" ? "Your verification document was rejected." : "Your verification document has been submitted successfully."}
                </p>

                <p
                    style={{
                        color: "#666",
                        marginTop: "15px",
                        lineHeight: "28px"
                    }}
                >
                    {verification?.status === "Rejected" ? `Reason: ${verification.remarks || "No reason provided."}` : "Please wait while the appropriate authority reviews your submitted document."}
                </p>

                <br />

                <div
                    style={{
                        fontSize: "60px"
                    }}
                >
                    ⏳
                </div>

                <p
                    style={{
                        color: "#999"
                    }}
                >
                    {verification?.status === "Rejected" ? <button type="button" onClick={() => navigate("/verification")}>Upload New Document</button> : "This page automatically checks your verification status every 5 seconds."}
                </p>

            </div>

        </div>

    );

}

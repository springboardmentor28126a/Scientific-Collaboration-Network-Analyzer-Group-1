import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function VerificationPending() {

    const navigate = useNavigate();

    useEffect(() => {

        const checkStatus = async () => {

            try {

                const response = await API.get(
                    "/verification/status"
                );

                const status = response.data.status;

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

                <h1>🟡 Verification Pending</h1>

                <p
                    style={{
                        fontSize: "18px",
                        marginTop: "20px"
                    }}
                >
                    Your verification document has been submitted successfully.
                </p>

                <p
                    style={{
                        color: "#666",
                        marginTop: "15px",
                        lineHeight: "28px"
                    }}
                >
                    Please wait while the appropriate authority reviews
                    your submitted document.
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
                    This page automatically checks your verification
                    status every 5 seconds.
                </p>

            </div>

        </div>

    );

}
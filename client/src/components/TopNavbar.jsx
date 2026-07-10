import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TopNavbar() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef();
    useEffect(() => {

    const handler = (event) => {

        if (
            menuRef.current &&
            !menuRef.current.contains(event.target)
        ) {

            setShowMenu(false);

        }

    };

    document.addEventListener("mousedown", handler);

    return () => {

        document.removeEventListener(
            "mousedown",
            handler
        );

    };

}, []);
    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 30px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,.08)",
                marginBottom: "25px",
                position: "relative"
            }}
        >

            <h2
                style={{
                    margin: 0,
                    color: "#2563eb"
                }}
            >
                Scientific Collaboration Network Analyzer
            </h2>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                }}
            >

                <div
    style={{
        position: "relative",
        cursor: "pointer"
    }}
>

    <span
        style={{
            fontSize: "23px"
        }}
    >
        🔔
    </span>

    <div
        style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "red",
            color: "white",
            fontSize: "11px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        3
    </div>

</div>

               <div
    ref={menuRef}
    style={{
        position: "relative"
    }}
>

                   <div
    onClick={() => setShowMenu(!showMenu)}
    style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer"
    }}
>

    <div
        style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            background: "#2563eb",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "20px"
        }}
    >

        {user?.name?.charAt(0).toUpperCase()}

    </div>

    <div>

        <b>{user?.name}</b>

        <br />

        <small>{user?.role}</small>

    </div>

</div>

                    {

                        showMenu && (

                            <div

                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: 60,
                                    background: "white",
                                    width: "220px",
                                    borderRadius: "12px",
                                    boxShadow: "0 5px 20px rgba(0,0,0,.15)",
                                    overflow: "hidden",
                                    zIndex: 999
                                }}

                            >

                                <div
                                    style={{
                                        padding: "20px",
                                        borderBottom: "1px solid #eee"
                                    }}
                                >

                                    <b>{user?.name}</b>

                                    <br />

                                    <small>{user?.email}</small>

                                </div>

                                <div
                                    onClick={() => navigate("/profile")}
                                    style={itemStyle}
                                >
                                    👤 My Profile
                                </div>

                                <div
                                    onClick={() => navigate("/settings")}
                                    style={itemStyle}
                                >
                                    ⚙ Settings
                                </div>

                                <div
                                    onClick={logout}
                                    style={itemStyle}
                                >
                                    🚪 Logout
                                </div>

                            </div>

                        )

                    }

                </div>

            </div>

        </div>

    );

}

const itemStyle = {

    padding: "15px",

    cursor: "pointer",

    borderBottom: "1px solid #eee"

};


export default TopNavbar;
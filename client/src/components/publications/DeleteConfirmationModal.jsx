function DeleteConfirmationModal({

    publication,

    onClose,

    onDelete

}) {

    if (!publication) return null;

    return (

        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >

            <div
                style={{
                    width: "500px",
                    background: "white",
                    padding: "30px",
                    borderRadius: "15px",
                    textAlign: "center",
                    boxShadow: "0 8px 25px rgba(0,0,0,.2)"
                }}
            >

                <h2 style={{ color: "#ef4444" }}>

                    ⚠ Delete Publication

                </h2>

                <hr />

                <h3>

                    {publication.title}

                </h3>

                <p>

                    Are you sure you want to delete this publication?

                </p>

                <p
                    style={{
                        color: "#ef4444",
                        fontWeight: "bold"
                    }}
                >

                    This action cannot be undone.

                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginTop: "30px"
                    }}
                >

                    <button

                        onClick={onClose}

                        style={{
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}

                    >

                        Cancel

                    </button>

                    <button

                        onClick={() =>

                            onDelete(publication.id)

                        }

                        style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}

                    >

                        Delete

                    </button>

                </div>

            </div>

        </div>

    );

}

export default DeleteConfirmationModal;
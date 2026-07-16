function PublicationDetailsModal({ publication, onClose }) {

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
                zIndex: 999,
            }}
        >

            <div
                style={{
                    width: "700px",
                    background: "white",
                    borderRadius: "15px",
                    padding: "30px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 25px rgba(0,0,0,.2)",
                }}
            >

                <h1
                    style={{
                        color: "#2563eb",
                        marginBottom: "20px",
                    }}
                >
                    📄 {publication.title}
                </h1>

                <hr />

                <p>
                    <b>👨‍🔬 Authors:</b> {publication.authors}
                </p>

                <p>
                    <b>📑 Publication Type:</b>{" "}
                    {publication.publication_type}
                </p>

                <p>
                    <b>📚 Journal:</b>{" "}
                    {publication.journal || "N/A"}
                </p>

                <p>
                    <b>📅 Publication Year:</b>{" "}
                    {publication.publication_year}
                </p>

                <p>
                    <b>🔗 DOI:</b>{" "}
                    {publication.doi || "N/A"}
                </p>

                <p>
                    <b>🏷 Keywords:</b>{" "}
                    {publication.keywords || "N/A"}
                </p>

                <p>
                    <b>📖 Abstract:</b>
                </p>

                <div
                    style={{
                        background: "#f8f9fa",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                    }}
                >
                    {publication.abstract || "No Abstract Available"}
                </div>

                {

                    publication.pdf_file && (

                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginBottom: "20px",
                            }}
                        >

                            <a
                                href={publication.pdf_file}
                                target="_blank"
                                rel="noreferrer"
                            >

                                📄 View PDF

                            </a>

                            <a
                                href={publication.pdf_file}
                                download
                            >

                                ⬇ Download PDF

                            </a>

                        </div>

                    )

                }

                <button

                    onClick={onClose}

                    style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}

                >

                    Close

                </button>

            </div>

        </div>

    );

}

export default PublicationDetailsModal;
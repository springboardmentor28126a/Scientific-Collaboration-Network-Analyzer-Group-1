import { API_BASE_URL } from "../../services/api";

function PublicationDetailsModal({ publication, onClose }) {

    if (!publication) return null;

    const pdfUrl = publication.pdf_file
        ? publication.pdf_file.startsWith("http")
            ? publication.pdf_file
            : `${API_BASE_URL}${publication.pdf_file}`
        : "";

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
                    background: "var(--surface-alt)",
                    color: "var(--text)",
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
                    {publication.title}
                </h1>

                <hr />

                <p>
                    <b>Authors:</b> {publication.authors}
                </p>

                <p>
                    <b>Publication Type:</b>{" "}
                    {publication.publication_type}
                </p>

                <p>
                    <b>Journal:</b>{" "}
                    {publication.journal || "N/A"}
                </p>

                <p>
                    <b>Publication Year:</b>{" "}
                    {publication.publication_year}
                </p>

                <p>
                    <b>DOI:</b>{" "}
                    <span style={{ color: "var(--text)" }}>{publication.doi || "N/A"}</span>
                </p>

                <p>
                    <b>Keywords:</b>{" "}
                    <span style={{ color: "var(--text)" }}>{publication.keywords || "N/A"}</span>
                </p>

                <p>
                    <b>Abstract:</b>
                </p>

                <div
                    style={{
                        background: "var(--surface-alt)",
                        color: "var(--text)",
                        padding: "15px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        marginBottom: "20px",
                    }}
                >
                    {publication.abstract || "No Abstract Available"}
                </div>

                {

                    pdfUrl && (

                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginBottom: "20px",
                            }}
                        >

                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                            >

                                View PDF

                            </a>

                            <a
                                href={pdfUrl}
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
                        background: "var(--danger)",
                        color: "var(--on-danger)",
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

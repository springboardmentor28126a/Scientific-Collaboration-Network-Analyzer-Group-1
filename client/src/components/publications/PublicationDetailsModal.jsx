import { API_BASE_URL } from "../../services/api";
import useDismissibleLayer from "../../hooks/useDismissibleLayer";
import PublicationReferences from "./PublicationReferences";

function PublicationDetailsModal({ publication, onClose }) {

    const modalRef = useDismissibleLayer(onClose, Boolean(publication));

    if (!publication) return null;

    const pdfUrl = publication.pdf_file
        ? publication.pdf_file.startsWith("http")
            ? publication.pdf_file
            : `${API_BASE_URL}${publication.pdf_file}`
        : "";

    return (

        <div className="modal-backdrop">

            <div
                ref={modalRef}
                className="modal-panel surface-card"
            >

                <span className="page-kicker">Publication record</span>
                <h1 style={{ marginTop: "8px" }}>
                    {publication.title}
                </h1>

                <hr />

                <div className="metadata-grid">
                    <div className="metadata-item"><span>Authors</span><strong>{publication.authors || "N/A"}</strong></div>
                    <div className="metadata-item"><span>Type</span><strong>{publication.publication_type || "N/A"}</strong></div>
                    <div className="metadata-item"><span>Journal</span><strong>{publication.journal || "N/A"}</strong></div>
                    <div className="metadata-item"><span>Year</span><strong>{publication.publication_year || "N/A"}</strong></div>
                    <div className="metadata-item"><span>DOI</span><strong>{publication.doi || "N/A"}</strong></div>
                    <div className="metadata-item"><span>Keywords</span><strong>{publication.keywords || "N/A"}</strong></div>
                </div>

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

                <PublicationReferences publicationId={publication.id} />

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

                <button className="button-danger" onClick={onClose}>

                    Close

                </button>

            </div>

        </div>

    );

}

export default PublicationDetailsModal;

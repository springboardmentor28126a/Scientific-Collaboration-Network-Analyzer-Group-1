import { useEffect, useState } from "react";
import API from "../../services/api";
import useDismissibleLayer from "../../hooks/useDismissibleLayer";
import ReferenceSelector from "./ReferenceSelector";

function EditPublicationModal({

    publication,

    onClose,

    onSave

}) {

    const [form, setForm] = useState(publication);
    const [publications, setPublications] = useState([]);
    const [selectedCitations, setSelectedCitations] = useState([]);
    const modalRef = useDismissibleLayer(onClose, Boolean(publication));

    useEffect(() => {

        if (publication) {

            setForm(publication);

            loadPublications();

            loadCitations(publication.id);

        }

    }, [publication]);
    const loadPublications = async () => {

        try {

            const response = await API.get("/publications/");

            setPublications(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const loadCitations = async (publicationId) => {

        try {

            const response = await API.get(`/citation/${publicationId}`);

            setSelectedCitations(
                response.data.map(citation => citation.cited_publication_id)
            );

        }

        catch (error) {

            console.log(error);

        }

    };

    if (!publication) return null;

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    return (

        <div
            className="edit-modal-backdrop"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(2, 8, 23, .76)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1100,
                padding: "16px",
                overflowY: "auto",
                backdropFilter: "blur(8px)"
            }}
        >

            <div
                ref={modalRef}
                className="edit-modal"
                style={{
                    width: "min(700px, 100%)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    padding: "clamp(20px, 4vw, 30px)",
                    borderRadius: "var(--radius-lg)",
                    maxHeight: "calc(100vh - 32px)",
                    overflowY: "auto",
                    boxShadow: "var(--shadow)"
                }}
            >

                <h2>

                    ✏ Edit Publication

                </h2>

                <hr />

                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="authors"
                    value={form.authors}
                    onChange={handleChange}
                    placeholder="Authors"
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="journal"
                    value={form.journal}
                    onChange={handleChange}
                    placeholder="Journal"
                    style={inputStyle}
                />

                <input
                    type="number"
                    name="publication_year"
                    value={form.publication_year}
                    onChange={handleChange}
                    placeholder="Year"
                    style={inputStyle}
                />

                <input
                    type="text"
                    name="doi"
                    value={form.doi}
                    onChange={handleChange}
                    placeholder="DOI"
                    style={inputStyle}
                />

                <textarea
                    name="abstract"
                    value={form.abstract || ""}
                    onChange={handleChange}
                    placeholder="Abstract"
                    rows="5"
                    style={{
                        ...inputStyle,
                        resize: "vertical"
                    }}
                />

                <p style={{ marginTop: "12px", color: "var(--muted)" }}>
                    Status is managed automatically by the review workflow.
                </p>
                <ReferenceSelector
                    publications={publications}
                    selectedIds={selectedCitations}
                    onChange={setSelectedCitations}
                    excludeId={form.id}
                    helperText="Update the existing references connected to this publication."
                />

                <div
                        className="edit-modal-actions"
                        style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <button
                        onClick={onClose}
                        className="button-danger"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() =>
                            onSave({
                                ...form,
                                citations: selectedCitations
                            })
                        }
                        className="button-success"
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>

    );

}

const inputStyle = {

    width: "100%",

    padding: "12px",

    marginTop: "12px",

    borderRadius: "8px",

    border: "1px solid #ddd"

};

export default EditPublicationModal;

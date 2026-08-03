import { useEffect, useState } from "react";
import API from "../../services/api";

function EditPublicationModal({

    publication,

    onClose,

    onSave

}) {

    const [form, setForm] = useState(publication);
    const [publications, setPublications] = useState([]);
    const [selectedCitations, setSelectedCitations] = useState([]);

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
                    width: "700px",
                    background: "rgba(255,255,255,0.06)",
                    padding: "30px",
                    borderRadius: "15px",
                    maxHeight: "90vh",
                    overflowY: "auto"
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

                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={inputStyle}
                >

                    <option>Draft</option>

                    <option>Submitted</option>

                    <option>Published</option>

                    <option>Archived</option>

                </select>
                <label style={{ marginTop: "15px", display: "block" }}>
                    References (Citations)
                </label>

                <select
                    multiple
                    value={selectedCitations}
                    onChange={(e) => {
                        const values = [...e.target.selectedOptions].map(option =>
                            Number(option.value)
                        );

                        console.log("Selected:", values);

                        setSelectedCitations(values);
                    }}
                    style={{
                        width: "100%",
                        height: "120px",
                        marginTop: "10px",
                        borderRadius: "8px",
                        background: "white",
                        color: "black"
                    }}
                >
                    {publications
                        .filter(pub => pub.id !== form.id)
                        .map((pub) => (
                            <option key={pub.id} value={pub.id}>
                                {pub.title}
                            </option>
                        ))}
                </select>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "20px"
                    }}
                >

                    <button
                        onClick={onClose}
                        style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "8px"
                        }}
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
                        style={{
                            background: "#22c55e",
                            color: "white",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "8px"
                        }}
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
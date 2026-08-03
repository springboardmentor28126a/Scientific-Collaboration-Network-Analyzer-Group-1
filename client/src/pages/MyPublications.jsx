import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { FaTrash } from "react-icons/fa";
import PublicationCard from "../components/publications/PublicationCard";
import PublicationDetailsModal from "../components/publications/PublicationDetailsModal";
import EditPublicationModal from "../components/publications/EditPublicationModal";
import DeleteConfirmationModal from "../components/publications/DeleteConfirmationModal";
import { createCitation } from "../services/citationService";
function Publications() {
    const [publications, setPublications] = useState([]);
    const [searchTitle, setSearchTitle] = useState("");
    const [sortOption, setSortOption] = useState("Title (A-Z)");
    const [selectedFile, setSelectedFile] = useState(null);
    const [customType, setCustomType] = useState("");
    const fileInputRef = useRef(null);
    const [selectedPublication, setSelectedPublication] = useState(null);
    const [editingPublication, setEditingPublication] = useState(null);
    const [deletePublicationData, setDeletePublicationData] = useState(null);
    const [institutions, setInstitutions] = useState([]);
    const [conferences, setConferences] = useState([]);
    const [selectedCitations, setSelectedCitations] = useState([]);
    const [showReferences, setShowReferences] = useState(false);
    const [form, setForm] = useState({
        id: null,
        title: "",
        authors: "",
        journal: "",
        publication_year: "",
        doi: "",
        keywords: "",
        abstract: "",
        pdf_file: "",
        status: "Draft",
        researcher_id: null,
        institution_id: null,
        conference_id: null
    });

    useEffect(() => {
        loadPublications();
        loadInstitutions();
        loadConferences();
    }, []);

    const loadPublications = async () => {
        try {
            const response = await API.get("/publications/");
            setPublications(response.data);
        } catch (error) {
            console.log(error);
        }
    };
    const loadInstitutions = async () => {

        try {

            const response = await API.get(

                "/institution/"

            );

            setInstitutions(

                response.data

            );

        }

        catch (error) {

            console.log(error);

        }

    };
    const loadConferences = async () => {

        try {

            const response = await API.get(
                "/conference/"
            );

            setConferences(
                response.data
            );

        }

        catch (error) {

            console.log(error);

        }

    };

    const searchPublication = async () => {
        try {
            if (searchTitle.trim() === "") {
                loadPublications();
                return;
            }

            const response = await API.get(
                `/publications/search/${searchTitle}`
            );

            setPublications(response.data);
        } catch (error) {
            alert("No publications found");
        }
    };

    const sortedPublications = [...publications].sort((a, b) => {
        const yearA = a.publication_year || 0;
        const yearB = b.publication_year || 0;
        const updatedA = a.uploaded_at ? new Date(a.uploaded_at) : new Date(0);
        const updatedB = b.uploaded_at ? new Date(b.uploaded_at) : new Date(0);

        switch (sortOption) {
            case "Title (Z-A)":
                return b.title?.localeCompare(a.title || "") || 0;
            case "Year (Newest)":
                return yearB - yearA;
            case "Year (Oldest)":
                return yearA - yearB;
            case "Last Modified (Newest)":
                return updatedB - updatedA;
            case "Last Modified (Oldest)":
                return updatedA - updatedB;
            default:
                return a.title?.localeCompare(b.title || "") || 0;
        }
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };
    const uploadPDF = async () => {

        if (!selectedFile) return "";

        const data = new FormData();

        data.append("file", selectedFile);

        try {

            const response = await API.post(

                "/publications/upload",

                data,

                {

                    headers: {

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            return response.data.pdf_url;

        }

        catch (error) {

            console.log(error);

            alert("PDF Upload Failed");

            return "";

        }

    };

    const addPublication = async () => {

        try {

            const pdfURL = await uploadPDF();

            const publicationData = {

                ...form,

                publication_type:

                    form.publication_type === "Others"
                        ? customType
                        : form.publication_type,

                pdf_file: pdfURL

            };

            const response = await API.post(
                "/publications/",
                publicationData
            );
            console.log("Added publication response:", response.data);

            const newPublication = response.data.publication;
            alert("Publication Added Successfully");
            console.log("Selected citations:", selectedCitations);
            console.log("New publication id:", newPublication.id);
            for (const citedId of selectedCitations) {
                await createCitation({
                    citing_publication_id: newPublication.id,
                    cited_publication_id: citedId,
                });
            }



            loadPublications();

            setForm({

                id: null,

                title: "",

                authors: "",

                journal: "",

                publication_type: "Journal Article",

                publication_year: "",

                doi: "",

                keywords: "",

                status: "Draft",

                researcher_id: null,
                institution_id: null,

                conference_id: null
            });

            setCustomType("");

            setSelectedCitations([]);

            setSelectedFile(null);

            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

        }

        catch (error) {

            console.log(error);

        }

    };
    const updatePublication = async () => {

        try {

            let pdfURL = form.pdf_file;

            if (selectedFile) {

                pdfURL = await uploadPDF();

            }

            const publicationData = {

                ...form,

                publication_type:

                    form.publication_type === "Others"

                        ? customType

                        : form.publication_type,

                pdf_file: pdfURL

            };

            await API.put(

                `/publications/${form.id}`,

                publicationData

            );

            alert("Publication Updated Successfully");

            loadPublications();

            setForm({

                id: null,

                title: "",

                authors: "",

                journal: "",

                publication_type: "Journal Article",

                publication_year: "",

                doi: "",

                keywords: "",

                abstract: "",

                pdf_file: "",

                status: "Draft",

                researcher_id: null

            });

            setCustomType("");

            setSelectedFile(null);

            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

        }

        catch (error) {

            console.log(error);

        }

    };


    const deletePublication = async (id) => {

        try {

            await API.delete(

                `/publications/${id}`

            );

            alert(

                "Publication Deleted Successfully"

            );

            loadPublications();

            setDeletePublicationData(null);

        }

        catch (error) {

            console.log(error);

        }

    };
    const searchPublications = async () => {

        try {

            const params = {};

            switch (filterType) {

                case "Title":

                    params.title = filterValue;

                    break;

                case "Author":

                    params.author = filterValue;

                    break;

                case "Journal":

                    params.journal = filterValue;

                    break;

                case "Publication Type":

                    params.publication_type = filterValue;

                    break;

                case "Keyword":

                    params.keyword = filterValue;

                    break;

                case "Year":

                    params.year = filterValue;

                    break;

                case "Status":

                    params.status = filterValue;

                    break;

                case "DOI":

                    params.doi = filterValue;

                    break;

                default:

                    break;

            }

            const response = await API.get(

                "/publications/search",

                {

                    params

                }

            );

            setPublications(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };
    const editPublication = (publication) => {
        console.log("Edit clicked", publication);

        setForm({

            id: publication.id,

            title: publication.title,

            authors: publication.authors,

            journal: publication.journal,

            publication_type:
                publication.publication_type || "Journal Article",

            publication_year: publication.publication_year,

            doi: publication.doi,

            keywords: publication.keywords,

            abstract: publication.abstract || "",

            pdf_file: publication.pdf_file || "",

            status: publication.status,

            researcher_id: publication.researcher_id

        });

        if (
            publication.publication_type &&
            ![
                "Journal Article",
                "Conference Paper",
                "Book Chapter",
                "Thesis",
                "Patent",
                "Technical Report"
            ].includes(publication.publication_type)
        ) {

            setForm((prev) => ({
                ...prev,
                publication_type: "Others"
            }));

            setCustomType(publication.publication_type);

        } else {

            setCustomType("");

        }

    };
    const statsCard = {

        background: "rgba(255,255,255,0.06)",

        padding: "25px",

        borderRadius: "15px",

        textAlign: "center",

        boxShadow: "0 18px 60px rgba(0,0,0,0.18)"

    };
    const loadPublication = async (id) => {

        try {

            const response = await API.get(

                `/publications/${id}`

            );

            setSelectedPublication(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };
    const savePublication = async (updatedPublication) => {

        try {

            const { citations, ...publicationData } = updatedPublication;

            await API.put(
                `/publications/${updatedPublication.id}`,
                publicationData
            );
            // Get existing citations
            const oldCitations = await API.get(
                `/citation/${updatedPublication.id}`
            );


            // Delete old citations
            // Delete old citations
            await Promise.all(
                oldCitations.data.map((citation) =>
                    API.delete(`/citation/${citation.id}`)
                )
            );

            // Create new citations
            await Promise.all(
                (citations || []).map((citedId) =>
                    API.post("/citation/", {
                        citing_publication_id: updatedPublication.id,
                        cited_publication_id: citedId,
                    })
                )
            );

            alert("Publication Updated Successfully");

            loadPublications();

            setEditingPublication(null);



        }

        catch (error) {

            console.log(error);

        }

    };
    return (
        <div style={{ padding: "30px" }}>

            <h1>Scientific Collaboration Network Analyzer</h1>

            <h2>Publication Management</h2>

            {/* Search */}

            <div style={{ marginBottom: "20px" }}>

                <input
                    type="text"
                    placeholder="Search by Title"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                />

                <button
                    onClick={searchPublication}
                    style={{ marginLeft: "10px" }}
                >
                    Search
                </button>

                <button
                    onClick={loadPublications}
                    style={{ marginLeft: "10px" }}
                >
                    Show All
                </button>

                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ marginLeft: "10px", padding: "10px", borderRadius: "8px" }}
                >
                    <option>Title (A-Z)</option>
                    <option>Title (Z-A)</option>
                    <option>Year (Newest)</option>
                    <option>Year (Oldest)</option>
                    <option>Last Modified (Newest)</option>
                    <option>Last Modified (Oldest)</option>
                </select>

            </div>

            {/* Add Publication */}

            <div style={{ marginBottom: "20px" }}>

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="authors"
                    placeholder="Authors"
                    value={form.authors}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="journal"
                    placeholder="Journal"
                    value={form.journal}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="publication_year"
                    placeholder="Year"
                    value={form.publication_year}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="doi"
                    placeholder="DOI"
                    value={form.doi}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="keywords"
                    placeholder="Keywords"
                    value={form.keywords}
                    onChange={handleChange}
                />
                <textarea

                    name="abstract"

                    placeholder="Research Abstract"

                    value={form.abstract}

                    onChange={handleChange}

                    rows={4}

                    style={{

                        width: "100%",

                        marginTop: "10px"

                    }}

                />
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px",
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />

                    {selectedFile && (
                        <>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null);

                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }} style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "35px",
                                    height: "35px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FaTrash />
                            </button>
                        </>
                    )}
                </div>
                <select
                    name="publication_type"
                    value={form.publication_type}
                    onChange={handleChange}
                >

                    <option>Journal Article</option>

                    <option>Conference Paper</option>

                    <option>Book Chapter</option>

                    <option>Thesis</option>

                    <option>Patent</option>

                    <option>Technical Report</option>

                    <option>Others</option>

                </select>
                {
                    form.publication_type === "Others" && (

                        <input

                            type="text"

                            placeholder="Enter Publication Type"

                            value={customType}

                            onChange={(e) =>

                                setCustomType(e.target.value)

                            }

                        />

                    )
                }

                <label>

                    Institution

                </label>
                <label>

                    Conference

                </label>

                <select

                    name="conference_id"

                    value={form.conference_id || ""}

                    onChange={handleChange}

                >

                    <option value="">

                        Select Conference

                    </option>

                    {

                        conferences.map((conference) => (

                            <option

                                key={conference.id}

                                value={conference.id}

                            >

                                {conference.name}

                            </option>

                        ))

                    }

                </select>

                <div style={{ marginTop: "15px" }}>

                    <button
                        type="button"
                        onClick={() => setShowReferences(!showReferences)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            padding: "5px 0"
                        }}
                    >
                        References (Citations) {showReferences ? "−" : "+"}
                    </button>

                    {showReferences && (
                        <div
                            style={{
                                marginTop: "10px",
                                padding: "12px",
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.05)",
                                maxHeight: "150px",
                                overflowY: "auto"
                            }}
                        >
                            {publications.map((pub) => (
                                <label
                                    key={pub.id}
                                    style={{
                                        display: "block",
                                        margin: "8px 0"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCitations.includes(pub.id)}
                                        onChange={(e) => {
                                            const id = pub.id;

                                            if (e.target.checked) {
                                                setSelectedCitations([
                                                    ...selectedCitations,
                                                    id
                                                ]);
                                            } else {
                                                setSelectedCitations(
                                                    selectedCitations.filter(
                                                        (x) => x !== id
                                                    )
                                                );
                                            }
                                        }}
                                    />

                                    {" "}
                                    {pub.title}
                                </label>
                            ))}
                        </div>
                    )}

                </div>
                <select
                    name="institution_id"
                    value={form.institution_id || ""}
                    onChange={handleChange}
                >

                    <option value="">

                        Select Institution

                    </option>

                    {

                        institutions.map((institution) => (

                            <option
                                key={institution.id}
                                value={institution.id}
                            >

                                {institution.name}

                            </option>

                        ))

                    }

                </select>



                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                >
                    <option>Draft</option>
                    <option>Submitted</option>
                    <option>Published</option>
                    <option>Archived</option>
                </select>

                <button

                    onClick={

                        form.id

                            ? updatePublication

                            : addPublication

                    }

                >

                    {

                        form.id

                            ? "Update Publication"

                            : "Add Publication"

                    }

                </button>

            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "20px",
                    marginBottom: "30px",
                }}
            >
                <div style={statsCard}>
                    <h3>📚 Total</h3>
                    <h1>{publications.length}</h1>
                </div>

                <div style={statsCard}>
                    <h3>🟢 Published</h3>
                    <h1>
                        {
                            publications.filter(
                                (p) => p.status === "Published"
                            ).length
                        }
                    </h1>
                </div>

                <div style={statsCard}>
                    <h3>🟡 Draft</h3>
                    <h1>
                        {
                            publications.filter(
                                (p) => p.status === "Draft"
                            ).length
                        }
                    </h1>
                </div>

                <div style={statsCard}>
                    <h3>🔵 Submitted</h3>
                    <h1>
                        {
                            publications.filter(
                                (p) => p.status === "Submitted"
                            ).length
                        }
                    </h1>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "20px",
                    marginTop: "30px",
                }}
            >
                {sortedPublications.map((publication) => (

                    <div
                        key={publication.id}
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: "15px",
                            padding: "20px",
                            boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
                        }}
                    >

                        <h2 style={{ color: "#2563eb" }}>
                            📄 {publication.title}
                        </h2>

                        <p>
                            <b>👨‍🔬 Authors:</b> {publication.authors}
                        </p>

                        <p>
                            <b>📑 Publication Type:</b>{" "}
                            {publication.publication_type}
                        </p>

                        <p>
                            <b>📚 Journal:</b> {publication.journal}
                        </p>

                        <p>
                            <b>📅 Year:</b> {publication.publication_year}
                        </p>

                        <p>
                            <b>Status:</b>{" "}
                            <span
                                style={{
                                    color:
                                        publication.status === "Published"
                                            ? "green"
                                            : publication.status === "Draft"
                                                ? "orange"
                                                : "blue",
                                    fontWeight: "bold",
                                }}
                            >
                                {publication.status}
                            </span>
                        </p>

                        <p>
                            <b>🔗 DOI:</b>{" "}
                            {publication.doi || "N/A"}
                        </p>

                        <p>
                            <b>🏷 Keywords:</b>{" "}
                            {publication.keywords || "N/A"}
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "20px",
                            }}
                        >

                            <button
                                onClick={() =>
                                    loadPublication(publication.id)
                                }
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                👁 View
                            </button>

                            <button
                                onClick={() =>
                                    setEditingPublication(publication)
                                }
                                style={{
                                    background: "#22c55e",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                ✏ Edit
                            </button>

                            <button
                                onClick={() =>

                                    setDeletePublicationData(

                                        publication

                                    )

                                }
                                style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                🗑 Delete
                            </button>

                        </div>

                    </div>

                ))}
            </div>
            {
                selectedPublication && (

                    <PublicationDetailsModal

                        publication={selectedPublication}

                        onClose={() =>

                            setSelectedPublication(null)

                        }

                    />

                )
            }
            {
                editingPublication && (

                    <EditPublicationModal

                        publication={editingPublication}

                        onClose={() =>

                            setEditingPublication(null)

                        }

                        onSave={savePublication}

                    />

                )
            }
            {

                deletePublicationData && (

                    <DeleteConfirmationModal

                        publication={deletePublicationData}

                        onClose={() =>

                            setDeletePublicationData(null)

                        }

                        onDelete={deletePublication}

                    />

                )

            }
        </div>
    );
}


export default Publications;

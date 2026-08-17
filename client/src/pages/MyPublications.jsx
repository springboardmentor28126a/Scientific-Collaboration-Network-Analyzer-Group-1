import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { FaExternalLinkAlt, FaQuoteRight, FaTrash } from "react-icons/fa";
import EditPublicationModal from "../components/publications/EditPublicationModal";
import DeleteConfirmationModal from "../components/publications/DeleteConfirmationModal";
import { createCitation, formatCitation } from "../services/citationService";
import CitationModal from "../components/CitationModal";
import useDismissibleLayer from "../hooks/useDismissibleLayer";
import { getAuthUser } from "../utils/authStorage";
function Publications() {
  const currentUser = getAuthUser();
  const navigate = useNavigate();
  const canCreatePublication = ["Researcher", "System Admin"].includes(currentUser?.role);
  const [searchParams] = useSearchParams();
  const [publications, setPublications] = useState([]);
  const [publicationTotal, setPublicationTotal] = useState(0);
  const [searchTitle, setSearchTitle] = useState("");
  const [sortOption, setSortOption] = useState("Title (A-Z)");
  const [publicationPage, setPublicationPage] = useState(1);
  const publicationPageSize = 6;
  const [viewMode, setViewMode] = useState("card");
  const [selectedFile, setSelectedFile] = useState(null);
  const [customType, setCustomType] = useState("");
  const fileInputRef = useRef(null);
  const [citationTarget, setCitationTarget] = useState(null);
  const [citationText, setCitationText] = useState("");
  const [citationStyle, setCitationStyle] = useState("APA");
  const [citationLoading, setCitationLoading] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [deletePublicationData, setDeletePublicationData] = useState(null);
  const [selectedCitations, setSelectedCitations] = useState([]);
  const [showReferences, setShowReferences] = useState(false);
  const [filterType] = useState("Title");
  const [filterValue] = useState("");
  const [institutions,setInstitutions]=useState([]);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [showInstitutionOptions, setShowInstitutionOptions] = useState(false);
  const institutionOptionsRef = useDismissibleLayer(
    () => setShowInstitutionOptions(false),
    showInstitutionOptions,
  );
  const [conferences, setConferences] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [form, setForm] = useState({
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
    researcher_id: null,
    institution_id: null,
    conference_id: null,
    selected_reviewer_id: null
  });

  useEffect(() => {
    loadPublications(publicationPage);
    loadInstitutions();
    loadConferences();
    loadReviewers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationPage]);

  useEffect(() => {
    setPublicationPage(1);
  }, [searchTitle, sortOption]);

    const loadPublications = async (page = 1) => {
        try {
            const response = await API.get("/publications/", { params: { page, page_size: publicationPageSize } });
            setPublications(response.data.items || []);
            setPublicationTotal(response.data.total || 0);
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
            alert(error.response?.data?.detail || "You are not allowed to delete this publication.");
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

    const loadReviewers = async () => {
        try {
            setReviewerLoading(true);
            const response = await API.get("/reviewer/available");
            setReviewers(
                (response.data || []).filter(
                    (reviewer) => reviewer.id !== currentUser?.id
                )
            );
        } catch (error) {
            console.log(error);
            setReviewers([]);
        } finally {
            setReviewerLoading(false);
        }
    };

    const searchPublication = async () => {
        try {
            if (searchTitle.trim() === "") {
                loadPublications();
                return;
            }

            const response = await API.get("/publications/search", {
                params: { q: searchTitle },
            });

            setPublications(response.data || []);
            setPublicationTotal(response.data?.length || 0);
        } catch {
            alert("No publications found");
        }
    };

    const sortedPublications = [...publications].sort((a, b) => {
        const isRelated = (publication) => publication.researcher_id === currentUser?.id
            || publication.selected_reviewer_id === currentUser?.id
            || publication.reviewed_by === currentUser?.id
            || publication.authors?.toLowerCase().includes(currentUser?.name?.toLowerCase() || "\u0000");
        const priorityDifference = Number(isRelated(b)) - Number(isRelated(a));
        if (priorityDifference) return priorityDifference;
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
    const publicationPageCount = Math.max(1, Math.ceil(publicationTotal / publicationPageSize));
    const paginatedPublications = sortedPublications;

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

        if (!canCreatePublication) {
            alert("Only Researchers can create publications.");
            return;
        }

        const missingFields = [];
        if (!form.title.trim()) missingFields.push("Title");
        if (!form.authors.trim()) missingFields.push("Authors");
        if (!form.journal.trim()) missingFields.push("Journal");
        if (!form.publication_year) missingFields.push("Publication year");
        if (!form.keywords.trim()) missingFields.push("Keywords");
        if (!form.selected_reviewer_id) missingFields.push("Reviewer");
        if (missingFields.length) {
            alert(`Please fill the required fields: ${missingFields.join(", ")}.`);
            return;
        }

        try {

            const pdfURL = await uploadPDF();

            const publicationData = {

                ...form,

                institution_id: form.institution_id ? Number(form.institution_id) : null,

                conference_id: form.conference_id ? Number(form.conference_id) : null,

                selected_reviewer_id: form.selected_reviewer_id
                    ? Number(form.selected_reviewer_id)
                    : null,

                doi: form.doi.trim() || null,

                publication_year: Number(form.publication_year),

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
            alert(
                publicationData.selected_reviewer_id
                    ? "Your publication was sent to the selected reviewer."
                    : "Publication added successfully."
            );
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

                conference_id: null,

                selected_reviewer_id: null
        });

            setInstitutionQuery("");
            setShowInstitutionOptions(false);

            setCustomType("");

            setSelectedCitations([]);

            setSelectedFile(null);

            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }

        }

        catch (error) {

            alert(error.response?.data?.detail || "Could not add publication. Please check the required fields.");

        }

    };
    const updatePublication = async () => {

        if (!canCreatePublication) {
            alert("Only Researchers can update publications.");
            return;
        }

        try {

            let pdfURL = form.pdf_file;

            if (selectedFile) {

                pdfURL = await uploadPDF();

            }

            const publicationData = {

                ...form,

                institution_id: form.institution_id ? Number(form.institution_id) : null,

                conference_id: form.conference_id ? Number(form.conference_id) : null,

                selected_reviewer_id: form.selected_reviewer_id
                    ? Number(form.selected_reviewer_id)
                    : null,

                doi: form.doi.trim() || null,

                publication_year: Number(form.publication_year),

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

            alert(error.response?.data?.detail || "You are not allowed to delete this publication.");

        }

    };
    /* Legacy filter handler retained for compatibility with the old form. */
    // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
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
    const loadPublication = (id) => navigate('/publication/' + id);

    useEffect(() => {
        const publicationId = searchParams.get("publication");
        if (publicationId) {
            loadPublication(Number(publicationId));
        }
    }, [searchParams]);
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
  const openCitation = async (publication) => {
    setCitationTarget(publication);
    setCitationLoading(true);
    try {
      const formatted = await formatCitation(publication.id, "APA");
      setCitationText(formatted.citation);
    } catch (error) {
      console.log(error);
    } finally {
      setCitationLoading(false);
    }
  };
  const updateCardCitation = async (style) => {
    setCitationStyle(style);
    if (!citationTarget) return;
    setCitationLoading(true);
    try {
      const response = await formatCitation(citationTarget.id, style);
      setCitationText(response.citation);
    } finally {
      setCitationLoading(false);
    }
  };
    return (
        <div style={{ padding: "30px" }}>

            <h1>Scientific Collaboration Network Analyzer</h1>

            <h2>Publication Management</h2>

            {/* Search */}

            <div style={{ marginBottom: "20px" }}>

                <label className="publication-form-label">
                    Title <span className="required-mark">*</span>
                </label>
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

            <div className="view-toggle" role="group" aria-label="Publication view">
                <button type="button" className={viewMode === "card" ? "active" : ""} onClick={() => setViewMode("card")}>Card View</button>
                <button type="button" className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>Table View</button>
            </div>

            {/* Add Publication */}

            <div style={{ marginBottom: "20px" }}>

                <label className="publication-form-label">
                    Title <span className="required-mark">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                />

                <label className="publication-form-label">
                    Authors <span className="required-mark">*</span>
                </label>
                <input
                    type="text"
                    name="authors"
                    placeholder="Authors"
                    value={form.authors}
                    onChange={handleChange}
                />

                <label className="publication-form-label">
                    Journal <span className="required-mark">*</span>
                </label>
                <input
                    type="text"
                    name="journal"
                    placeholder="Journal"
                    value={form.journal}
                    onChange={handleChange}
                />

                <label className="publication-form-label">
                    Publication Year <span className="required-mark">*</span>
                </label>
                <input
                    type="number"
                    name="publication_year"
                    placeholder="Year"
                    value={form.publication_year}
                    onChange={handleChange}
                />

                <label className="publication-form-label">
                    DOI
                </label>
                <input
                    type="text"
                    name="doi"
                    placeholder="DOI"
                    value={form.doi}
                    onChange={handleChange}
                />

                <label className="publication-form-label">
                    Keywords <span className="required-mark">*</span>
                </label>
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

                <label className="publication-form-label">
                    Institution
                </label>
                <div ref={institutionOptionsRef} style={{ position: "relative" }}>
                    <input
                        type="text"
                        value={institutionQuery}
                        placeholder="Type at least 3 characters to search"
                        onChange={(event) => {
                            const value = event.target.value;
                            setInstitutionQuery(value);
                            setShowInstitutionOptions(value.trim().length > 2);
                            setForm((previous) => ({
                                ...previous,
                                institution_id: null,
                            }));
                        }}
                        onFocus={() => setShowInstitutionOptions(institutionQuery.trim().length > 2)}
                        className="publication-form-select"
                    />
                    {showInstitutionOptions && institutionQuery.trim().length > 2 && (
                        <div
                            style={{
                                position: "absolute",
                                zIndex: 20,
                                width: "100%",
                                maxHeight: "220px",
                                overflowY: "auto",
                                background: "var(--surface-alt)",
                                border: "1px solid var(--border)",
                                borderRadius: "10px",
                                boxShadow: "var(--shadow)",
                            }}
                        >
                            {institutions
                                .filter((institution) =>
                                    institution.name?.toLowerCase().includes(institutionQuery.trim().toLowerCase())
                                )
                                .map((institution) => (
                                    <button
                                        type="button"
                                        key={institution.id}
                                        onClick={() => {
                                            setInstitutionQuery(institution.name);
                                            setShowInstitutionOptions(false);
                                            setForm((previous) => ({
                                                ...previous,
                                                institution_id: institution.id,
                                            }));
                                        }}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "none",
                                            background: "transparent",
                                            color: "var(--text)",
                                            textAlign: "left",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {institution.name}
                                    </button>
                                ))}
                            {institutions.filter((institution) =>
                                institution.name?.toLowerCase().includes(institutionQuery.trim().toLowerCase())
                            ).length === 0 && (
                                <p style={{ padding: "10px 12px", margin: 0 }}>
                                    No institutions found.
                                </p>
                            )}
                        </div>
                    )}
                </div>

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

                <label className="publication-form-label">
                    Reviewer <span className="required-mark">*</span>
                </label>
                <select
                    name="selected_reviewer_id"
                    value={form.selected_reviewer_id || ""}
                    onChange={handleChange}
                    className="publication-form-select"
                >
                    <option value="">
                        {reviewerLoading ? "Loading reviewers..." : reviewers.length ? "Select a reviewer to review your paper" : "No verified reviewers available"}
                    </option>
                    {reviewers.map((reviewer) => (
                        <option key={reviewer.id} value={reviewer.id}>
                            {reviewer.name} ({reviewer.email})
                        </option>
                    ))}
                </select>
                {reviewers.length === 0 && !reviewerLoading && (
                    <p className="publication-form-help">A verified reviewer must be available before this paper can be submitted for review.</p>
                )}

                <div style={{ marginTop: "15px" }}>

                    <button
                        type="button"
                        onClick={() => setShowReferences(!showReferences)}
                        className="publication-references-toggle"
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
                        <FaQuoteRight /> References (Citations) {showReferences ? "−" : "+"}
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
                            <div className="citation-selection-notice" role="status">
                                <span className="citation-selection-notice-icon">i</span>
                                <span><strong>{selectedCitations.length ? `${selectedCitations.length} citation${selectedCitations.length === 1 ? "" : "s"} selected` : "Select references for this publication"}</strong><small>{selectedCitations.length ? "Selected references will be saved when you submit this publication." : "Choose one or more publications below to add them as references."}</small></span>
                            </div>
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
        <p className="publication-form-help">
          Status is assigned automatically by the review workflow.
        </p>

                <button

                    disabled={!canCreatePublication}

                    title={
                        canCreatePublication
                            ? ""
                            : "Only Researchers can create publications"
                    }

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

                {!canCreatePublication && (
                    <p className="publication-form-help">
                        Reviewers can review assigned publications but cannot create publications.
                    </p>
                )}

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
                    <h3>Total Publications</h3>
                            <h1>{publicationTotal}</h1>
                </div>

                <div style={statsCard}>
                    <h3>Published</h3>
                    <h1>
                        {
                            publications.filter(
                                (p) => p.status === "Published"
                            ).length
                        }
                    </h1>
                </div>

                <div style={statsCard}>
                    <h3>Draft</h3>
                    <h1>
                        {
                            publications.filter(
                                (p) => p.status === "Draft"
                            ).length
                        }
                    </h1>
                </div>

                <div style={statsCard}>
                    <h3>Pending Review</h3>
                    <h1>
                        {
                            publications.filter(
                                (p) => ["Submitted", "Pending Review"].includes(p.status)
                            ).length
                        }
                    </h1>
                </div>
            </div>

            {viewMode === "table" ? (
                <div className="table-container publication-table-container">
                    <table className="data-table">
                        <thead><tr><th>Publication</th><th>Status</th><th>Reviewer</th><th>Institution</th><th>Year</th><th>DOI</th><th>Actions</th></tr></thead>
                        <tbody>{paginatedPublications.map((publication) => (
                            <tr key={publication.id}>
                                <td><strong>{publication.title}</strong><div className="muted-text">{publication.authors || "Authors unavailable"}</div></td>
                                <td><span className="status-badge">{publication.status}</span></td>
                                <td>{publication.reviewer_name || publication.selected_reviewer_name || "Not assigned"}</td>
                                <td>{publication.institution_name || "—"}</td>
                                <td>{publication.publication_year || "—"}</td>
                                <td>{publication.doi || "—"}</td>
                                <td><button type="button" onClick={() => loadPublication(publication.id)}>View</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            ) : (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "20px",
                    marginTop: "30px",
                }}
            >
                {paginatedPublications.map((publication) => (

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
                            {publication.title}
                        </h2>

                        <p>
                            <b>Authors:</b> {publication.authors}
                        </p>

                        <p>
                            <b>Publication Type:</b>{" "}
                            {publication.publication_type}
                        </p>

                        <p>
                            <b>Journal:</b> {publication.journal}
                        </p>

                        <p>
                            <b>Year:</b> {publication.publication_year}
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
                            <b>Reviewer:</b>{" "}
                            {publication.reviewer_name ||
                                publication.selected_reviewer_name ||
                                "Not assigned"}
                        </p>

                        {publication.reviewed_by && (
                            <>
                                <p>
                                    <b>Accepted By:</b> {publication.reviewer_name || "Reviewer"}
                                </p>
                                <p>
                                    <b>Reviewed On:</b>{" "}
                                    {publication.reviewed_at
                                        ? new Date(publication.reviewed_at).toLocaleString()
                                        : "N/A"}
                                </p>
                                <p>
                                    <b>Review Comments:</b> {publication.review_comments || "No comments"}
                                </p>
                            </>
                        )}

                        <p>
                            <b>DOI:</b>{" "}
                            {publication.doi || "N/A"}
                        </p>

        <p>
            <b>Keywords:</b>{" "}
            {publication.keywords || "N/A"}
        </p>
        <div className="publication-card-citation">
            <div className="publication-card-citation-heading">
                <span><FaQuoteRight /> Citation</span>
                <small>Use this publication in your research</small>
            </div>
            <button type="button" className="publication-card-cite-button" onClick={() => openCitation(publication)}>
                <FaQuoteRight /> Cite <FaExternalLinkAlt />
            </button>
        </div>

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
                                View
                            </button>

            {(currentUser?.role === "System Admin" || publication.researcher_id === currentUser?.id) && <button
                onClick={() => setEditingPublication(publication)}
                style={{
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                }}
            >
                Edit
            </button>}

            {(currentUser?.role === "System Admin" || publication.researcher_id === currentUser?.id) && <button
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
                Delete
            </button>}

                        </div>

                    </div>

                ))}
            </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "24px" }}>
                <button type="button" disabled={publicationPage <= 1} onClick={() => setPublicationPage((page) => page - 1)}>Previous</button>
                <span>Page {publicationPage} of {publicationPageCount}</span>
                <button type="button" disabled={publicationPage >= publicationPageCount} onClick={() => setPublicationPage((page) => page + 1)}>Next</button>
            </div>
            <CitationModal
                publication={citationTarget}
                open={Boolean(citationTarget)}
                onClose={() => setCitationTarget(null)}
                publicationId={citationTarget?.id}
                citation={citationText}
                style={citationStyle}
                onStyleChange={updateCardCitation}
                onGenerate={() => updateCardCitation(citationStyle)}
                loading={citationLoading}
            />
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

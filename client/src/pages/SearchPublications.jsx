import { useEffect, useState } from "react";
import API from "../services/api";
import Pagination from "../components/Pagination";

function SearchPublications() {

    const [publications, setPublications] = useState([]);

    const [search, setSearch] = useState("");

    const [showFilters, setShowFilters] = useState(false);

    const [filterType, setFilterType] = useState("Title");

    const [filterValue, setFilterValue] = useState("");
    const [sortOption, setSortOption] = useState("Title (A-Z)");
    const [selectedPublication, setSelectedPublication] = useState(null);
    const [page, setPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {

        loadPublications();

    }, []);

    const loadPublications = async () => {

        try {

            const response = await API.get("/publications/");

            setPublications(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const filteredPublications = publications.filter((publication) => {

        const searchText = search.toLowerCase();

        const searchMatch =

            publication.title?.toLowerCase().includes(searchText) ||

            publication.authors?.toLowerCase().includes(searchText);

        if (!searchMatch)

            return false;

        if (filterValue === "")

            return true;

        switch (filterType) {

            case "Title":

                return publication.title?.toLowerCase()

                    .includes(filterValue.toLowerCase());

            case "Author":

                return publication.authors?.toLowerCase()

                    .includes(filterValue.toLowerCase());

            case "Journal":

                return publication.journal?.toLowerCase()

                    .includes(filterValue.toLowerCase());

            case "Publication Type":

                return publication.publication_type === filterValue;

            case "Keyword":

                return publication.keywords?.toLowerCase()

                    .includes(filterValue.toLowerCase());

            case "Year":

                return String(publication.publication_year) === filterValue;

            case "Status":

                return publication.status?.toLowerCase()

                    .includes(filterValue.toLowerCase());

            case "DOI":

                return publication.doi?.toLowerCase()

                    .includes(filterValue.toLowerCase());

            default:

                return true;

        }

    });

    const sortedPublications = [...filteredPublications].sort((a, b) => {
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
    const pageCount = Math.max(1, Math.ceil(sortedPublications.length / pageSize));
    const paginatedPublications = sortedPublications.slice((page - 1) * pageSize, page * pageSize);

    return (

        <div style={{ padding: "30px" }}>

            <h1>

                🔍 Search Publications

            </h1>

            <p>

                Search publications from all researchers.

            </p>

            <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "30px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    alignItems: "center"
                }}
            >

                <input

                    type="text"

                    placeholder="Search by title or author..."

                    value={search}

                    onChange={(e) =>

                        setSearch(e.target.value)

                    }

                    style={{
                        flex: 1,
                        minWidth: "240px",
                        padding: "12px",
                        borderRadius: "8px"
                    }}

                />

                <button

                    onClick={() =>

                        setShowFilters(!showFilters)

                    }

                >

                    ⚙ Filters

                </button>

                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{
                        padding: "12px",
                        borderRadius: "8px",
                        minWidth: "220px"
                    }}
                >
                    <option>Title (A-Z)</option>
                    <option>Title (Z-A)</option>
                    <option>Year (Newest)</option>
                    <option>Year (Oldest)</option>
                    <option>Last Modified (Newest)</option>
                    <option>Last Modified (Oldest)</option>
                </select>

            </div>

            {

                showFilters && (

                    <div
                        style={{
                            background: "var(--surface-alt)",
                            color: "var(--text)",
                            padding: "20px",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            marginBottom: "25px"
                        }}
                    >

                        <h3>

                            Filter Publications

                        </h3>

                        <select

                            value={filterType}

                            onChange={(e) => {

                                setFilterType(e.target.value);

                                setFilterValue("");

                            }}

                            style={{
                                marginRight: "15px",
                                padding: "10px"
                            }}

                        >

                            <option>Title</option>

                            <option>Author</option>

                            <option>Journal</option>

                            <option>Publication Type</option>

                            <option>Keyword</option>

                            <option>Year</option>

                            <option>Status</option>

                            <option>DOI</option>

                        </select>

                        {

                            filterType === "Publication Type"

                                ?

                                <select

                                    value={filterValue}

                                    onChange={(e) =>

                                        setFilterValue(

                                            e.target.value

                                        )

                                    }

                                    style={{
                                        padding: "10px"
                                    }}

                                >

                                    <option value="">

                                        Select Type

                                    </option>

                                    <option>

                                        Journal Article

                                    </option>

                                    <option>

                                        Conference Paper

                                    </option>

                                    <option>

                                        Book Chapter

                                    </option>

                                    <option>

                                        Patent

                                    </option>

                                    <option>

                                        Thesis

                                    </option>

                                    <option>

                                        Technical Report

                                    </option>

                                </select>

                                :

                                <input

                                    type="text"

                                    placeholder={`Enter ${filterType}`}

                                    value={filterValue}

                                    onChange={(e) =>

                                        setFilterValue(

                                            e.target.value

                                        )

                                    }

                                    style={{
                                        padding: "10px",
                                        width: "250px"
                                    }}

                                />

                        }

                    </div>

                )

            }

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(350px,1fr))",
                    gap: "20px"
                }}
            >

                {

                    paginatedPublications.map((publication) => (

                        <div

                            key={publication.id}

                            style={{

                                background: "rgba(255,255,255,0.06)",

                                padding: "20px",

                                borderRadius: "12px",

                                boxShadow: "0 18px 60px rgba(0,0,0,0.18)"

                            }}

                        >

                            <h2>

                                📄 {publication.title}

                            </h2>

                            <p>

                                <b>👨‍🔬 Authors:</b>

                                {" "}

                                {publication.authors}

                            </p>

                            <p>

                                <b>📑 Type:</b>

                                {" "}

                                {publication.publication_type}

                            </p>

                            <p>

                                <b>📚 Journal:</b>

                                {" "}

                                {publication.journal}

                            </p>

                            <p>

                                <b>📅 Year:</b>

                                {" "}

                                {publication.publication_year}

                            </p>

                            <button

    onClick={() =>

        setSelectedPublication(

            publication

        )

    }

    style={{

                    marginTop:"15px",

        background:"var(--primary)",

        color:"var(--on-primary)",

        border:"none",

        padding:"10px 18px",

        borderRadius:"8px",

        cursor:"pointer"

    }}

>

    👁 View Details

</button>

                        </div>

                    ))

                }

            </div>
            <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={setPage} />
      {
    selectedPublication && (

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
                    background: "var(--surface-alt)",
                    color: "var(--text)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    padding: "30px",
                    maxHeight: "90vh",
                    overflowY: "auto"
                }}
            >

                            <h2 style={{ color: "var(--text)" }}>

                    📄 {selectedPublication.title}

                </h2>

                <hr/>

                <p>

                    <b>👨‍🔬 Authors:</b>

                    {selectedPublication.authors}

                </p>

                <p>

                    <b>📑 Publication Type:</b>

                    {selectedPublication.publication_type}

                </p>

                <p>

                    <b>📚 Journal:</b>

                    {selectedPublication.journal}

                </p>

                <p>

                    <b>📅 Year:</b>

                    {selectedPublication.publication_year}

                </p>

                <p>

                    <b>🏷 Keywords:</b>

                    {selectedPublication.keywords}

                </p>

                <p>

                    <b>📖 DOI:</b>

                    {selectedPublication.doi}

                </p>

                <p>

                    <b>📝 Abstract:</b>

                    <br/>

                    {selectedPublication.abstract}

                </p>

                {

                    selectedPublication.pdf_file && (

                        <a

                            href={selectedPublication.pdf_file}

                            target="_blank"

                            rel="noreferrer"

                        >

                            📄 View PDF

                        </a>

                    )

                }

                <br/><br/>

                <button

                    onClick={()=>

                        setSelectedPublication(null)

                    }

                >

                    Close

                </button>

            </div>

        </div>

    )
}      

        </div>

    );

}

export default SearchPublications;

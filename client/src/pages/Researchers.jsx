import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import ResearcherCard from "../components/ResearcherCard";


function Researchers() {

    const [filterField, setFilterField] = useState("All");
    const [showDropdown, setShowDropdown] = useState(false);


    const [researchers, setResearchers] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOption, setSortOption] = useState("Name (A-Z)");
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetchResearchers();

    }, []);

    const fetchResearchers = async () => {

        try {

            setLoading(true);

            const response = await api.get("/researcher/all");

            setResearchers(response.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const filteredResearchers = researchers.filter((researcher) => {

        const text = search.toLowerCase();
        if (!text) return true;

        const nameMatch = researcher.name?.toLowerCase().includes(text);
        const institutionMatch = researcher.institution?.toLowerCase().includes(text);
        const departmentMatch = researcher.department?.toLowerCase().includes(text);
        const interestMatch = researcher.research_interest?.toLowerCase().includes(text);
        const countryMatch = researcher.country?.toLowerCase().includes(text);

        if (filterField === "All") {
            return nameMatch || institutionMatch || departmentMatch || interestMatch || countryMatch;
        }

        switch (filterField) {
            case "Name":
                return nameMatch;
            case "Institution":
                return institutionMatch;
            case "Department":
                return departmentMatch;
            case "Research Interest":
                return interestMatch;
            case "Country":
                return countryMatch;
            default:
                return true;
        }

    });

    return (

        <div>

            <h1>
                Researchers ({filteredResearchers.length})
            </h1>

            <p>
                Search and collaborate with researchers.
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "20px" }}>
                <input
                    type="text"
                    placeholder={`Search ${filterField || "All"}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #ccc"
                    }}
                />

                <div style={{ position: "relative" }}>
                    <button
                        type="button"
                        onClick={() => setShowDropdown((s) => !s)}
                        style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            background: "var(--surface-alt)",
                            border: "1px solid var(--border)",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        ⚙ Filter
                    </button>

                    {showDropdown && (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "calc(100% + 8px)",
                                background: "#fff",
                                border: "1px solid #e5e5e5",
                                borderRadius: "10px",
                                padding: "10px",
                                minWidth: "220px",
                                zIndex: 10
                            }}
                        >
                            {[
                                { key: "All", label: "All" },
                                { key: "Name", label: "Name" },
                                { key: "Institution", label: "Institution" },
                                { key: "Department", label: "Department" },
                                { key: "Research Interest", label: "Research Interest" },
                                { key: "Country", label: "Country" }
                            ].map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => {
                                        setFilterField(opt.key);
                                        setShowDropdown(false);
                                        setSearch("");
                                    }}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "8px 10px",
                                        border: "1px solid transparent",
                                        background: filterField === opt.key ? "rgba(37,99,235,0.15)" : "transparent",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        marginBottom: "6px"
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "15px", flexWrap: "wrap" }}>
                <button
                    onClick={() => setSearch("")}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: "#1976d2",
                        color: "white"
                    }}
                >
                    Clear Search
                </button>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, opacity: 0.9 }}>Sort:</span>
                        <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                style={{
                                    padding: "10px",
                                    borderRadius: "10px",
                                    border: "1px solid var(--border)",
                                    background: "var(--surface-alt)",
                                    color: "var(--text)"
                                }}
                            >
                        <option>Name (A-Z)</option>
                        <option>Name (Z-A)</option>
                        <option>Country (A-Z)</option>
                        <option>Country (Z-A)</option>
                    </select>
                </div>
            </div>


            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                    gap: "20px",
                    marginTop: "30px"
                }}
            >

                {
                    loading ? (

                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "40px"
                            }}
                        >
                            <h3>Loading researchers...</h3>
                        </div>

                    ) : filteredResearchers.length === 0 ? (

                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "40px"
                            }}
                        >
                            <h3>No researchers found</h3>
                            <p>Try searching with a different keyword.</p>
                        </div>

                    ) : (

                        [...filteredResearchers].sort((a, b) => {
                            switch (sortOption) {
                                case "Name (Z-A)":
                                    return (b.name || "").localeCompare(a.name || "");
                                case "Country (A-Z)":
                                    return (a.country || "").localeCompare(b.country || "");
                                case "Country (Z-A)":
                                    return (b.country || "").localeCompare(a.country || "");
                                case "Name (A-Z)":
                                default:
                                    return (a.name || "").localeCompare(b.name || "");
                            }
                        }).map((researcher) => (


                            <ResearcherCard
                                key={researcher.id}
                                researcher={researcher}
                            />

                        ))

                    )
                }

            </div>

        </div>

    );

}

export default Researchers;
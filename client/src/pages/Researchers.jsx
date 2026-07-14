import { useEffect, useState } from "react";
import api from "../services/api";
import ResearcherCard from "../components/ResearcherCard";

function Researchers() {

    const [researchers, setResearchers] = useState([]);
    const [search, setSearch] = useState("");
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

        return (

            researcher.name?.toLowerCase().includes(text) ||

            researcher.institution?.toLowerCase().includes(text) ||

            researcher.department?.toLowerCase().includes(text) ||

            researcher.research_interest?.toLowerCase().includes(text) ||

            researcher.country?.toLowerCase().includes(text)

        );

    });

    return (

        <div>

            <h1>
                Researchers ({filteredResearchers.length})
            </h1>

            <p>
                Search and collaborate with researchers.
            </p>

            <input
                type="text"
                placeholder="Search by name, institution, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "20px",
                    borderRadius: "10px",
                    border: "1px solid #ccc"
                }}
            />

            <div style={{ marginTop: "15px" }}>
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

                        filteredResearchers.map((researcher) => (

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
import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const SECTION_OPTIONS = ["All", "Publications", "Researchers", "Institutions", "Conferences"];

function SearchResearch() {
  const [search, setSearch] = useState("");

  const [publications, setPublications] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [conferences, setConferences] = useState([]);

  const [loading, setLoading] = useState(true);

  // UI: section selector near the search bar
  // Default is "All" (search across all sections)
  const [activeSection, setActiveSection] = useState("All");
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const pubs = await API.get("/publications/");
        const researchersRes = await API.get("/researcher/all");
        const institutionsRes = await API.get("/institution/");
        const conferencesRes = await API.get("/conference/");

        setPublications(pubs.data);
        setResearchers(researchersRes.data);
        setInstitutions(institutionsRes.data);
        setConferences(conferencesRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedSearch = search.toLowerCase().trim();

  const filteredPublications = useMemo(() => {
    if (activeSection !== "All" && activeSection !== "Publications") return [];
    if (!normalizedSearch) return publications;


    return publications.filter((p) => {
      const titleMatch = p?.title?.toLowerCase().includes(normalizedSearch);
      const authorsMatch = p?.authors?.toLowerCase().includes(normalizedSearch);
      const journalMatch = p?.journal?.toLowerCase().includes(normalizedSearch);
      const doiMatch = p?.doi?.toLowerCase().includes(normalizedSearch);
      return titleMatch || authorsMatch || journalMatch || doiMatch;
    });
  }, [activeSection, normalizedSearch, publications]);

  const filteredResearchers = useMemo(() => {
    if (activeSection !== "All" && activeSection !== "Researchers") return [];

    if (!normalizedSearch) return researchers;

    return researchers.filter((r) => {
      return (
        r?.name?.toLowerCase().includes(normalizedSearch) ||
        r?.email?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [activeSection, normalizedSearch, researchers]);

  const filteredInstitutions = useMemo(() => {
    if (activeSection !== "Institutions") return [];
    if (!normalizedSearch) return institutions;

    return institutions.filter((i) => {
      return (
        i?.name?.toLowerCase().includes(normalizedSearch) ||
        `${i?.city || ""} ${i?.country || ""}`.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [activeSection, normalizedSearch, institutions]);

  const filteredConferences = useMemo(() => {
    if (activeSection !== "Conferences") return [];
    if (!normalizedSearch) return conferences;

    return conferences.filter((c) => {
      return (
        c?.name?.toLowerCase().includes(normalizedSearch) ||
        c?.location?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [activeSection, normalizedSearch, conferences]);

  return (
    <div style={{ padding: "30px" }}>
      <h1>🔍 Research Search</h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "25px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder={`Search ${activeSection}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 420px",
            minWidth: "320px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
          }}
        />

        <div style={{ position: "relative", marginLeft: "auto" }}>
          <button

            type="button"
            onClick={() => setShowSectionDropdown((s) => !s)}
            style={{
              background: "#f5f5f5",
              border: "1px solid #e5e5e5",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <span>{activeSection === "All" ? "≡" : "⚙"}</span>
            <span style={{ opacity: 0.9 }}>{activeSection === "All" ? "All" : "Filter"}</span>
          </button>

          {showSectionDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "10px",
                padding: "10px",
                zIndex: 10,
                minWidth: "220px",
              }}
            >
              {SECTION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setActiveSection(opt);
                    setSearch("");
                    setShowSectionDropdown(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid transparent",
                    background: opt === activeSection ? "#eff6ff" : "transparent",
                    cursor: "pointer",
                    marginBottom: "6px",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h3>Loading research data...</h3>
        </div>
      ) : (
        <>
              {activeSection === "All" && (
            <>
              <h2>📚 Publications</h2>
              {filteredPublications.length === 0 ? (
                <p>No Publications Found</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {filteredPublications.map((publication) => (
                    <div
                      key={publication.id}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
                      }}
                    >
                      <h3 style={{ color: "#2563eb", marginTop: 0 }}>
                        📄 {publication.title}
                      </h3>
                      <p>
                        <b>👨‍🔬 Authors:</b> {publication.authors}
                      </p>
                      <p>
                        <b>📑 Type:</b> {publication.publication_type}
                      </p>
                      <p>
                        <b>📚 Journal:</b> {publication.journal}
                      </p>
                      <p>
                        <b>📅 Year:</b> {publication.publication_year}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <h2 style={{ marginTop: 26 }}>👨 Researchers</h2>
              {filteredResearchers.length === 0 ? (
                <p>No Researchers Found</p>
              ) : (
                filteredResearchers.map((researcher) => (
                  <div
                    key={researcher.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <h3>{researcher.name}</h3>
                    <p>{researcher.email}</p>
                  </div>
                ))
              )}

              <h2 style={{ marginTop: 26 }}>🏫 Institutions</h2>
              {filteredInstitutions.length === 0 ? (
                <p>No Institutions Found</p>
              ) : (
                filteredInstitutions.map((institution) => (
                  <div
                    key={institution.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <h3>{institution.name}</h3>
                    <p>
                      {institution.city}, {institution.country}
                    </p>
                  </div>
                ))
              )}

              <h2 style={{ marginTop: 26 }}>🏛 Conferences</h2>
              {filteredConferences.length === 0 ? (
                <p>No Conferences Found</p>
              ) : (
                filteredConferences.map((conference) => (
                  <div
                    key={conference.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <h3>{conference.name}</h3>
                    <p>{conference.location}</p>
                  </div>
                ))
              )}
            </>
          )}

          {activeSection === "Publications" && (

            <>
              <h2>📚 Publications</h2>
              {filteredPublications.length === 0 ? (
                <p>No Publications Found</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {filteredPublications.map((publication) => (
                    <div
                      key={publication.id}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
                      }}
                    >
                      <h3 style={{ color: "#2563eb", marginTop: 0 }}>
                        📄 {publication.title}
                      </h3>
                      <p>
                        <b>👨‍🔬 Authors:</b> {publication.authors}
                      </p>
                      <p>
                        <b>📑 Type:</b> {publication.publication_type}
                      </p>
                      <p>
                        <b>📚 Journal:</b> {publication.journal}
                      </p>
                      <p>
                        <b>📅 Year:</b> {publication.publication_year}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "Researchers" && (
            <>
              <h2>👨 Researchers</h2>
              {filteredResearchers.length === 0 ? (
                <p>No Researchers Found</p>
              ) : (
                filteredResearchers.map((researcher) => (
                  <div
                    key={researcher.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <h3>{researcher.name}</h3>
                    <p>{researcher.email}</p>
                  </div>
                ))
              )}
            </>
          )}

          {activeSection === "Institutions" && (
            <>
              <h2>🏫 Institutions</h2>
              {filteredInstitutions.length === 0 ? (
                <p>No Institutions Found</p>
              ) : (
                filteredInstitutions.map((institution) => (
                  <div
                    key={institution.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <h3>{institution.name}</h3>
                    <p>
                      {institution.city}, {institution.country}
                    </p>
                  </div>
                ))
              )}
            </>
          )}

          {activeSection === "Conferences" && (
            <>
              <h2>🏛 Conferences</h2>
              {filteredConferences.length === 0 ? (
                <p>No Conferences Found</p>
              ) : (
                filteredConferences.map((conference) => (
                  <div
                    key={conference.id}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <h3>{conference.name}</h3>
                    <p>{conference.location}</p>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResearch;


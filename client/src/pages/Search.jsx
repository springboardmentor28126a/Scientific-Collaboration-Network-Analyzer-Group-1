import { useEffect, useMemo, useState,useRef } from "react";
import API from "../services/api";
import ResearcherCard from "../components/ResearcherCard";
import { useNavigate } from "react-router-dom";
import SearchSuggestions from "../components/SearchSuggestions";
const SECTION_OPTIONS = [
    "All",
    "Researchers",
    "Publications",
    "Research Groups",
    "Institutions",
    "Conferences"
];
function Search() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  // UI: section selector near the search bar
  // Default is "All" (search across all sections)
  const [activeSection, setActiveSection] = useState("All");
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);


  useEffect(() => {
  const query = search.trim();

  if (query.length < 2) {
    setPublications([]);
    setResearchers([]);
    setInstitutions([]);
    setConferences([]);
    setGroups([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setLoading(false);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setLoading(true);

      const [
        pubsRes,
        researchersRes,
        institutionsRes,
        conferencesRes,
        groupsRes,
      ] = await Promise.all([
        API.get("/publications/search", {
          params: { q: query },
        }),
        API.get("/researcher/search", {
          params: { q: query },
        }),
        API.get("/institution/search", {
          params: {
            q: query,
            limit: 20,
          },
        }),
        API.get("/conference/search", {
          params: { q: query },
        }),
        API.get("/groups/search", {
          params: { q: query },
        }),
      ]);

      setPublications(pubsRes.data);
      setResearchers(researchersRes.data);
      setInstitutions(institutionsRes.data);
      setConferences(conferencesRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

  useEffect(() => {

    function handleClickOutside(event) {

        if (
            searchRef.current &&
            !searchRef.current.contains(event.target)
        ) {
            setShowSuggestions(false);
        }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );
    };

}, []);
const filteredPublications =
  activeSection === "All" || activeSection === "Publications"
    ? publications
    : [];

const filteredResearchers =
  activeSection === "All" || activeSection === "Researchers"
    ? researchers
    : [];

const filteredGroups =
  activeSection === "All" || activeSection === "Research Groups"
    ? groups
    : [];

const filteredInstitutions =
  activeSection === "All" || activeSection === "Institutions"
    ? institutions
    : [];

const filteredConferences =
  activeSection === "All" || activeSection === "Conferences"
    ? conferences
    : [];
//   const normalizedSearch = search.toLowerCase().trim();

//   const filteredPublications = useMemo(() => {
//     if (activeSection !== "All" && activeSection !== "Publications") return [];
//     if (!normalizedSearch) return publications;


//     return publications.filter((p) => {
//       const titleMatch = p?.title?.toLowerCase().includes(normalizedSearch);
//       const authorsMatch = p?.authors?.toLowerCase().includes(normalizedSearch);
//       const journalMatch = p?.journal?.toLowerCase().includes(normalizedSearch);
//       const doiMatch = p?.doi?.toLowerCase().includes(normalizedSearch);
//       return titleMatch || authorsMatch || journalMatch || doiMatch;
//     });
//   }, [activeSection, normalizedSearch, publications]);

//   const filteredResearchers = useMemo(() => {
//     if (activeSection !== "All" && activeSection !== "Researchers") return [];

//     if (!normalizedSearch) return researchers;

//     return researchers.filter((r) => {
//       return (
//         r?.name?.toLowerCase().includes(normalizedSearch) ||
//         r?.email?.toLowerCase().includes(normalizedSearch)
//       );
//     });
//   }, [activeSection, normalizedSearch, researchers]);

//   const filteredGroups = useMemo(() => {
//     if (activeSection !== "All" && activeSection !== "Research Groups")
//         return [];

//     if (!normalizedSearch) return groups;

//     return groups.filter(group =>
//         group.name?.toLowerCase().includes(normalizedSearch) ||
//         group.description?.toLowerCase().includes(normalizedSearch)
//     );
// }, [activeSection, normalizedSearch, groups]);

//   const filteredInstitutions = useMemo(() => {
//   if (activeSection !== "All" && activeSection !== "Institutions") {
//     return [];
//   }

//   if (!normalizedSearch) {
//     return institutions;
//   }

//   return institutions.filter((i) => (
//     i?.name?.toLowerCase().includes(normalizedSearch) ||
//     `${i?.city || ""} ${i?.country || ""}`
//       .toLowerCase()
//       .includes(normalizedSearch)
//   ));
// }, [activeSection, normalizedSearch, institutions]);

//   const filteredConferences = useMemo(() => {
//     if (
//         activeSection !== "All" &&
//         activeSection !== "Conferences"
//     ) {
//         return [];
//     }

//     if (!normalizedSearch) {
//         return conferences;
//     }

//     return conferences.filter((c) => (
//         c?.name?.toLowerCase().includes(normalizedSearch) ||
//         c?.location?.toLowerCase().includes(normalizedSearch)
//     ));
// }, [activeSection, normalizedSearch, conferences]);

  useEffect(() => {

    if (!search.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
    }

    const data = [];

    filteredResearchers.slice(0, 3).forEach((r) => {
        data.push({
            id: r.id,
            type: "researcher",
            icon: "👨",
            title: r.name,
            subtitle: "Researcher"
        });
    });

    filteredPublications.slice(0, 3).forEach((p) => {
        data.push({
            id: p.id,
            type: "publication",
            icon: "📄",
            title: p.title,
            subtitle: "Publication"
        });
    });

    filteredGroups.slice(0, 3).forEach((g) => {
        data.push({
            id: g.id,
            type: "group",
            icon: "👥",
            title: g.name,
            subtitle: "Research Group"
        });
    });

    filteredInstitutions.slice(0, 3).forEach((i) => {
        data.push({
            id: i.id,
            type: "institution",
            icon: "🏫",
            title: i.name,
            subtitle: "Institution"
        });
    });

    filteredConferences.slice(0, 3).forEach((c) => {
        data.push({
            id: c.id,
            type: "conference",
            icon: "🏛",
            title: c.name,
            subtitle: "Conference"
        });
    });

    setSuggestions(data);
    setShowSuggestions(data.length > 0);

}, [
    search,
    filteredResearchers,
    filteredPublications,
    filteredGroups,
    filteredInstitutions,
    filteredConferences
]);
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
        <div
    ref={searchRef}
    style={{
        flex: "1 1 420px",
        position: "relative"
    }}
>
        <input
          type="text"
          placeholder={`Search ${activeSection}...`}
          value={search}
          onChange={(e) => {
    setSearch(e.target.value);

    if (e.target.value.trim()) {
        setShowSuggestions(true);
    } else {
        setShowSuggestions(false);
    }
}}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
          }}
        />
        <SearchSuggestions
        suggestions={suggestions}
        visible={showSuggestions}
        onSelect={(item) => {

    setSearch(item.title);
    setShowSuggestions(false);

    switch (item.type) {

        case "researcher":
            navigate(`/researcher/${item.id}`);
            break;

        case "group":
            navigate(`/groups/${item.id}`);
            break;

        case "publication":
            navigate(`/publications/${item.id}`);
            break;

        case "institution":
            navigate(`/institution/${item.id}`);
            break;

        case "conference":
            navigate(`/conference/${item.id}`);
            break;

        default:
            break;
    }
}}
    />

</div>

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

    <ResearcherCard
        key={researcher.id}
        researcher={researcher}
    />

))
              )}
              <h2 style={{ marginTop: 26 }}>👥 Research Groups</h2>

{filteredGroups.length === 0 ? (
    <p>No Research Groups Found</p>
) : (
    filteredGroups.map((group) => (
        <div
    key={group.id}
    onClick={() => navigate(`/groups/${group.id}`)}
    style={{
        background: "rgba(255,255,255,0.06)",
        padding: "20px",
        marginBottom: "15px",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "0.25s",
    }}
>
            <h3>{group.name}</h3>
            <p>{group.description}</p>
            <p>👥 Members: {group.member_count}</p>
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

    <ResearcherCard
        key={researcher.id}
        researcher={researcher}
    />

))
              )}
            </>
          )}

          {activeSection === "Research Groups" && (
    <>
        <h2>👥 Research Groups</h2>

        {filteredGroups.length === 0 ? (
            <p>No Research Groups Found</p>
        ) : (
            filteredGroups.map(group => (
                <div
                    key={group.id}
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        padding: "20px",
                        marginBottom: "15px",
                        borderRadius: "10px",
                        cursor: "pointer"
                    }}
                >
                    <h3>{group.name}</h3>
                    <p>{group.description}</p>
                    <p>👥 Members: {group.member_count}</p>
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

export default Search;


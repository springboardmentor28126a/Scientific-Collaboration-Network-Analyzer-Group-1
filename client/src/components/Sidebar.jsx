import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaBookOpen,
    FaSearch,
    FaChartBar,
    FaPeopleArrows,
    FaSchool,
    FaCalendarAlt,
    FaComments,
    FaEnvelope,
    FaShieldAlt,
    FaUser,
    FaFileAlt,
    FaUniversity,
    FaUsers,
    FaSpinner,
    FaChevronRight,
    FaMapMarkerAlt,
    FaCheckCircle
} from "react-icons/fa";
import API from "../services/api";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const searchRef = useRef(null);

    useEffect(() => {
        const term = query.trim();
        setIsSearching(term.length > 0);
        if (term.length === 0) {
            setResults([]);
            setIsSearching(false);
            setActiveIndex(0);
            return undefined;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const [response, groupsResponse] = await Promise.all([
                    API.get("/search/global", { params: { query: term } }),
                    API.get("/groups/search", { params: { q: term } }).catch(() => ({ data: [] })),
                ]);
                const data = response.data || {};
                setResults([
                    ...(data.researchers || []).map((item) => ({ ...item, type: "researcher", label: "Researchers", icon: <FaUser /> })),
                    ...(data.publications || []).map((item) => ({ ...item, type: "publication", label: "Publications", icon: <FaFileAlt /> })),
                    ...(data.institutions || []).map((item) => ({ ...item, type: "institution", label: "Institutions", icon: <FaUniversity /> })),
                    ...(groupsResponse.data || []).map((item) => ({ ...item, type: "group", label: "Groups", icon: <FaUsers /> })),
                    ...(data.conferences || []).map((item) => ({ ...item, type: "conference", label: "Conferences", icon: <FaCalendarAlt /> })),
                ]);
                setActiveIndex(0);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    const openResult = (result) => {
        const routes = {
            researcher: `/researcher/${result.id}`,
            publication: `/publication/${result.id}`,
            institution: `/institution/${result.id}`,
            conference: `/conference/${result.id}`,
            group: `/groups/${result.id}`,
        };
        navigate(routes[result.type]);
        setQuery("");
        setResults([]);
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Escape") {
            setQuery("");
            setResults([]);
            return;
        }
        if (!results.length) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % results.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + results.length) % results.length);
        } else if (event.key === "Enter") {
            event.preventDefault();
            openResult(results[activeIndex]);
        }
    };

    const groupedResults = results.reduce((groups, result) => {
        (groups[result.label] ||= []).push(result);
        return groups;
    }, {});
    return (

        <div
            className="sidebar-shell"
            style={{
                width: "260px",
                background: "var(--sidebar)",
                color: "var(--sidebar-text)",
                minHeight: "100vh",
                height: "100vh",
                padding: "30px",
                borderRight: "1px solid var(--border)",
                overflowY: "auto"
            }}
        >

            <div style={{ marginBottom: "32px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px"
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            width: "40px",
                            height: "40px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "14px",
                            background: "rgba(34,211,238,.14)",
                            color: "var(--accent)"
                        }}
                    >
                        <FaPeopleArrows aria-hidden="true" />
                    </span>

                    <div>

                        <h2 style={{ margin: 0 }}>SCNA</h2>

                        <p
                            style={{
                                margin: 0,
                                color: "var(--muted)",
                                fontSize: "13px"
                            }}
                        >
                            Connected Research Hub
                        </p>

                    </div>

                </div>
            </div>

            <div className="sidebar-search" ref={searchRef}>
                <FaSearch aria-hidden="true" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search Researchers, Publications, Institutions, Conferences..."
                    aria-label="Global search"
                    aria-autocomplete="list"
                    aria-controls="sidebar-search-results"
                />
                {query.trim().length < 0 && results.length > 0 && (
                    <div className="sidebar-search-results" id="sidebar-search-results" role="listbox">
                        {results.map((result, index) => (
                            <button
                                type="button"
                                role="option"
                                aria-selected={index === activeIndex}
                                className={index === activeIndex ? "is-active" : ""}
                                key={`${result.type}-${result.id}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => openResult(result)}
                            >
                                <span className="search-result-icon">{result.icon}</span>
                                <span><strong>{result.name || result.title}</strong><small>{result.label}{result.institution_name ? ` · ${result.institution_name}` : ""}</small></span>
                            </button>
                        ))}
                    </div>
                )}
                {isSearching && <FaSpinner className="search-spinner" aria-label="Searching" />}
                {!isSearching && query.trim().length > 0 && (
                    <div className="sidebar-search-results" id="sidebar-search-results" role="listbox">
                        {results.length === 0 ? <div className="search-empty-state">
                            <span className="search-empty-icon"><FaSearch /></span>
                            <strong>No matching results found</strong>
                            <p>Try searching using another name, publication title, institution or conference.</p>
                        </div> : Object.entries(groupedResults).map(([group, groupResults]) => <div className="search-result-group" key={group}>
                            <div className="search-result-group-title">{group}</div>
                            {groupResults.map((result) => {
                                const index = results.indexOf(result);
                                const title = result.name || result.title;
                                const subtitle = result.type === "researcher"
                                    ? [result.designation, result.department].filter(Boolean).join(" · ") || "Research profile"
                                    : result.type === "publication"
                                        ? [result.authors, result.publication_year].filter(Boolean).join(" · ") || "Publication record"
                                        : result.type === "group"
                                            ? `${result.member_count || 0} members · ${result.visibility || "Research community"}`
                                            : result.type === "conference"
                                                ? [result.organizer, result.location].filter(Boolean).join(" · ") || "Conference event"
                                                : [result.city, result.country].filter(Boolean).join(" · ") || "Institution profile";
                                const description = result.description || result.abstract || result.research_interests || result.journal || "Explore this record in the research hub.";
                                return <button type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? "is-active" : ""} key={`${result.type}-${result.id}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => openResult(result)}>
                                    <span className="search-result-icon">{result.icon}</span>
                                    <span className="search-result-copy"><strong>{title}</strong><small>{subtitle}</small><em>{description}</em>{result.institution_name && <small><FaMapMarkerAlt /> {result.institution_name}</small>}{result.status && <span className="search-status"><FaCheckCircle /> {result.status}</span>}</span>
                                    <FaChevronRight className="search-result-arrow" aria-hidden="true" />
                                </button>;
                            })}
                        </div>)}
                    </div>
                )}
            </div>

            <div style={{ display: "grid", gap: "10px" }}>

            <MenuItem
                icon={<FaHome />}
                text="Dashboard"
                active={location.pathname === "/dashboard"}
                onClick={() => navigate("/dashboard")}
            />

            {/* <MenuItem
                icon={<FaUsers />}
                text="Researchers"
                active={location.pathname === "/researchers"}
                onClick={() => navigate("/researchers")}
            /> */}

            <MenuItem
                icon={<FaBookOpen />}
                text="Publications"
                active={
                    location.pathname === "/publications" ||
                    location.pathname === "/my-publications"
                }
                onClick={() => navigate("/publications")}
            />

            <MenuItem
    icon={<FaSearch />}
    text="Search"
    active={
        location.pathname === "/search" ||
        location.pathname === "/search-publications"
    }
    onClick={() => navigate("/search")}
/>

            <MenuItem
                icon={<FaChartBar />}
                text="Analytics"
                active={location.pathname === "/analytics"}
                onClick={() => navigate("/analytics")}
            />

            <MenuItem
    icon={<FaEnvelope />}
    text="Invitations"
    active={location.pathname === "/invitations"}
    onClick={() => navigate("/invitations")}
/>

            <MenuItem
                icon={<FaShieldAlt />}
                text="Verification Requests"
                roles={["Faculty", "System Admin"]}
                active={location.pathname === "/verification-requests"}
                onClick={() => navigate("/verification-requests")}
            />

            <MenuItem
    icon={<FaPeopleArrows />}
    text="Research Groups"
    active={location.pathname.startsWith("/groups")}
    onClick={() => navigate("/groups")}
/>
            <MenuItem
    icon={<FaComments />}
    text="Chat"
    active={location.pathname === "/chat"}
    onClick={() => navigate("/chat")}
/>

            <MenuItem
                icon={<FaCalendarAlt />}
                text="Conference Organization"
                active={location.pathname === "/conference"}
                onClick={() => navigate("/conference")}
            />

            <MenuItem
                icon={<FaSchool />}
                text="Institutions"
                active={location.pathname === "/institution"}
                onClick={() => navigate("/institution")}
            />

            <MenuItem
                icon={<FaSchool />}
                text="Institution Management"
                roles={["Institution Admin", "System Admin"]}
                active={location.pathname === "/institution/manage"}
                onClick={() => navigate("/institution/manage")}
            />

            </div>

        </div>

    );

}

function MenuItem({ icon, text, active, onClick, roles }) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (roles && user?.role !== "System Admin" && !roles.includes(user?.role)) {
        return null;
    }

    return (

        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "16px",
                cursor: "pointer",
                background: active
                    ? "rgba(34,211,238,.15)"
                    : "transparent",
                border: active
                    ? "1px solid rgba(34,211,238,.3)"
                    : "transparent",
                transition: ".25s"
            }}
        >

            <span
                style={{
                    display: "inline-flex",
                    width: "32px",
                    height: "32px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    background: active
                        ? "rgba(34,211,238,.22)"
                        : "rgba(255,255,255,.05)"
                }}
            >
                {icon}
            </span>

            <span
                style={{
                    fontWeight: active ? 600 : 500
                }}
            >
                {text}
            </span>

        </div>
        

    );

}

export default Sidebar;

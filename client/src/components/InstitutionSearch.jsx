import { useEffect, useState } from "react";
import api from "../services/api";

function InstitutionSearch({ value, onSelect, disabled }) {
    const [query, setQuery] = useState(value || "");
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    useEffect(() => {
    setQuery(value || "");
    setInstitutions([]); // Don't show suggestions when profile loads
}, [value]);

  useEffect(() => {
    const search = query.trim();

    if (search.length < 2) {
        setInstitutions([]);
        return;
    }

    const timer = setTimeout(async () => {
        try {
            setLoading(true);

            const res = await api.get(
                `/institution/search?q=${encodeURIComponent(search)}&limit=10`
            );

            setInstitutions(res.data);
        } catch (err) {
            console.error(err);
            setInstitutions([]);
        } finally {
            setLoading(false);
        }
    }, 300);

    return () => clearTimeout(timer);

}, [query]);
    return (
        <div style={{ position: "relative" }}>

        <input
    value={query}
    disabled={disabled}
    autoComplete="off"
    placeholder="Search Institution..."
    onFocus={() => setIsFocused(true)}
    onBlur={() => {
        setTimeout(() => {
            setIsFocused(false);
            setInstitutions([]);
        }, 150);
    }}
    onChange={(e) => {
    console.log("Typing:", e.target.value);
    setQuery(e.target.value);
}}
    style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd"
    }}
/>

            {loading && (
                <div style={{ padding: "8px" }}>
                    Searching...
                </div>
            )}

            {isFocused && !loading && institutions.length > 0 && (

                <div
                    style={{
                        position: "absolute",
                        width: "100%",
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        maxHeight: "220px",
                        overflowY: "auto",
                        zIndex: 1000
                    }}
                >

                    {institutions.map((item) => (

                        <div
                            key={item.id}
                            onClick={() => {
                                setQuery(item.name);
                                setInstitutions([]);
                                onSelect(item);
                            }}
                            style={{
                                padding: "10px",
                                cursor: "pointer",
                                borderBottom: "1px solid #eee"
                            }}
                        >
                            <strong>{item.name}</strong>

                            {/* dropdown should only show institution names */}
                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default InstitutionSearch;
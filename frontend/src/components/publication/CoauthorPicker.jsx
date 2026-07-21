import { useState, useEffect } from "react";
import { searchResearchers } from "../../services/researcherService";

function CoauthorPicker({ selectedCoauthors, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchResearchers(query);
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const addCoauthor = (researcher) => {
    if (selectedCoauthors.find((c) => c.id === researcher.id)) return;
    onChange([...selectedCoauthors, researcher]);
    setQuery("");
    setResults([]);
  };

  const removeCoauthor = (id) => {
    onChange(selectedCoauthors.filter((c) => c.id !== id));
  };

  return (
    <div className="coauthor-picker">
      <input
        type="text"
        placeholder="Search researchers by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {searching && <div className="coauthor-search-hint">Searching...</div>}

      {results.length > 0 && (
        <div className="coauthor-results">
          {results.map((r) => (
            <div key={r.id} className="coauthor-result-item" onClick={() => addCoauthor(r)}>
              <span>{r.first_name} {r.last_name}</span>
              {r.designation && <span className="coauthor-designation">{r.designation}</span>}
            </div>
          ))}
        </div>
      )}

      {selectedCoauthors.length > 0 && (
        <div className="coauthor-chips">
          {selectedCoauthors.map((c) => (
            <span className="coauthor-chip" key={c.id}>
              {c.first_name} {c.last_name}
              <button type="button" onClick={() => removeCoauthor(c.id)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoauthorPicker;
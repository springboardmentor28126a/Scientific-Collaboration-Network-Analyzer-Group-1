import { useState } from "react";
import API from "../api";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    users: [],
    publications: [],
    conferences: [],
  });

  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await API.get(`/search?query=${query}`);
      setResults(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Global Search</h1>

      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

      <hr />

      <h2>Users</h2>

      <ul>
        {results.users.map((user) => (
          <li key={user.id}>
            {user.username} ({user.email})
          </li>
        ))}
      </ul>

      <h2>Publications</h2>

      <ul>
        {results.publications.map((publication) => (
          <li key={publication.id}>
            {publication.title} ({publication.year})
          </li>
        ))}
      </ul>

      <h2>Conferences</h2>

      <ul>
        {results.conferences.map((conference) => (
          <li key={conference.id}>
            {conference.name} - {conference.location}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;
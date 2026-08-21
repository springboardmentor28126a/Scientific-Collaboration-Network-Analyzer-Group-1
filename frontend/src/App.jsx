import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("");
  <Route path="/projects" element={<Projects />} />

  useEffect(() => {
    api
      .get("/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Scientific Collaboration Network Analyzer</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default App;
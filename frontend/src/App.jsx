import { useState } from "react";
import "./App.css";

import ResearcherProfileForm from "./components/ResearcherProfileForm";
import ResearcherProfileList from "./components/ResearcherProfileList";

function App() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const refreshProfiles = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <ResearcherProfileForm
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        refreshProfiles={refreshProfiles}
      />

      <ResearcherProfileList
        setSelectedProfile={setSelectedProfile}
        refresh={refresh}
        refreshProfiles={refreshProfiles}
      />
    </>
  );
}

export default App;
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Researchers from "./pages/Researchers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Profile from "./pages/Profile";
import MyPublications from "./pages/MyPublications";
import SearchPublications from "./pages/SearchPublications";
import Search from "./pages/Search";
import ResearcherProfile from "./pages/ResearcherProfile";
import PublicationDetails from "./pages/PublicationDetails";
import ConferenceDetails from "./pages/ConferenceDetails";
import Analytics from "./pages/Analytics";
import NetworkGraph from "./pages/NetworkGraph";
import Settings from "./pages/Settings";
import Collaborations from "./pages/Collaborations";
import Workspace from "./pages/Workspace";
import Chat from "./pages/Chat";
import ConferenceOrganization from "./pages/ConferenceOrganization";
import InstitutionManagement from "./pages/InstitutionManagement";
import InstitutionDetails from "./pages/InstitutionDetails";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import ResearchGroups from "./pages/ResearchGroups";
import Invitations from "./pages/Invitations";
import GroupWorkspace from "./pages/GroupWorkspace";
import Citations from "./pages/Citations";

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Dashboard Layout */}
                <Route element={<DashboardLayout theme={theme} toggleTheme={toggleTheme} />}>
                    <Route path="/dashboard" element={<DashboardHome />} />
                    <Route path="/researchers" element={<Researchers />} />
                    <Route path="/researcher/:id" element={<ResearcherProfile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/publications" element={<MyPublications />} />
                    <Route path="/my-publications" element={<MyPublications />} />
                    <Route path="/search-publications" element={<SearchPublications />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/citations" element={<Citations />} />

                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/network" element={<NetworkGraph />} />
                    <Route path="/publication/:id" element={<PublicationDetails />} />
                    <Route path="/conference" element={<ConferenceOrganization />} />
                    <Route path="/conference/:id" element={<ConferenceDetails />} />
                    <Route path="/institution" element={<InstitutionDashboard />} />
                    <Route path="/institution/manage" element={<InstitutionManagement />} />
                    <Route path="/institution/:id" element={<InstitutionDetails />} />

                    <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
                    <Route path="/collaborations" element={<Collaborations />} />
                    <Route path="/workspace/:id" element={<Workspace />} />
                    <Route path="/chat/:id" element={<Chat />} />
                    
                    <Route path="/groups"element={<ResearchGroups />}/>
<Route
    path="/invitations"
    element={<Invitations />}
/>
<Route
    path="/groups/:groupId"
    element={<GroupWorkspace />}
/>


                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

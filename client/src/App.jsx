import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Researchers from "./pages/Researchers";
import VerificationPending from "./pages/VerificationPending";
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
import GroupChat from "./pages/GroupChat";
import ConferenceOrganization from "./pages/ConferenceOrganization";
import InstitutionManagement from "./pages/InstitutionManagement";
import InstitutionDetails from "./pages/InstitutionDetails";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import ResearchGroups from "./pages/ResearchGroups";
import Invitations from "./pages/Invitations";
import GroupWorkspace from "./pages/GroupWorkspace";

import Chat from "./pages/Chat";
import Verification from "./pages/Verification";
import ProtectedRoute from "./components/ProtectedRoute";
import VerificationRequests from "./pages/VerificationRequests";
import Notifications from "./pages/Notifications";
import ResearchAI from "./pages/ResearchAI";
import Reports from "./pages/Reports";
import PublicationResearchAI from "./pages/PublicationResearchAI";
import ResearchTrends from "./pages/ResearchTrends";


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
<Route
    element={
        <DashboardLayout
            theme={theme}
            toggleTheme={toggleTheme}
        />
    }
>

    <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <DashboardHome />
            </ProtectedRoute>
        }
    />

    <Route
        path="/notifications"
        element={
            <ProtectedRoute>
                <Notifications />
            </ProtectedRoute>
        }
    />

    <Route path="/research-ai" element={<ProtectedRoute><ResearchAI /></ProtectedRoute>} />
    <Route path="/research-ai/publication/:publicationId" element={<ProtectedRoute><PublicationResearchAI /></ProtectedRoute>} />
    <Route path="/research-ai/trends" element={<ProtectedRoute><ResearchTrends /></ProtectedRoute>} />

    <Route
        path="/researchers"
        element={
            <ProtectedRoute>
                <Researchers />
            </ProtectedRoute>
        }
    />

    <Route
        path="/researcher/:id"
        element={
            <ProtectedRoute>
                <ResearcherProfile />
            </ProtectedRoute>
        }
    />

    <Route
        path="/profile"
        element={
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
        }
    />

    <Route
        path="/publications"
        element={
            <ProtectedRoute>
                <MyPublications />
            </ProtectedRoute>
        }
    />

    <Route
        path="/my-publications"
        element={
            <ProtectedRoute>
                <MyPublications />
            </ProtectedRoute>
        }
    />

    <Route
        path="/search-publications"
        element={
            <ProtectedRoute>
                <SearchPublications />
            </ProtectedRoute>
        }
    />

    <Route
        path="/search"
        element={
            <ProtectedRoute>
                <Search />
            </ProtectedRoute>
        }
    />

    <Route
        path="/citations"
        element={
            <ProtectedRoute>
                <Citations />
            </ProtectedRoute>
        }
    />

    <Route
        path="/analytics"
        element={
            <ProtectedRoute>
                <Analytics />
            </ProtectedRoute>
        }
    />

    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

    <Route
        path="/network"
        element={
            <ProtectedRoute>
                <NetworkGraph />
            </ProtectedRoute>
        }
    />

    <Route
        path="/publication/:id"
        element={
            <ProtectedRoute>
                <PublicationDetails />
            </ProtectedRoute>
        }
    />

    <Route
        path="/conference"
        element={
            <ProtectedRoute>
                <ConferenceOrganization />
            </ProtectedRoute>
        }
    />

    <Route
        path="/conference/:id"
        element={
            <ProtectedRoute>
                <ConferenceDetails />
            </ProtectedRoute>
        }
    />

    <Route
        path="/institution"
        element={
            <ProtectedRoute>
                <InstitutionDashboard />
            </ProtectedRoute>
        }
    />

    <Route
        path="/institution/manage"
        element={
            <ProtectedRoute allowedRoles={["Institution Admin"]}>
                <InstitutionManagement />
            </ProtectedRoute>
        }
    />

    <Route
        path="/institution/:id"
        element={
            <ProtectedRoute>
                <InstitutionDetails />
            </ProtectedRoute>
        }
    />

    <Route
        path="/settings"
        element={
            <ProtectedRoute>
                <Settings
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            </ProtectedRoute>
        }
    />

    <Route
        path="/collaborations"
        element={
            <ProtectedRoute>
                <Collaborations />
            </ProtectedRoute>
        }
    />

    <Route
        path="/workspace/:id"
        element={
            <ProtectedRoute>
                <Workspace />
            </ProtectedRoute>
        }
    />

    <Route
        path="/groups"
        element={
            <ProtectedRoute>
                <ResearchGroups />
            </ProtectedRoute>
        }
    />

    <Route
        path="/groups/:groupId"
        element={
            <ProtectedRoute>
                <GroupWorkspace />
            </ProtectedRoute>
        }
    />

    <Route
        path="/groups/:groupId/chat"
        element={
            <ProtectedRoute>
                <GroupChat />
            </ProtectedRoute>
        }
    />

    <Route
        path="/chat"
        element={
            <ProtectedRoute>
                <Chat />
            </ProtectedRoute>
        }
    />

    <Route
        path="/invitations"
        element={
            <ProtectedRoute>
                <Invitations />
            </ProtectedRoute>
        }
    />

    <Route
        path="/verification-requests"
        element={
              <ProtectedRoute allowedRoles={["System Admin"]}>
                <VerificationRequests />
            </ProtectedRoute>
        }
    />

</Route>

                {/* Unverified users must not receive the dashboard shell. */}
                <Route path="/verification" element={<Verification />} />
                <Route path="/verification-pending" element={<VerificationPending />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

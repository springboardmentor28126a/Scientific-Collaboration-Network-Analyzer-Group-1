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
import PublicProfile from "./pages/PublicProfile";
import Notifications from "./pages/Notifications";
import Collaborations from "./pages/Collaborations";
import Workspace from "./pages/Workspace";
import Chat from "./pages/Chat";
import ConferenceOrganization from "./pages/ConferenceOrganization";
import InstitutionManagement from "./pages/InstitutionManagement";
import SearchResearch from "./pages/SearchResearch";
import InstitutionDetails from "./pages/InstitutionDetails";
function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Public Routes */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                {/* Dashboard Layout */}

                <Route element={<DashboardLayout />}>
                <Route
    path="/dashboard"
    element={<DashboardHome />}
/>

                    <Route
    path="/researchers"
    element={<Researchers />}
/><Route
    path="/researcher/:id"
    element={<PublicProfile />}
/>

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                   <Route

    path="/my-publications"

    element={<MyPublications />}

/>

<Route

    path="/search-publications"

    element={<SearchPublications />}

/>
                    <Route
    path="/notifications"
    element={<Notifications />}
/>

                </Route>
                <Route
    path="/collaborations"
    element={<Collaborations />}
/>
<Route

    path="/workspace/:id"

    element={<Workspace />}

/>
<Route

    path="/chat/:id"

    element={<Chat />}

/>
<Route

path="/conference"

element={<ConferenceOrganization/>}

/>
<Route

path="/institution"

element={<InstitutionManagement/>}

/>
<Route

path="/search"

element={<SearchResearch/>}

/>
<Route
    path="/institution/:id"
    element={<InstitutionDetails />}
/>
            </Routes>

        </BrowserRouter>

    );

}

export default App;
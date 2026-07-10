import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Profile from "./pages/Profile";
import Publications from "./pages/Publications";

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
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/publications"
                        element={<Publications />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default App;
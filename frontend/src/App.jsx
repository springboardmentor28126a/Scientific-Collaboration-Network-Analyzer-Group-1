import { Routes, Route } from "react-router-dom";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Researcher from "./pages/researcher";
import Publication from "./pages/publication";
import Conference from "./pages/conference";
import Institution from "./pages/institution";
import FileUpload from "./pages/file";

import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <div className="app-container">
            <Toaster 
                position="top-right" 
                toastOptions={{
                    style: {
                        fontSize: '16px',
                        padding: '16px',
                        zIndex: 999999,
                        marginTop: '20px',
                        marginRight: '20px'
                    },
                    containerStyle: {
                        zIndex: 999999,
                    }
                }}
            />

            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/researcher"
                    element={
                        <ProtectedRoute>
                            <Researcher />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/publication"
                    element={
                        <ProtectedRoute>
                            <Publication />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/conference"
                    element={
                        <ProtectedRoute>
                            <Conference />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/institution"
                    element={
                        <ProtectedRoute>
                            <Institution />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <FileUpload />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
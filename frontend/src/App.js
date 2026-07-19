import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavigationBar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Researcher
import Researcher from "./pages/Researcher";
import AddResearcher from "./pages/AddResearcher";
import EditResearcher from "./pages/EditResearcher";

// Publication
import Publication from "./pages/Publication";
import AddPublication from "./pages/AddPublication";
import EditPublication from "./pages/EditPublication";

// Conference
import Conference from "./pages/Conference";
import AddConference from "./pages/AddConference";
import EditConference from "./pages/EditConference";

// Collaboration
import Collaboration from "./pages/Collaboration";
import EditCollaboration from "./pages/EditCollaboration";

// Project
import Project from "./pages/Project";

// Review
import ReviewQueue from "./pages/ReviewQueue";
import MyReviews from "./pages/MyReviews";

// Institution
import Institution from "./pages/Institution";
import AddInstitution from "./pages/AddInstitution";
import EditInstitution from "./pages/EditInstitution";


function App() {

  return (

    <BrowserRouter>

      <NavigationBar />

      <Routes>


        {/* Home & Auth */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* Researcher */}
        <Route path="/researcher" element={<Researcher />} />

        <Route 
          path="/add-researcher" 
          element={<AddResearcher />} 
        />

        <Route 
          path="/edit-researcher/:id" 
          element={<EditResearcher />} 
        />



        {/* Publication */}
        <Route 
          path="/publication" 
          element={<Publication />} 
        />

        <Route 
          path="/add-publication" 
          element={<AddPublication />} 
        />

        <Route 
          path="/edit-publication/:id" 
          element={<EditPublication />} 
        />



        {/* Conference */}
        <Route 
          path="/conference" 
          element={<Conference />} 
        />

        <Route 
          path="/add-conference" 
          element={<AddConference />} 
        />

        <Route 
          path="/edit-conference/:id" 
          element={<EditConference />} 
        />



        {/* Collaboration */}
        <Route 
          path="/collaboration" 
          element={<Collaboration />} 
        />

        <Route 
          path="/edit-collaboration/:id" 
          element={<EditCollaboration />} 
        />



        {/* Project */}
        <Route 
          path="/project" 
          element={<Project />} 
        />



        {/* Review */}
        <Route 
          path="/reviewqueue" 
          element={<ReviewQueue />} 
        />

        <Route 
          path="/myreviews" 
          element={<MyReviews />} 
        />



        {/* Institution */}
        <Route 
          path="/institution" 
          element={<Institution />} 
        />

        <Route 
          path="/add-institution" 
          element={<AddInstitution />} 
        />

        <Route 
          path="/edit-institution/:id" 
          element={<EditInstitution />} 
        />


      </Routes>


    </BrowserRouter>

  );

}


export default App;
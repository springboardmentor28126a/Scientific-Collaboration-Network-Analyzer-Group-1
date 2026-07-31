import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

import { Container } from "react-bootstrap";

import PublicationStatusChart from "../charts/PublicationStatusChart";
import PublicationYearChart from "../charts/PublicationYearChart";


function Dashboard() {

  const [stats, setStats] = useState({
    researchers: 0,
    publications: 0,
    conferences: 0,
    collaborations: 0,
    projects: 0,
    institutions: 0,
    reviews: 0,
  });


  useEffect(() => {
    fetchDashboard();
  }, []);


  const fetchDashboard = async () => {
    try {

      const response = await API.get("/report/summary");


      setStats({
        researchers: response.data.total_researchers,
        publications: response.data.total_publications,
        conferences: response.data.total_conferences,
        collaborations: response.data.total_collaborations,
        projects: response.data.total_projects,
        institutions: response.data.total_institutions || 0,
        reviews: response.data.total_reviews || 0,
      });


    } catch (error) {

      console.log("Failed to load dashboard", error);

    }
  };


  return (

    <Container className="mt-4">

      <h1>Dashboard</h1>

      <h2>
        Welcome to Scientific Collaboration Network Analyzer
      </h2>

      <hr />


      <h2>System Statistics</h2>


      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "500px",
          marginBottom: "30px",
        }}
      >

        <tbody>


          <tr>
            <td><b>Researchers</b></td>
            <td>{stats.researchers}</td>
          </tr>


          <tr>
            <td><b>Publications</b></td>
            <td>{stats.publications}</td>
          </tr>


          <tr>
            <td><b>Conferences</b></td>
            <td>{stats.conferences}</td>
          </tr>


          <tr>
            <td><b>Collaborations</b></td>
            <td>{stats.collaborations}</td>
          </tr>


          <tr>
            <td><b>Projects</b></td>
            <td>{stats.projects}</td>
          </tr>


          <tr>
            <td><b>Institutions</b></td>
            <td>{stats.institutions}</td>
          </tr>


          <tr>
            <td><b>Reviews</b></td>
            <td>{stats.reviews}</td>
          </tr>


        </tbody>

      </table>


      <hr />


      <h2>Publication Analytics</h2>


      <div
        style={{
          display: "flex",
          gap: "50px",
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: "30px",
        }}
      >

        <PublicationStatusChart />

        <PublicationYearChart />

      </div>


      <hr />


      <h3>Researcher Management</h3>


      <Link to="/add-researcher">
        <button>Add Researcher</button>
      </Link>


      <br />
      <br />


      <Link to="/researcher">
        <button>
          View Researchers
        </button>
      </Link>



      <hr />



      <h3>Publication Management</h3>


      <Link to="/add-publication">
        <button>
          Add Publication
        </button>
      </Link>


      <br />
      <br />


      <Link to="/publication">
        <button>
          View Publications
        </button>
      </Link>



      <hr />



      <h3>Review Management</h3>


      <Link to="/reviewqueue">
        <button>
          Review Queue
        </button>
      </Link>


      <br />
      <br />


      <Link to="/myreviews">
        <button>
          My Reviews
        </button>
      </Link>



      <hr />



      <h3>Institution Management</h3>


      <Link to="/institution">
        <button>
          View Institutions
        </button>
      </Link>


      <br />
      <br />


      <Link to="/add-institution">
        <button>
          Add Institution
        </button>
      </Link>



      <hr />


      <Link to="/">
        <button>
          Logout
        </button>
      </Link>


    </Container>

  );

}


export default Dashboard;
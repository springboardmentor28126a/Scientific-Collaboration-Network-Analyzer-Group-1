import { useEffect, useState } from "react";
import { Search, CalendarDays, Edit, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/api";


function Conference() {

  const [conferences, setConferences] = useState([]);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);


  const [form, setForm] = useState({
    name: "",
    acronym: "",
    location: "",
    conference_date: "",
    organizer: "",
    description: ""
  });



  // GET ALL CONFERENCES

  const fetchConferences = async () => {

    try {

      const response = await api.get("/conferences");
      
      console.log("Conferences from API:", response.data);

      setConferences(response.data);

    }

    catch(error) {

      console.log(error);

    }

  };



  useEffect(() => {

    fetchConferences();

  }, []);





  // ADD / UPDATE CONFERENCE

  const handleSubmit = async (e) => {

    e.preventDefault();


    try {


      if(editingId) {


        await api.put(
          `/conferences/${editingId}`,
          form
        );


        setEditingId(null);


      }

      else {


        await api.post(
          "/conferences",
          form
        );


      }



      setForm({

        name: "",
        acronym: "",
        location: "",
        conference_date: "",
        organizer: "",
        description: ""

      });


      fetchConferences();


    }


    catch(error) {

      console.log(error);

    }


  };






  // DELETE

  const deleteConference = async(id) => {


    try {


      await api.delete(
        `/conferences/${id}`
      );


      fetchConferences();


    }

    catch(error) {

      console.log(error);

    }


  };






  // EDIT

  const editConference = (conference) => {


    setEditingId(conference.id);


    setForm({

      name: conference.name,

      acronym: conference.acronym,

      location: conference.location,

      conference_date: conference.conference_date,

      organizer: conference.organizer,

      description: conference.description

    });


  };







  return (

    <div className="institutions-page">


      <Navbar />



      <div className="page-header">


        <CalendarDays size={45}/>


        <div>

          <h1>
            Conference Management
          </h1>


          <p>
            Manage conferences and event information.
          </p>


        </div>


      </div>






      {/* FORM */}


      <div className="institution-form">


        <h2>

          {editingId
          ? "Update Conference"
          : "Add New Conference"}

        </h2>



        <form onSubmit={handleSubmit}>


          <input

          placeholder="Conference Name"

          value={form.name}

          onChange={(e)=>
            setForm({...form,name:e.target.value})
          }

          required

          />




          <input

          placeholder="Acronym"

          value={form.acronym}

          onChange={(e)=>
            setForm({...form,acronym:e.target.value})
          }

          />




          <input

          placeholder="Location"

          value={form.location}

          onChange={(e)=>
            setForm({...form,location:e.target.value})
          }

          />




          <input

          type="date"

          value={form.conference_date}

          onChange={(e)=>
            setForm({...form,conference_date:e.target.value})
          }

          />




          <input

          placeholder="Organizer"

          value={form.organizer}

          onChange={(e)=>
            setForm({...form,organizer:e.target.value})
          }

          />




          <textarea

          placeholder="Description"

          value={form.description}

          onChange={(e)=>
            setForm({...form,description:e.target.value})
          }

          />




          <button type="submit">

            {editingId
            ? "Update"
            : "Add Conference"}

          </button>



        </form>


      </div>







      {/* SEARCH */}


      <div className="search-box">


        <Search/>


        <input

        placeholder="Search conference..."

        value={search}

        onChange={(e)=>setSearch(e.target.value)}

        />


      </div>









      {/* TABLE */}



      <div className="institution-table-container">


      <table className="institution-table">


        <thead>

          <tr>

            <th>Name</th>

            <th>Acronym</th>

            <th>Location</th>

            <th>Date</th>

            <th>Organizer</th>

            <th>Description</th>

            <th>Actions</th>

          </tr>

        </thead>





        <tbody>


        {


        conferences

        .filter((item)=>

          item.name
          .toLowerCase()
          .includes(search.toLowerCase())

        )


        .map((item)=>(


          <tr key={item.id}>


            <td>
              {item.name}
            </td>



            <td>
              {item.acronym || "-"}
            </td>



            <td>
              {item.location || "-"}
            </td>



            <td>
              {item.conference_date || "-"}
            </td>



            <td>
              {item.organizer || "-"}
            </td>



            <td>
              {item.description || "-"}
            </td>





            <td>


              <div className="action-buttons">



              <button

              className="edit-btn"

              onClick={()=>
                editConference(item)
              }

              >

              <Edit size={16}/>

              Edit

              </button>





              <button

              className="delete-btn"

              onClick={()=>
                deleteConference(item.id)
              }

              >

              <Trash2 size={16}/>

              Delete


              </button>



              </div>


            </td>



          </tr>


        ))


        }


        </tbody>


      </table>


      </div>



    </div>

  );

}


export default Conference;
import { useEffect, useState } from "react";
import { Search, Building2, Edit, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/api";


function Institutions() {

  const [institutions, setInstitutions] = useState([]);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);


  const [form, setForm] = useState({

    name:"",
    type:"",
    address:"",
    website:""

  });



  // GET ALL INSTITUTIONS

  const fetchInstitutions = async()=>{

    try{

      const response = await api.get("/institutions");

      setInstitutions(response.data);

    }

    catch(error){

      console.log(error);

    }

  };



  useEffect(()=>{

    fetchInstitutions();

  },[]);





  // ADD / UPDATE INSTITUTION


  const handleSubmit = async(e)=>{

    e.preventDefault();


    try{


      if(editingId){

        await api.put(
          `/institutions/${editingId}`,
          form
        );


        setEditingId(null);


      }

      else{


        await api.post(
          "/institutions",
          form
        );


      }



      setForm({

        name:"",
        type:"",
        address:"",
        website:""

      });


      fetchInstitutions();



    }

    catch(error){

      console.log(error);

    }

  };





  // DELETE


  const deleteInstitution = async(id)=>{


    try{


      await api.delete(
        `/institutions/${id}`
      );


      fetchInstitutions();


    }

    catch(error){

      console.log(error);

    }


  };





  // EDIT


  const editInstitution=(institution)=>{


    setEditingId(institution.id);


    setForm({

      name:institution.name,

      type:institution.type,

      address:institution.address,

      website:institution.website


    });


  };






  return (

    <div className="institutions-page">


      <Navbar />


      <div className="page-header">


        <Building2 size={45}/>


        <div>

          <h1>
            Institution Management
          </h1>


          <p>
            Manage research institutions and organization details.
          </p>


        </div>


      </div>





      {/* FORM */}


      <div className="institution-form">


        <h2>

          {editingId 
          ? "Update Institution"
          : "Add New Institution"}

        </h2>



        <form onSubmit={handleSubmit}>


          <input

          placeholder="Institution Name"

          value={form.name}

          onChange={(e)=>
            setForm({...form,name:e.target.value})
          }

          required

          />




          <input

          placeholder="Institution Type"

          value={form.type}

          onChange={(e)=>
            setForm({...form,type:e.target.value})
          }

          required

          />




          <input

          placeholder="Address"

          value={form.address}

          onChange={(e)=>
            setForm({...form,address:e.target.value})
          }

          required

          />




          <input

          placeholder="Website"

          value={form.website}

          onChange={(e)=>
            setForm({...form,website:e.target.value})
          }

          />




          <button type="submit">

            {editingId 
            ? "Update"
            : "Add Institution"}

          </button>


        </form>


      </div>







      {/* SEARCH */}


      <div className="search-box">


        <Search/>


        <input

        placeholder="Search institution..."

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

            <th>Type</th>

            <th>Address</th>

            <th>Website</th>

            <th>Actions</th>

          </tr>

        </thead>



        <tbody>


        {

        institutions

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
              {item.type}
            </td>



            <td>
              {item.address}
            </td>



            <td>

              {item.website || "-"}

            </td>




            <td>


              <div className="action-buttons">


              <button

              className="edit-btn"

              onClick={()=>
                editInstitution(item)
              }

              >

              <Edit size={16}/>

              Edit

              </button>




              <button

              className="delete-btn"

              onClick={()=>
                deleteInstitution(item.id)
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


export default Institutions;
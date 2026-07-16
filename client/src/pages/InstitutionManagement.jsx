import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function InstitutionManagement() {

    const [institutions, setInstitutions] = useState([]);

    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        
        id: null,

        name: "",

        address: "",

        city: "",

        state: "",

        country: "",

        website: "",

        email: "",

        phone: "",

        description: ""

    });

    useEffect(() => {

        loadInstitutions();

    }, []);

    const loadInstitutions = async () => {

        try {

            const response = await API.get("/institution/");

            setInstitutions(response.data);

        }

        catch(error){

            console.log(error);

        }

    };

    const handleChange = (e)=>{

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    };

    const addInstitution = async()=>{

        try{

            await API.post(

                "/institution/",

                form

            );

            alert("Institution Added Successfully");

            loadInstitutions();

            setForm({

                id:null,

                name:"",

                address:"",

                city:"",

                state:"",

                country:"",

                website:"",

                email:"",

                phone:"",

                description:""

            });

        }

        catch(error){

            console.log(error);

        }

    };

    const deleteInstitution = async(id)=>{

        try{

            await API.delete(

                `/institution/${id}`

            );

            alert("Institution Deleted");

            loadInstitutions();

        }

        catch(error){

            console.log(error);

        }

    };

    const filteredInstitutions = institutions.filter(

        institution=>

            institution.name

            .toLowerCase()

            .includes(

                search.toLowerCase()

            )

    );

    const statsCard={

        background:"white",

        padding:"25px",

        borderRadius:"15px",

        textAlign:"center",

        boxShadow:"0 5px 15px rgba(0,0,0,.1)"

    };

    return(

        <div style={{padding:"30px"}}>

            <h1>

                🏫 Institution Management

            </h1>
            <div

style={{

display:"grid",

gridTemplateColumns:"repeat(4,1fr)",

gap:"20px",

marginTop:"30px",

marginBottom:"30px"

}}

>

<div style={statsCard}>

<h3>

🏫 Total Institutions

</h3>

<h1>

{institutions.length}

</h1>

</div>

<div style={statsCard}>

<h3>

🌍 Countries

</h3>

<h1>

{

new Set(

institutions.map(

i=>i.country

)

).size

}

</h1>

</div>

<div style={statsCard}>

<h3>

🏙 Cities

</h3>

<h1>

{

new Set(

institutions.map(

i=>i.city

)

).size

}

</h1>

</div>

<div style={statsCard}>

<h3>

📧 Emails

</h3>

<h1>

{

institutions.filter(

i=>i.email

).length

}

</h1>

</div>

</div>
<input

type="text"

placeholder="Search Institution..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

style={{

width:"350px",

padding:"12px",

marginBottom:"30px"

}}

/>
<div

style={{

display:"grid",

gap:"15px"

}}

>

<input

type="text"

name="name"

placeholder="Institution Name"

value={form.name}

onChange={handleChange}

/>

<input

type="text"

name="address"

placeholder="Address"

value={form.address}

onChange={handleChange}

/>

<input

type="text"

name="city"

placeholder="City"

value={form.city}

onChange={handleChange}

/>

<input

type="text"

name="state"

placeholder="State"

value={form.state}

onChange={handleChange}

/>

<input

type="text"

name="country"

placeholder="Country"

value={form.country}

onChange={handleChange}

/>

<input

type="text"

name="website"

placeholder="Website"

value={form.website}

onChange={handleChange}

/>

<input

type="email"

name="email"

placeholder="Email"

value={form.email}

onChange={handleChange}

/>

<input

type="text"

name="phone"

placeholder="Phone"

value={form.phone}

onChange={handleChange}

/>

<textarea

name="description"

placeholder="Description"

rows="4"

value={form.description}

onChange={handleChange}

/>

<button

onClick={addInstitution}

>

➕ Add Institution

</button>

</div>
<div

style={{

display:"grid",

gridTemplateColumns:"repeat(auto-fill,minmax(350px,1fr))",

gap:"20px",

marginTop:"40px"

}}

>

{

filteredInstitutions.map((institution)=>(

<div

key={institution.id}

style={{

background:"white",

padding:"20px",

borderRadius:"15px",

boxShadow:"0 5px 15px rgba(0,0,0,.1)"

}}

>

<h2>

🏫 {institution.name}

</h2>

<p>

<b>📍 Address:</b>

{institution.address}

</p>

<p>

<b>🏙 City:</b>

{institution.city}

</p>

<p>

<b>🌍 Country:</b>

{institution.country}

</p>

<p>

<b>📧 Email:</b>

{institution.email}

</p>

<p>

<b>📞 Phone:</b>

{institution.phone}

</p>

<div

style={{

display:"flex",

justifyContent:"space-between",

marginTop:"20px"

}}

>

<button
    onClick={() =>
        navigate(
            `/institution/${institution.id}`
        )
    }
>

    👁 View

</button>

<button>

✏ Edit

</button>

<button

onClick={()=>

deleteInstitution(

institution.id

)

}

>

🗑 Delete

</button>

</div>

</div>

))

}

</div>

</div>

);

}

export default InstitutionManagement;
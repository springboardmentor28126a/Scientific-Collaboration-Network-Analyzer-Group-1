import { useEffect, useState } from "react";
import API from "../services/api";

function SearchResearch(){

    const [search,setSearch]=useState("");

    const [publications,setPublications]=useState([]);

    const [researchers,setResearchers]=useState([]);

    const [institutions,setInstitutions]=useState([]);

    const [conferences,setConferences]=useState([]);

    useEffect(()=>{

        loadData();

    },[]);

    const loadData=async()=>{

        try{

            const pubs=await API.get("/publications/");

            const researchers=await API.get("/researcher/");

            const institutions=await API.get("/institution/");

            const conferences=await API.get("/conference/");

            setPublications(pubs.data);

            setResearchers(researchers.data);

            setInstitutions(institutions.data);

            setConferences(conferences.data);

        }

        catch(error){

            console.log(error);

        }

    };
    const filteredPublications =

    publications.filter(

        publication =>

            publication.title

                .toLowerCase()

                .includes(

                    search.toLowerCase()

                )

    );
    const filteredResearchers =

researchers.filter(

researcher=>

researcher.name

.toLowerCase()

.includes(

search.toLowerCase()

)

);
const filteredInstitutions=

institutions.filter(

institution=>

institution.name

.toLowerCase()

.includes(

search.toLowerCase()

)

);
const filteredConferences=

conferences.filter(

conference=>

conference.name

.toLowerCase()

.includes(

search.toLowerCase()

)

);

    return(

    <div style={{padding:"30px"}}>

        <h1>

            🔍 Research Search

        </h1>

        <input

            type="text"

            placeholder="Search Publications, Researchers, Institutions..."

            value={search}

            onChange={(e)=>

                setSearch(

                    e.target.value

                )

            }

            style={{

                width:"500px",

                padding:"12px",

                marginTop:"25px",

                marginBottom:"30px",

                borderRadius:"8px"

            }}

        />
        <h2>

    📚 Publications

</h2>

{

filteredPublications.length===0

?

<p>

No Publications Found

</p>

:

filteredPublications.map((publication)=>(

<div

key={publication.id}

style={{

background:"white",

padding:"20px",

marginBottom:"15px",

borderRadius:"10px",

boxShadow:"0 3px 10px rgba(0,0,0,.1)"

}}

>

<h3>

{publication.title}

</h3>

<p>

<b>Authors:</b>

{" "}

{publication.authors}

</p>

<p>

<b>Journal:</b>

{" "}

{publication.journal}

</p>

<p>

<b>Year:</b>

{" "}

{publication.publication_year}

</p>

</div>

))

}

<h2>

👨 Researchers

</h2>

{

filteredResearchers.length===0

?

<p>

No Researchers Found

</p>

:

filteredResearchers.map((researcher)=>(

<div

key={researcher.id}

style={{

background:"white",

padding:"20px",

marginBottom:"15px",

borderRadius:"10px"

}}

>

<h3>

{researcher.name}

</h3>

<p>

{researcher.email}

</p>

</div>

))

}
<h2>

🏫 Institutions

</h2>

{

filteredInstitutions.map((institution)=>(

<div

key={institution.id}

style={{

background:"white",

padding:"20px",

marginBottom:"15px",

borderRadius:"10px"

}}

>

<h3>

{institution.name}

</h3>

<p>

{institution.city},

{" "}

{institution.country}

</p>

</div>

))

}
<h2>

🏛 Conferences

</h2>

{

filteredConferences.map((conference)=>(

<div

key={conference.id}

style={{

background:"white",

padding:"20px",

marginBottom:"15px",

borderRadius:"10px"

}}

>

<h3>

{conference.name}

</h3>

<p>

{conference.location}

</p>

</div>

))

}
    </div>

);

}

export default SearchResearch;
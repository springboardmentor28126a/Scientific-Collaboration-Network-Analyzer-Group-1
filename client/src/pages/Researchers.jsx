import { useEffect, useState } from "react";
import api from "../services/api";
import ResearcherCard from "../components/ResearcherCard";
function Researchers() {

    const [researchers, setResearchers] = useState([]);
    const [search, setSearch] = useState("");
    useEffect(() => {

        fetchResearchers();

    }, []);

    const fetchResearchers = async () => {

        try {

            const response = await api.get("/researcher/all");

            setResearchers(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div>

            <h1>Researchers</h1>

            <p>
                Search and collaborate with researchers.
            </p>
            <input
    type="text"
    placeholder="Search by name, institution, department..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
        width: "100%",
        padding: "12px",
        marginTop: "20px",
        borderRadius: "10px",
        border: "1px solid #ccc"
    }}
/>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                    gap: "20px",
                    marginTop: "30px"
                }}
            >

              {
    researchers
        .filter((researcher) => {

            const text = search.toLowerCase();

            return (

                researcher.name?.toLowerCase().includes(text) ||

                researcher.institution?.toLowerCase().includes(text) ||

                researcher.department?.toLowerCase().includes(text) ||

                researcher.research_interest?.toLowerCase().includes(text) ||

                researcher.country?.toLowerCase().includes(text)

            );

        })
        

            .map((researcher) => (

    <ResearcherCard
        key={researcher.id}
        researcher={researcher}
    />

))
}  
                  
                

            </div>

        </div>

    );

}

export default Researchers;
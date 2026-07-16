import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function InstitutionDetails() {

    const { id } = useParams();

    const [data, setData] = useState(null);

    useEffect(() => {

        loadInstitution();

    }, []);

    const loadInstitution = async () => {

        try {

            const response = await API.get(
                `/institution/details/${id}`
            );

            setData(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };
    const cardStyle = {

    background: "white",

    padding: "20px",

    borderRadius: "15px",

    textAlign: "center",

    boxShadow: "0 5px 15px rgba(0,0,0,.1)"

};

    if (!data) {

        return <h2>Loading...</h2>;

    }

    return (

        <div style={{ padding: "30px" }}>

           <div
    style={{
        background: "white",
        padding: "25px",
        borderRadius: "15px",
        marginBottom: "30px"
    }}
>

    <h1>

        🏫 {data.institution.name}

    </h1>

    <p>

        📍 {data.institution.address}

    </p>

    <p>

        🌍 {data.institution.country}

    </p>

    <p>

        🌐 {data.institution.website}

    </p>

    <p>

        📧 {data.institution.email}

    </p>

</div>
<div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "20px",
        marginBottom: "30px"
    }}
>

    <div style={cardStyle}>

        <h3>Researchers</h3>

        <h1>{data.statistics.researchers}</h1>

    </div>

    <div style={cardStyle}>

        <h3>Publications</h3>

        <h1>{data.statistics.publications}</h1>

    </div>

    <div style={cardStyle}>

        <h3>Conferences</h3>

        <h1>{data.statistics.conferences}</h1>

    </div>

</div>
<h2>👨 Researchers</h2>

{
    data.researchers.map((researcher) => (

        <div
            key={researcher.id}
            style={{
                background: "#fff",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px"
            }}
        >

            <h3>{researcher.name}</h3>

            <p>{researcher.email}</p>

        </div>

    ))
}
<h2>📚 Publications</h2>

{
    data.publications.map((publication) => (

        <div
            key={publication.id}
            style={{
                background: "#fff",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px"
            }}
        >

            <h3>{publication.title}</h3>

            <p>{publication.authors}</p>

            <p>{publication.journal}</p>

        </div>

    ))
}
<h2>🏛 Conferences</h2>

{
    data.conferences.map((conference) => (

        <div
            key={conference.id}
            style={{
                background: "#fff",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px"
            }}
        >

            <h3>{conference.name}</h3>

            <p>{conference.location}</p>

        </div>

    ))
}

        </div>

    );

}

export default InstitutionDetails;
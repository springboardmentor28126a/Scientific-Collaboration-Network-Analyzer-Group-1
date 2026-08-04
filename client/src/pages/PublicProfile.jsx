import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function PublicProfile() {

    const { id } = useParams();

    const [researcher, setResearcher] = useState(null);

    useEffect(() => {

        fetchResearcher();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchResearcher = async () => {

        try {

            const response = await api.get(`/researcher/${id}`);

            setResearcher(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    if (!researcher)
        return <h2>Loading...</h2>;

    return (

        <div>

            <h1>{researcher.name}</h1>

            <p>🏫 <b>Institution:</b> {researcher.institution || "Not Added"}</p>

            <p>💻 <b>Department:</b> {researcher.department || "Not Added"}</p>

            <p>🔬 <b>Research Interest:</b> {researcher.research_interest || "Not Added"}</p>

            <p>⭐ <b>Skills:</b> {researcher.skills || "Not Added"}</p>

            <p>🌍 <b>Country:</b> {researcher.country || "Not Added"}</p>

            <p>📞 <b>Phone:</b> {researcher.phone || "Not Added"}</p>

            <p>🏢 <b>Designation:</b> {researcher.designation || "Not Added"}</p>

            <p>📝 <b>Bio:</b> {researcher.bio || "Not Added"}</p>

            <p>🔗 <b>LinkedIn:</b> {researcher.linkedin || "Not Added"}</p>

            <p>🆔 <b>ORCID:</b> {researcher.orcid || "Not Added"}</p>

            <p>🎓 <b>Google Scholar:</b> {researcher.google_scholar || "Not Added"}</p>

            <button>

                Connect

            </button>

        </div>

    );

}

export default PublicProfile;

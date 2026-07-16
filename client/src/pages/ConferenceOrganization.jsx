import { useEffect, useState } from "react";
import API from "../services/api";
import ConferenceDetailsModal from "../components/conference/ConferenceDetailsModal";

function ConferenceOrganization() {

    const [conferences, setConferences] = useState([]);
    const [selectedConference, setSelectedConference] = useState(null);
    const [editingConference, setEditingConference] = useState(null);

    const [searchConference, setSearchConference] = useState("");

    const [form, setForm] = useState({

        id: null,

        name: "",

        organizer: "",

        location: "",

        start_date: "",

        end_date: "",

        website: "",

        description: ""

    });

    useEffect(() => {

        loadConferences();

    }, []);

    const loadConferences = async () => {

        try {

            const response = await API.get("/conference/");

            setConferences(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const addConference = async () => {

        try {

            await API.post(

                "/conference/",

                form

            );

            alert("Conference Added Successfully");

            loadConferences();

            setForm({

                id: null,

                name: "",

                organizer: "",

                location: "",

                start_date: "",

                end_date: "",

                website: "",

                description: ""

            });

        }

        catch (error) {

            console.log(error);

        }

    };

    const loadConference = async (id) => {

        try {

            const response = await API.get(

                `/conference/${id}`

            );

            setSelectedConference(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const deleteConference = async (id) => {

        try {

            await API.delete(

                `/conference/${id}`

            );

            alert("Conference Deleted Successfully");

            loadConferences();

        }

        catch (error) {

            console.log(error);

        }

    };

    const today = new Date();

    const totalConferences = conferences.length;

    const upcomingConferences = conferences.filter(

        conference =>

            new Date(conference.start_date) > today

    ).length;

    const ongoingConferences = conferences.filter(

        conference =>

            new Date(conference.start_date) <= today &&

            new Date(conference.end_date) >= today

    ).length;

    const completedConferences = conferences.filter(

        conference =>

            new Date(conference.end_date) < today

    ).length;

    const filteredConferences = conferences.filter(

        conference =>

            conference.name

                .toLowerCase()

                .includes(

                    searchConference.toLowerCase()

                )

    );

    const statsCard = {

        background: "white",

        padding: "25px",

        borderRadius: "15px",

        textAlign: "center",

        boxShadow: "0 5px 15px rgba(0,0,0,.1)"

    };

    return (

        <div style={{ padding: "30px" }}>

            <h1>

                🏛 Conference Organization

            </h1>

            <div

                style={{

                    display: "grid",

                    gridTemplateColumns: "repeat(4,1fr)",

                    gap: "20px",

                    marginTop: "30px",

                    marginBottom: "30px"

                }}

            >

                <div style={statsCard}>

                    <h3>🏛 Total</h3>

                    <h1>{totalConferences}</h1>

                </div>

                <div style={statsCard}>

                    <h3>🟢 Upcoming</h3>

                    <h1>{upcomingConferences}</h1>

                </div>

                <div style={statsCard}>

                    <h3>🔵 Ongoing</h3>

                    <h1>{ongoingConferences}</h1>

                </div>

                <div style={statsCard}>

                    <h3>⚪ Completed</h3>

                    <h1>{completedConferences}</h1>

                </div>

            </div>

            <input

                type="text"

                placeholder="Search Conference..."

                value={searchConference}

                onChange={(e) =>

                    setSearchConference(

                        e.target.value

                    )

                }

                style={{

                    width: "350px",

                    padding: "12px",

                    marginBottom: "25px"

                }}

            />

            <div

                style={{

                    display: "grid",

                    gap: "15px",

                    marginBottom: "40px"

                }}

            >
                <input
                    type="text"
                    name="name"
                    placeholder="Conference Name"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="organizer"
                    placeholder="Organizer"
                    value={form.organizer}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="website"
                    placeholder="Website"
                    value={form.website}
                    onChange={handleChange}
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                />

                <button

                    onClick={addConference}

                    style={{

                        background:"#2563eb",

                        color:"white",

                        border:"none",

                        padding:"12px",

                        borderRadius:"8px",

                        cursor:"pointer"

                    }}

                >

                    ➕ Add Conference

                </button>

            </div>

            <div

                style={{

                    display:"grid",

                    gridTemplateColumns:"repeat(auto-fill,minmax(350px,1fr))",

                    gap:"20px"

                }}

            >

                {

                    filteredConferences.map((conference)=>(

                        <div

                            key={conference.id}

                            style={{

                                background:"white",

                                borderRadius:"15px",

                                padding:"20px",

                                boxShadow:"0 5px 15px rgba(0,0,0,.1)"

                            }}

                        >

                            <h2 style={{color:"#2563eb"}}>

                                🏛 {conference.name}

                            </h2>

                            <p>

                                <b>Organizer:</b>

                                {" "}

                                {conference.organizer}

                            </p>

                            <p>

                                <b>Location:</b>

                                {" "}

                                {conference.location}

                            </p>

                            <p>

                                <b>Duration:</b>

                                {" "}

                                {conference.start_date}

                                {"  →  "}

                                {conference.end_date}

                            </p>

                            <p>

                                <b>Website:</b>

                                <br/>

                                <a

                                    href={conference.website}

                                    target="_blank"

                                    rel="noreferrer"

                                >

                                    {conference.website}

                                </a>

                            </p>

                            <p>

                                <b>Description:</b>

                            </p>

                            <p

                                style={{

                                    color:"#666"

                                }}

                            >

                                {

                                    conference.description

                                        ?.length>100

                                    ?

                                    conference.description.substring(0,100)+"..."

                                    :

                                    conference.description

                                }

                            </p>

                            <div

                                style={{

                                    display:"flex",

                                    justifyContent:"space-between",

                                    marginTop:"20px"

                                }}

                            >

                                <button

                                    onClick={()=>

                                        loadConference(

                                            conference.id

                                        )

                                    }

                                >

                                    👁 View

                                </button>

                                <button

                                    onClick={()=>

                                        setEditingConference(

                                            conference

                                        )

                                    }

                                >

                                    ✏ Edit

                                </button>

                                <button

                                    onClick={()=>

                                        deleteConference(

                                            conference.id

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

            {

                selectedConference && (

                    <ConferenceDetailsModal

                        conference={selectedConference}

                        onClose={()=>

                            setSelectedConference(null)

                        }

                    />

                )

            }

        </div>

    );

}

export default ConferenceOrganization;
import { useEffect, useState } from "react";
import API from "../services/api";
import ConferenceDetailsModal from "../components/conference/ConferenceDetailsModal";
import Pagination from "../components/Pagination";

function ConferenceOrganization() {

    const [conferences, setConferences] = useState([]);
    const [, setEditingConference] = useState(null);
    const [selectedConference, setSelectedConference] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const [searchConference, setSearchConference] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const [form, setForm] = useState({

        id: null,

        name: "",

        organizer: "",

        location: "",

        start_date: "",

        end_date: "",

        website: "",

        description: "",

        conference_type: "Physical",

        meeting_platform: "Google Meet",

        meeting_link: "",

        meeting_id: "",

        passcode: "",

        host_name: "",

        time_zone: "",

        joining_instructions: ""

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

            const payload = {
                name: form.name,
                organizer: form.organizer,
                location: form.location,
                start_date: form.start_date,
                end_date: form.end_date,
                website: form.website,
                description: form.description,
                meeting_details:
                    form.conference_type === "Physical"
                        ? null
                        : {
                              conference_type: form.conference_type,
                              meeting_platform: form.meeting_platform,
                              meeting_link: form.meeting_link,
                              meeting_id: form.meeting_id,
                              passcode: form.passcode,
                              host_name: form.host_name,
                              time_zone: form.time_zone,
                              joining_instructions: form.joining_instructions,
                          },
            };

            await API.post(

                "/conference/",

                payload

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

                description: "",

                conference_type: "Physical",

                meeting_platform: "Google Meet",

                meeting_link: "",

                meeting_id: "",

                passcode: "",

                host_name: "",

                time_zone: "",

                joining_instructions: ""

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
        (conference) => {
            const conferenceType = conference.conference_type || conference.meeting_details?.conference_type || "Physical";
            return (
                conference.name.toLowerCase().includes(searchConference.toLowerCase()) &&
                (typeFilter === "All" || conferenceType === typeFilter)
            );
        }
    );
    const pageCount = Math.max(1, Math.ceil(filteredConferences.length / pageSize));
    const paginatedConferences = filteredConferences.slice((page - 1) * pageSize, page * pageSize);

    const statsCard = {

        background: "rgba(255,255,255,0.06)",

        padding: "25px",

        borderRadius: "15px",

        textAlign: "center",

        boxShadow: "0 18px 60px rgba(0,0,0,0.18)"

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

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "25px", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Search Conference..."
                    value={searchConference}
                    onChange={(e) => setSearchConference(e.target.value)}
                    style={{
                        minWidth: "260px",
                        padding: "12px",
                    }}
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                        minWidth: "180px",
                        padding: "12px",
                    }}
                >
                    <option value="All">All Types</option>
                    <option value="Physical">Physical</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                </select>
            </div>

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

                <select
                    name="conference_type"
                    value={form.conference_type}
                    onChange={handleChange}
                >
                    <option value="Physical">Physical</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                </select>

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

                {(form.conference_type === "Online" || form.conference_type === "Hybrid") && (
                    <>
                        <select
                            name="meeting_platform"
                            value={form.meeting_platform}
                            onChange={handleChange}
                        >
                            <option value="Google Meet">Google Meet</option>
                            <option value="Zoom">Zoom</option>
                            <option value="Microsoft Teams">Microsoft Teams</option>
                            <option value="Webex">Webex</option>
                            <option value="Custom">Custom</option>
                        </select>

                        <input
                            type="text"
                            name="meeting_link"
                            placeholder="Meeting Link"
                            value={form.meeting_link}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="meeting_id"
                            placeholder="Meeting ID"
                            value={form.meeting_id}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="passcode"
                            placeholder="Passcode"
                            value={form.passcode}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="host_name"
                            placeholder="Host Name"
                            value={form.host_name}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="time_zone"
                            placeholder="Time Zone"
                            value={form.time_zone}
                            onChange={handleChange}
                        />

                        <textarea
                            name="joining_instructions"
                            placeholder="Joining Instructions"
                            value={form.joining_instructions}
                            onChange={handleChange}
                            rows="3"
                        />
                    </>
                )}

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

                    paginatedConferences.map((conference)=>(

                        <div

                            key={conference.id}

                            style={{

                                background: "rgba(255,255,255,0.06)",

                                borderRadius:"15px",

                                padding:"20px",

                                boxShadow: "0 18px 60px rgba(0,0,0,0.18)"

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
                                <b>Conference Type:</b>
                                {" "}
                                {conference.conference_type || conference.meeting_details?.conference_type || "Physical"}
                            </p>

                            {((conference.conference_type || conference.meeting_details?.conference_type) === "Online" || (conference.conference_type || conference.meeting_details?.conference_type) === "Hybrid") && (
                                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", marginBottom: "14px" }}>
                                    <p style={{ margin: "6px 0" }}><b>Platform:</b> {conference.meeting_platform || conference.meeting_details?.meeting_platform || "N/A"}</p>
                                    <p style={{ margin: "6px 0" }}><b>Host:</b> {conference.host_name || conference.meeting_details?.host_name || "N/A"}</p>
                                    <p style={{ margin: "6px 0" }}><b>Time Zone:</b> {conference.time_zone || conference.meeting_details?.time_zone || "N/A"}</p>
                                    {conference.meeting_details?.meeting_link && (
                                        <p style={{ margin: "6px 0" }}><b>Join:</b> <a href={conference.meeting_details.meeting_link} target="_blank" rel="noreferrer">Link</a></p>
                                    )}
                                </div>
                            )}

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

                                {(currentUser?.role === "System Admin" || conference.created_by === currentUser?.id) && <button

                                    onClick={()=>

                                        setEditingConference(

                                            conference

                                        )

                                    }

                                >

                                    ✏ Edit

                                </button>}

                                {(currentUser?.role === "System Admin" || conference.created_by === currentUser?.id) && <button

                                    onClick={()=>

                                        deleteConference(

                                            conference.id

                                        )

                                    }

                                >

                                    🗑 Delete

                                </button>}

                            </div>

                        </div>

                    ))

                }

            </div>
            <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={setPage} />

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

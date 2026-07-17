import { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [profile, setProfile] = useState({
        user_id: user?.id,
        phone: "",
        department: "",
        institution: "",
        designation: "",
        research_interest: "",
        skills: "",
        bio: "",
        linkedin: "",
        orcid: "",
        google_scholar: "",
        country: ""              // added — was missing, caused the save error
    });

    const [editing, setEditing] = useState(false);
    const [profileExists, setProfileExists] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await API.get(`/researcher/${user.id}`);
            setProfile(response.data);
            setProfileExists(true);
        } catch (error) {
            setProfileExists(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const saveProfile = async () => {

        if (!user?.id) {
            alert("Unable to save profile: missing user ID. Please login again.");
            return;
        }

        try {

            if (profileExists) {
                await API.put(`/researcher/${user.id}`, profile);
                alert("Profile Updated Successfully");
            } else {
                await API.post("/researcher/create", profile);
                alert("Profile Created Successfully");
                setProfileExists(true);
            }

            setEditing(false);

        } catch (error) {
            console.error("Profile save error:", error);

            const detail = error.response?.data?.detail;
            let message;

            if (Array.isArray(detail)) {
                // FastAPI validation errors come back as an array of objects —
                // this turns them into readable text instead of "[object Object]"
                message = detail.map(d => d.msg).join(", ");
            } else if (typeof detail === "string") {
                message = detail;
            } else {
                message = error.message || "Unable to save profile";
            }

            alert(`Unable to save profile: ${message}`);
        }

    };

    const deleteProfile = async () => {

        if (!window.confirm("Delete your profile?"))
            return;

        try {
            await API.delete(`/researcher/${user.id}`);
            alert("Profile Deleted");

            setProfile({
                user_id: user.id,
                phone: "",
                department: "",
                institution: "",
                designation: "",
                research_interest: "",
                skills: "",
                bio: "",
                linkedin: "",
                orcid: "",
                google_scholar: "",
                country: ""       // added here too, for consistency after delete
            });

            setProfileExists(false);

        } catch {
            alert("Unable to delete profile");
        }
    };

    return (

        <div
            style={{
                padding: "40px",
                background: "#f4f7fb",
                minHeight: "100vh"
            }}
        >

            <div
                style={{
                    background: "white",
                    padding: "35px",
                    borderRadius: "15px",
                    boxShadow: "0 5px 15px rgba(0,0,0,.1)"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "30px"
                    }}
                >

                    <div
                        style={{
                            width: "90px",
                            height: "90px",
                            borderRadius: "50%",
                            background: "#2563eb",
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "35px",
                            fontWeight: "bold",
                            marginRight: "25px"
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h1 style={{ margin: 0 }}>{user?.name}</h1>
                        <p style={{ color: "#666" }}>{user?.role}</p>
                        <p style={{ color: "#2563eb" }}>{user?.email}</p>
                    </div>

                </div>

                <hr />
                <h2 style={{ color: "#2563eb", marginTop: "30px" }}>
                    Professional Information
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "25px"
                    }}
                >
                    <h3>Name</h3>
                    <input value={user?.name} disabled style={inputStyle} />

                    <h3>Email</h3>
                    <input value={user?.email} disabled style={inputStyle} />

                    <h3>Role</h3>
                    <input value={user?.role} disabled style={inputStyle} />

                    <h3>Phone</h3>
                    <input
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        style={inputStyle}
                    />

                    <h3>Institution</h3>
                    <input
                        name="institution"
                        value={profile.institution}
                        onChange={handleChange}
                        disabled={!editing}
                        style={inputStyle}
                    />

                    <h3>Department</h3>
                    <input
                        name="department"
                        value={profile.department}
                        onChange={handleChange}
                        disabled={!editing}
                        style={inputStyle}
                    />

                    <h3>Designation</h3>
                    <input
                        name="designation"
                        value={profile.designation}
                        onChange={handleChange}
                        disabled={!editing}
                        style={inputStyle}
                    />

                    <h3>Country</h3>
                    <input
                        name="country"
                        value={profile.country}
                        onChange={handleChange}
                        disabled={!editing}
                        style={inputStyle}
                    />
                </div>

                <h3>Research Interest</h3>
                <textarea
                    name="research_interest"
                    value={profile.research_interest}
                    onChange={handleChange}
                    disabled={!editing}
                    style={textareaStyle}
                />

                <h3>Skills</h3>
                <textarea
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                    disabled={!editing}
                    style={textareaStyle}
                />

                <h3>Bio</h3>
                <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    disabled={!editing}
                    style={textareaStyle}
                />

                <h2 style={{ color: "#2563eb", marginTop: "35px" }}>
                    Academic Links
                </h2>

                <h3>LinkedIn</h3>
                <input
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>ORCID</h3>
                <input
                    name="orcid"
                    value={profile.orcid}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>Google Scholar</h3>
                <input
                    name="google_scholar"
                    value={profile.google_scholar}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <br />

                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        marginTop: "20px"
                    }}
                >
                    {!editing ? (
                        <button onClick={() => setEditing(true)} style={editButton}>
                            ✏ Edit Profile
                        </button>
                    ) : (
                        <button onClick={saveProfile} style={saveButton}>
                            💾 Save Profile
                        </button>
                    )}

                    <button onClick={deleteProfile} style={deleteButton}>
                        🗑 Delete Profile
                    </button>
                </div>

            </div>

        </div>

    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd"
};

const textareaStyle = {
    width: "100%",
    height: "100px",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd"
};

const editButton = {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer"
};

const saveButton = {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer"
};

const deleteButton = {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px"
};

export default Profile;
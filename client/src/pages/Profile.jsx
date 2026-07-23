import { useEffect, useState } from "react";
import API from "../services/api";
import InstitutionSearch from "../components/InstitutionSearch";
function Profile() {

    const user = JSON.parse(localStorage.getItem("user"));

    const normalizeInstitutionName = (value) => {
        if (!value) return "";
        return String(value).split(/,|\||\n/)[0].trim();
    };

    const [profile, setProfile] = useState({
    user_id: user?.id,

    phone: "",
    department: "",
    institution: "",

    aishe_code: "",
    state: "",
    district: "",
    pincode: "",
    institution_type: "",

    designation: "",
    research_interests: "",
    skills: "",
    bio: "",

    country: "",

    linkedin: "",
    orcid: "",
    google_scholar: ""
});

    const [editing, setEditing] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    useEffect(() => {
    console.log("Editing:", editing);
}, [editing]);
    useEffect(() => {

        loadProfile();

    }, []);

   const loadProfile = async () => {
    try {
        const response = await API.get(`/researcher/${user.id}`);

        console.log("GET Success:", response.data);

        setProfile({
            user_id: user.id,
            phone: response.data.phone || "",
            department: response.data.department || "",
            institution: normalizeInstitutionName(
                response.data.institution || response.data.institution_name || ""
            ),
            aishe_code: response.data.aishe_code || "",
            state: response.data.state || "",
            district: response.data.district || "",
            pincode: response.data.pincode || "",
            institution_type: response.data.institution_type || "",
            designation: response.data.designation || "",
            research_interests: response.data.research_interests || response.data.research_interest || "",
            skills: response.data.skills || "",
            bio: response.data.bio || "",
            country: response.data.country || "",
            linkedin: response.data.linkedin || "",
            orcid: response.data.orcid || "",
            google_scholar: response.data.google_scholar || "",
            
        });

        setProfileExists(true);

    } catch (error) {

        console.log("GET Failed:", error.response?.status);
        console.log("GET Response:", error.response?.data);

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

    console.log("profileExists:", profileExists);
    console.log("user.id:", user.id);
    console.log("profile:", profile);

    if (!user?.id) {
        alert("Unable to save profile: missing user ID. Please login again.");
        return;
    }

    try {

        const payload = {
            user_id: user.id,
            phone: profile.phone,
            department: profile.department,
            institution: normalizeInstitutionName(profile.institution),

            aishe_code: profile.aishe_code,
            state: profile.state,
            district: profile.district,
            pincode: profile.pincode,
            institution_type: profile.institution_type,

            designation: profile.designation,

            research_interests: profile.research_interests,

            skills: profile.skills,
            bio: profile.bio,

            country: profile.country,

            linkedin: profile.linkedin,
            orcid: profile.orcid,
            google_scholar: profile.google_scholar
        };

if (profileExists) {

    console.log("➡ Calling PUT /researcher/");

    await API.put(
        `/researcher/${user.id}`,
        payload
    );

    alert("Profile Updated Successfully");

} else {

    console.log("➡ Calling POST /researcher/create");

    await API.post(
        "/researcher/create",
        payload
    );

    alert("Profile Created Successfully");

    setProfileExists(true);
}

        setEditing(false);

    } catch (error) {

        console.log("Status:", error.response?.status);
        console.log("Response:", error.response?.data);

        alert(
            `Unable to save profile: ${
                error.response?.data?.detail || error.message
            }`
        );
    }
};
    const deleteProfile = async () => {

    if (!window.confirm("Delete your profile?"))
        return;

    try {

        await API.delete(
            `/researcher/${user.id}`
        );

        alert("Profile Deleted");

        setProfile({
            user_id: user.id,
            phone: "",
            department: "",
            institution: "",
            designation: "",
            research_interests: "",
            skills: "",
            bio: "",
            linkedin: "",
            orcid: "",
            google_scholar: ""
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
                    background: "rgba(255,255,255,0.06)",
                    padding: "35px",
                    borderRadius: "15px",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.18)"
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

        <h1 style={{ margin: 0 }}>
            {user?.name}
        </h1>

        <p style={{ color: "#666" }}>
            {user?.role}
        </p>

        <p style={{ color: "#2563eb" }}>
            {user?.email}
        </p>

    </div>

</div>

<hr />
<h2
    style={{
        color: "#2563eb",
        marginTop: "30px"
    }}
>
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

                <input
                    value={user?.name}
                    disabled
                    style={inputStyle}
                />

                <h3>Email</h3>

                <input
                    value={user?.email}
                    disabled
                    style={inputStyle}
                />

                <h3>Role</h3>

                <input
                    value={user?.role}
                    disabled
                    style={inputStyle}
                />

                <h3>Phone</h3>

                <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>Institution</h3>

                <InstitutionSearch
                    value={profile.institution}
                    disabled={!editing}
                    onSelect={(institution) => {
    console.log("Selected Institution:", institution);

  setProfile((prev) => ({
    ...prev,
    institution: normalizeInstitutionName(institution.name),
    aishe_code: institution.aishe_code || "",
    state: institution.state || "",
    district: institution.district || "",
    pincode: institution.pincode || "",
    institution_type: institution.institution_type || "",
    country: institution.country || "India",
}));
}}
                    onSelect={(institution) => {
                        setProfile({
                            ...profile,
                            institution: normalizeInstitutionName(institution.name),
                            aishe_code: institution.aishe_code || "",
                            state: institution.state || "",
                            district: institution.district || "",
                            pincode: institution.pincode || "",
                            institution_type: institution.institution_type || "",
                            country: institution.country || "India",
                        });
                    }}
                />

                <h3>AISHE Code</h3>

                <input
                    name="aishe_code"
                    value={profile.aishe_code}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>State</h3>

                <input
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>District</h3>

                <input
                    name="district"
                    value={profile.district}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>Pincode</h3>

                <input
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    disabled={!editing}
                    style={inputStyle}
                />

                <h3>Institution Type</h3>

                <input
                    name="institution_type"
                    value={profile.institution_type}
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
                /></div>

                <h3>Research Interest</h3>

                <textarea
                    name="research_interests"
                    value={profile.research_interests}
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
                <h2
    style={{
        color: "#2563eb",
        marginTop: "35px"
    }}
>
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

        <button
            onClick={() => setEditing(true)}
            style={editButton}
        >
            ✏ Edit Profile
        </button>

    ) : (

        <button
            onClick={saveProfile}
            style={saveButton}
        >
            💾 Save Profile
        </button>

    )}

    <button
        onClick={deleteProfile}
        style={deleteButton}
    >
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
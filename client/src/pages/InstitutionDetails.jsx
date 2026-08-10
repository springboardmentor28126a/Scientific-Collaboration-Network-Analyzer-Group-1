﻿import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import InstitutionSearch from "../components/InstitutionSearch";
import { getAuthUser } from "../utils/authStorage";

function InstitutionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = getAuthUser();
    const [data, setData] = useState(null);

    const normalizeInstitutionName = (value) => {
        if (!value) return "";
        return String(value).split(/,|\||\n/)[0].trim();
    };
    const [loading, setLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        website: "",
        email: "",
        phone: "",
        description: "",
        aishe_code: "",
        district: "",
        pincode: "",
        institution_type: "",
    });

    const canEdit = user?.role === "System Admin" || (
        user?.role === "Institution Admin" && user.institution_id === data?.institution?.id
    );

    useEffect(() => {
        loadInstitution();
        // reset edit mode when switching institutions
        setEditMode(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadInstitution = async () => {
        try {
            const response = await API.get(`/institution/details/${id}`);
            setData(response.data);
            const inst = response.data?.institution;
            if (inst) {
                setForm({
                    name: inst.name || "",
                    address: inst.address || "",
                    city: inst.city || "",
                    state: inst.state || "",
                    country: inst.country || "",
                    website: inst.website || "",
                    email: inst.email || "",
                    phone: inst.phone || "",
                    description: inst.description || "",
                    aishe_code: inst.aishe_code || "",
                    district: inst.district || "",
                    pincode: inst.pincode || "",
                    institution_type: inst.institution_type || "",
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const researchAreas = useMemo(() => {
        if (!data?.researchers) return [];
        return [
            ...new Set(
                data.researchers
                    .flatMap((researcher) =>
                        researcher.research_interest
                            ? researcher.research_interest.split(",").map((item) => item.trim())
                            : []
                    )
                    .filter(Boolean)
            ),
        ];
    }, [data]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleCancel = () => {
        setEditMode(false);
        const inst = data?.institution;
        if (inst) {
            setForm({
                name: inst.name || "",
                address: inst.address || "",
                city: inst.city || "",
                state: inst.state || "",
                country: inst.country || "",
                website: inst.website || "",
                email: inst.email || "",
                phone: inst.phone || "",
                description: inst.description || "",
                aishe_code: inst.aishe_code || "",
                district: inst.district || "",
                pincode: inst.pincode || "",
                institution_type: inst.institution_type || "",
            });
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...form,
                name: normalizeInstitutionName(form.name),
            };
            await API.put(`/institution/${id}`, payload);
            alert("Institution updated successfully");
            await loadInstitution();
            setEditMode(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update institution");
        }
    };

    if (loading) {
        return <h2>Loading institution...</h2>;
    }

    if (!data) {
        return <h2>Institution not found.</h2>;
    }

    const inst = data.institution;

    return (
        <div style={{ padding: "30px" }}>
            <div style={headerCard}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
                    <div>
                        <h1>🏫 {inst.name}</h1>
                        {!editMode ? (
                            <>
                                <p>📍 {inst.address}</p>
                                <p>🏙 City: {inst.city}</p>
                                <p>🌍 Country: {inst.country}</p>
                                <p>🌐 {inst.website}</p>
                                <p>📧 {inst.email}</p>
                                <p>📞 {inst.phone || "N/A"}</p>
                            </>
                        ) : (
                            <div style={editFormWrap}>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSave();
                                    }}
                                >
                                   <div style={editGrid}>

<div style={{ marginBottom: "20px" }}>
                                <InstitutionSearch
                                    value={form.name}
                                    disabled={!editMode}
                                    onSelect={(institution) => {
                                        setForm({
                                            ...form,
                                            name: normalizeInstitutionName(institution.name || ""),
                                            address: institution.address || "",
                                            city: institution.city || "",
                                            state: institution.state || "",
                                            country: institution.country || "India",
                                            website: institution.website || "",
                                            email: institution.email || "",
                                            phone: institution.phone || "",
                                            description: institution.description || "",
                                            aishe_code: institution.aishe_code || "",
                                            district: institution.district || "",
                                            pincode: institution.pincode || "",
                                            institution_type: institution.institution_type || "",
                                        });
                                    }}
                                />
                            </div>

                            <div style={fieldGroup}>
        <label style={labelStyle}>Institution Name</label>
        <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Address</label>
        <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>City</label>
        <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>State</label>
        <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>AISHE Code</label>
        <input
            type="text"
            name="aishe_code"
            value={form.aishe_code}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>District</label>
        <input
            type="text"
            name="district"
            value={form.district}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Pincode</label>
        <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Institution Type</label>
        <input
            type="text"
            name="institution_type"
            value={form.institution_type}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Country</label>
        <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Email</label>
        <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Website</label>
        <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

    <div style={fieldGroup}>
        <label style={labelStyle}>Phone</label>
        <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>

</div>

<div style={fieldGroup}>
    <label style={labelStyle}>Description</label>
    <textarea
        name="description"
        rows={4}
        value={form.description}
        onChange={handleChange}
        style={{ ...inputStyle, width: "100%", resize: "vertical" }}
    />
</div>

                                </form>
                            </div>

                        )}
                    </div>

                    <div style={{ minWidth: "220px" }}>
                        {!editMode ? (
                            canEdit && (
                            <button style={editButtonStyle} onClick={() => setEditMode(true)}>
                                ✏ Edit
                            </button>
                            )
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <button style={editButtonStyle} onClick={handleSave}>
                                    ✅ Save
                                </button>
                                <button style={cancelButtonStyle} onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={statsGrid}>
                <StatCard title="Researchers" value={data.statistics?.researchers ?? 0} />
                <StatCard title="Publications" value={data.statistics?.publications ?? 0} />
                <StatCard title="Conferences" value={data.statistics?.conferences ?? 0} />
            </div>

            <Section title="Research Areas">
                {researchAreas.length > 0 ? (
                    researchAreas.map((area) => <span key={area} style={tagStyle}>{area}</span>)
                ) : (
                    <p>No research areas available.</p>
                )}
            </Section>

            <Section title="Researchers">
                {data.researchers.length === 0 ? (
                    <p>No researchers found.</p>
                ) : (
                    <div style={cardGrid}>
                        {data.researchers.map((researcher) => (
                            <div key={researcher.id} style={detailCard}>
                                <h3>{researcher.name}</h3>
                                <p>💻 {researcher.department || "N/A"}</p>
                                <p>🏷 {researcher.designation || "N/A"}</p>
                                <p>📧 {researcher.email}</p>
                                <button style={buttonStyle} onClick={() => navigate(`/researcher/${researcher.id}`)}>
                                    View Researcher
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Publications">
                {data.publications.length === 0 ? (
                    <p>No publications found.</p>
                ) : (
                    <div style={cardGrid}>
                        {data.publications.map((publication) => (
                            <div key={publication.id} style={detailCard}>
                                <h3>{publication.title}</h3>
                                <p>{publication.authors}</p>
                                <p>{publication.journal}</p>
                                <button style={buttonStyle} onClick={() => navigate(`/publication/${publication.id}`)}>
                                    View Publication
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Conferences">
                {data.conferences.length === 0 ? (
                    <p>No conferences found.</p>
                ) : (
                    <div style={cardGrid}>
                        {data.conferences.map((conference) => (
                            <div key={conference.id} style={detailCard}>
                                <h3>{conference.name}</h3>
                                <p>{conference.location}</p>
                                <button style={buttonStyle} onClick={() => navigate(`/conference/${conference.id}`)}>
                                    View Conference
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: "30px" }}>
            <h2>{title}</h2>
            <div>{children}</div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div style={statCard}>
            <h3>{title}</h3>
            <h1>{value}</h1>
        </div>
    );
}

const headerCard = {
    background: "rgba(255,255,255,0.06)",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    marginBottom: "30px",
};

const statsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "30px",
};

const statCard = {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    textAlign: "center",
};

const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
};

const detailCard = {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
    marginBottom: "15px",
};

const tagStyle = {
    background: "#e0f2fe",
    color: "#0c4a6e",
    padding: "8px 12px",
    borderRadius: "999px",
    marginRight: "10px",
    marginBottom: "10px",
    display: "inline-block",
};

const buttonStyle = {
    marginTop: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
};

const editButtonStyle = {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
};

const cancelButtonStyle = {
    background: "#111827",
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
};

const editGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
};

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.2)",
    color: "white",
    outline: "none",
};
const editFormWrap = {
    marginTop: "20px",
    width: "100%",
};
const fieldGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
};

const labelStyle = {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
};
export default InstitutionDetails;


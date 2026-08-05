import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { createGroup,updateGroup,deleteGroup,leaveGroup } from "../services/groupService";
import Pagination from "../components/Pagination";
export default function ResearchGroups() {

    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    visibility: "Private",
    // created_by: user.id
});

const [creating, setCreating] = useState(false);
const [openEditModal, setOpenEditModal] = useState(false);

const [editing, setEditing] = useState(false);

const [selectedGroup, setSelectedGroup] = useState(null);
const [page, setPage] = useState(1);
const pageSize = 6;
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("name");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadGroups = async () => {

        try {

            const res = await api.get(`/groups/my/${user.id}`);

            setGroups(res.data);

        } catch (err) {

            console.error(err);

        }

    };
    const filteredGroups = useMemo(() => {
        const term = search.trim().toLowerCase();
        return groups
            .filter((group) => !term || `${group.name} ${group.description || ""}`.toLowerCase().includes(term))
            .sort((a, b) => {
                if (sortBy === "members") return (b.member_count || 0) - (a.member_count || 0);
                return (a.name || "").localeCompare(b.name || "");
            });
    }, [groups, search, sortBy]);
    const pageCount = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
    const paginatedGroups = filteredGroups.slice((page - 1) * pageSize, page * pageSize);
const handleCreateGroup = async () => {

    if (!groupData.name.trim()) {
        alert("Group name is required.");
        return;
    }

    try {

        setCreating(true);

        const payload = {
            ...groupData,
            created_by: user.id
        };

        const newGroup = await createGroup(payload);

        await loadGroups();

        setOpenCreateModal(false);

        setGroupData({
            name: "",
            description: "",
            visibility: "Private"
        });

        navigate(`/groups/${newGroup.id}`);

    }  catch (err) {

    console.error("Create Group Error:", err);

    if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);
        alert(err.response.data.detail || "Failed to create group.");
    } else {
        alert("Network error.");
    }

    } finally {

    setCreating(false);

}

};
const handleEditClick = (group) => {

    setSelectedGroup({
        ...group
    });

    setOpenEditModal(true);

};
const handleUpdateGroup = async () => {

    if (!selectedGroup.name.trim()) {
        alert("Group name is required.");
        return;
    }

    try {

        setEditing(true);

        await updateGroup(
            selectedGroup.id,
            {
                name: selectedGroup.name,
                description: selectedGroup.description,
                visibility: selectedGroup.visibility,
                requester_id: user.id
            }
        );

        await loadGroups();

        setOpenEditModal(false);

        setSelectedGroup(null);

    } catch (err) {

        console.error(err);

        alert("Failed to update group.");

    } finally {

        setEditing(false);

    }

};
const handleDeleteGroup = async (groupId) => {

    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this research group?"
    );

    if (!confirmed) return;

    try {

        await deleteGroup(
            groupId,
            user.id
        );

        await loadGroups();

    } catch (err) {

        console.error(err);

        alert(
            err.response?.data?.detail ||
            "Failed to delete group."
        );

    }

};
const handleLeaveGroup = async (groupId) => {

    const confirmed = window.confirm(
        "Are you sure you want to leave this research group?"
    );

    if (!confirmed) return;

    try {

        await leaveGroup(
            groupId,
            user.id
        );

        await loadGroups();

        alert("You left the group successfully.");

    } catch (err) {

        console.error(err);

        alert(
            err.response?.data?.detail ||
            "Failed to leave group."
        );

    }

};
    const inputStyle = {
        width: "100%",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box"
    };

    return (

        <div
            style={{
                padding: "30px",
                maxWidth: "1100px",
                margin: "0 auto"
            }}
        >

            <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
    }}
>
    <h1>My Research Groups</h1>

    <button
        onClick={() => setOpenCreateModal(true)}
        style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px"
        }}
    >
        + Create Group
    </button>
</div>

            <div className="page-toolbar">
                <input className="search-input" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search groups" aria-label="Search groups" />
                <select className="filter-select" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }} aria-label="Sort groups">
                    <option value="name">Sort by name</option>
                    <option value="members">Sort by members</option>
                </select>
            </div>

            {
                filteredGroups.length === 0 ? (

                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px",
                            border: "1px dashed #bbb",
                            borderRadius: "12px"
                        }}
                    >
                        <h3>No Research Groups Found</h3>
                        <p>Create a research group to start collaborating.</p>
                    </div>

                ) : (

                    paginatedGroups.map(group => (

                        <div
                            key={group.id}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "15px",
                                padding: "25px",
                                marginBottom: "20px",
                                background: "#fff",
                                boxShadow: "0 5px 15px rgba(0,0,0,.06)"
                            }}
                        >

                            <h2
                                style={{
                                    marginBottom: "10px"
                                }}
                            >
                                {group.name}
                            </h2>

                            <p
                                style={{
                                    color: "#555"
                                }}
                            >
                                {group.description || "No description provided."}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "25px",
                                    marginTop: "15px",
                                    marginBottom: "20px",
                                    color: "#444"
                                }}
                            >

                                <span>
                                    👥 {group.member_count} Members
                                </span>

                                <span>
                                    🛡 {group.role}
                                </span>

                                <span>
                                    🌐 {group.visibility}
                                </span>

                            </div>

      <div
    style={{
        display: "flex",
        gap: "10px",
        marginTop: "15px",
        flexWrap: "wrap"
    }}
>
    <button
        onClick={() => navigate(`/groups/${group.id}`)}
        style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer"
        }}
    >
        Open Workspace
    </button>

    {group.role === "Owner" ? (
    <>
        <button
            onClick={() => handleEditClick(group)}
            style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer"
            }}
        >
            ✏ Edit
        </button>

        <button
            onClick={() => handleDeleteGroup(group.id)}
            style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer"
            }}
        >
            🗑 Delete Group
        </button>
    </>
) : (
    <button
        onClick={() => handleLeaveGroup(group.id)}
        style={{
            background: "#f59e0b",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer"
        }}
    >
        🚪 Leave Group
    </button>
)}
</div>

                        </div>

                    ))

                )
            }
            <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={setPage} />
            {
openCreateModal && (

<div
    style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
    }}
>

<div
    style={{
        background: "#fff",
        width: "600px",
        borderRadius: "18px",
        padding: "35px",
        boxShadow: "0 20px 50px rgba(0,0,0,.25)"
    }}
>

<h2 style={{marginBottom:"25px"}}>
    Create Research Group
</h2>

<div style={{display:"flex",flexDirection:"column",gap:"18px"}}>

<input
    placeholder="Group Name"
    value={groupData.name}
    onChange={(e)=>
        setGroupData({
            ...groupData,
            name:e.target.value
        })
    }
    style={inputStyle}
/>

<textarea
    rows={4}
    placeholder="Description"
    value={groupData.description}
    onChange={(e)=>
        setGroupData({
            ...groupData,
            description:e.target.value
        })
    }
    style={{
        ...inputStyle,
        resize:"none"
    }}
/>


<select
    value={groupData.visibility}
    onChange={(e)=>
        setGroupData({
            ...groupData,
            visibility:e.target.value
        })
    }
    style={inputStyle}
>

<option>Private</option>

<option>Public</option>

</select>


</div>

<div
style={{
display:"flex",
justifyContent:"flex-end",
gap:"15px",
marginTop:"30px"
}}
>

<button
onClick={()=>setOpenCreateModal(false)}
style={{
padding:"10px 20px",
borderRadius:"10px",
border:"1px solid #ddd",
background:"#fff",
cursor:"pointer"
}}
>
Cancel
</button>

<button
    onClick={handleCreateGroup}
    disabled={creating}
    style={{
        padding:"10px 22px",
        borderRadius:"10px",
        border:"none",
        background:"#2563eb",
        color:"white",
        cursor:"pointer",
        opacity: creating ? 0.7 : 1
    }}
>
    {creating ? "Creating..." : "Create Group"}
</button>

</div>

</div>

</div>

)
}
{
openEditModal && selectedGroup && (

<div
    style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
    }}
>

<div
    style={{
        background: "#fff",
        width: "600px",
        borderRadius: "18px",
        padding: "35px",
        boxShadow: "0 20px 50px rgba(0,0,0,.25)"
    }}
>

<h2 style={{ marginBottom: "25px" }}>
    Edit Research Group
</h2>

<div
    style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    }}
>

<input
    value={selectedGroup.name}
    onChange={(e) =>
        setSelectedGroup({
            ...selectedGroup,
            name: e.target.value
        })
    }
    style={inputStyle}
/>

<textarea
    rows={4}
    value={selectedGroup.description || ""}
    onChange={(e) =>
        setSelectedGroup({
            ...selectedGroup,
            description: e.target.value
        })
    }
    style={{
        ...inputStyle,
        resize: "none"
    }}
/>

<select
    value={selectedGroup.visibility}
    onChange={(e) =>
        setSelectedGroup({
            ...selectedGroup,
            visibility: e.target.value
        })
    }
    style={inputStyle}
>
    <option>Private</option>
    <option>Public</option>
</select>

</div>

<div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "15px",
        marginTop: "30px"
    }}
>

<button
    onClick={() => {
        setOpenEditModal(false);
        setSelectedGroup(null);
    }}
    style={{
        padding: "10px 20px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer"
    }}
>
    Cancel
</button>

<button
    onClick={handleUpdateGroup}
    disabled={editing}
    style={{
        padding: "10px 22px",
        borderRadius: "10px",
        border: "none",
        background: "#16a34a",
        color: "#fff",
        cursor: "pointer",
        opacity: editing ? 0.7 : 1
    }}
>
    {editing ? "Saving..." : "Save Changes"}
</button>

</div>

</div>

</div>

)
}

        </div>

    );

}

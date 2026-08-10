import { useEffect, useState } from "react";
import FileUpload from "../FileUpload";
import FileCard from "../FileCard";
import Pagination from "../../components/Pagination";
import { getAuthUser } from "../../utils/authStorage";

import {
    getGroupFiles,
    uploadGroupFile,
    downloadGroupFile,
    deleteGroupFile
} from "../../services/groupFileService";

export default function GroupFiles({ groupId }) {

    const user = getAuthUser();

    const [files, setFiles] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const pageSize = 6;

    // Temporary user ID for now.
    // Later we'll read it from the logged-in user.
    // const uploadedBy = user?.id;

    const loadFiles = async () => {
        try {
            const data = await getGroupFiles(groupId);
            setFiles(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    const handleUpload = async (file) => {
        try {
            await uploadGroupFile(groupId, file);
            loadFiles();
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    const handleDownload = async (id) => {
        try {
            const url = await downloadGroupFile(id);
            window.open(url, "_blank");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this file?")) return;

        try {
            await deleteGroupFile(id);
            loadFiles();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredFiles = files.filter((file) => file.file_name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "name" ? a.file_name.localeCompare(b.file_name) : new Date(b.uploaded_at) - new Date(a.uploaded_at));
    const pageCount = Math.max(1, Math.ceil(filteredFiles.length / pageSize));
    const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div>

            <h2>Shared Files</h2>

            <FileUpload onUpload={handleUpload} />
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}><input placeholder="Search files" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="name">Name</option></select></div>

            <div style={{ marginTop: 20 }}>

                {files.length === 0 ? (
                    <p>No files uploaded yet.</p>
                ) : (
                    paginatedFiles.map(file => (
                        <FileCard
                            key={file.id}
                            file={file}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            canDelete={user?.role === "System Admin" || file.uploaded_by === user?.id}
                        />
                    ))
                )}
                <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={setPage} />

            </div>

        </div>
    );
}

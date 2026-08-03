import { useEffect, useState } from "react";
import FileUpload from "../FileUpload";
import FileCard from "../FileCard";

import {
    getGroupFiles,
    uploadGroupFile,
    downloadGroupFile,
    deleteGroupFile
} from "../../services/groupFileService";

export default function GroupFiles({ groupId }) {

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [files, setFiles] = useState([]);

    // Temporary user ID for now.
    // Later we'll read it from the logged-in user.
    // const user = JSON.parse(localStorage.getItem("user"));
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

    return (
        <div>

            <h2>Shared Files</h2>

            <FileUpload onUpload={handleUpload} />

            <div style={{ marginTop: 20 }}>

                {files.length === 0 ? (
                    <p>No files uploaded yet.</p>
                ) : (
                    files.map(file => (
                        <FileCard
                            key={file.id}
                            file={file}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            canDelete={user?.role === "System Admin" || file.uploaded_by === user?.id}
                        />
                    ))
                )}

            </div>

        </div>
    );
}

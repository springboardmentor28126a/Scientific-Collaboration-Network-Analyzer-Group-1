import { useEffect, useState } from "react";

import FileUpload from "../components/FileUpload";
import FileCard from "../components/FileCard";

import {
    getGroupFiles,
    uploadGroupFile,
    downloadGroupFile,
    deleteGroupFile,
} from "../services/groupFileService";

export default function GroupFiles({ groupId, userId }) {

    const [files, setFiles] = useState([]);

    const loadFiles = async () => {
        const data = await getGroupFiles(groupId);
        setFiles(data);
    };

    useEffect(() => {
        loadFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (file) => {
        await uploadGroupFile(groupId, file, userId);
        loadFiles();
    };

    const handleDownload = async (id) => {
        const url = await downloadGroupFile(id);
        window.open(url, "_blank");
    };

    const handleDelete = async (id) => {
        await deleteGroupFile(id);
        loadFiles();
    };

    return (
        <div className="container mt-4">

            <h2>Group Files</h2>

            <FileUpload onUpload={handleUpload} />

            {files.map(file => (
                <FileCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                />
            ))}

        </div>
    );
}

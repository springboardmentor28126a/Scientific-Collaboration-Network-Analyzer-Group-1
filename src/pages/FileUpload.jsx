import { useEffect, useState, useRef } from "react";
import { UploadCloud, File, FileText, Image, Video, Trash2, Eye, ExternalLink, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch all files on mount
  const fetchFiles = async () => {
    try {
      const response = await api.get("/files");
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Format file sizes helper
  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // Icon chooser helper
  const getFileIcon = (fileType) => {
    if (!fileType) return <File size={22} className="file-icon" />;
    const type = fileType.toLowerCase();
    if (type.includes("image")) return <Image size={22} style={{ color: "#c1123f" }} />;
    if (type.includes("pdf")) return <FileText size={22} style={{ color: "#d9383a" }} />;
    if (type.includes("video")) return <Video size={22} style={{ color: "#3b82f6" }} />;
    return <File size={22} style={{ color: "#8b5cf6" }} />;
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Upload handler
  const handleFileUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchFiles();
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.response?.data?.detail || "Failed to upload file.");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  // Delete handler
  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/files/${id}`);
      fetchFiles();
      alert("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file.");
    }
  };

  return (
    <div className="institutions-page">
      <Navbar />

      <div className="page-header">
        <UploadCloud size={45} />
        <div>
          <h1>File Repository & Upload</h1>
          <p>Securely upload and manage research documents, banners, and presentation slides.</p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        className={`institution-form file-drop-zone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? "3px dashed #3b82f6" : "3px dashed rgba(16, 42, 86, 0.8)",
          borderRadius: "15px",
          padding: "40px",
          textAlign: "center",
          background: dragActive ? "rgba(59, 130, 246, 0.1)" : "rgba(5, 8, 18, 0.6)",
          cursor: "pointer",
          marginBottom: "40px",
          transition: "all 0.3s ease"
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
        <UploadCloud size={50} style={{ color: "#3b82f6", marginBottom: "15px" }} />
        {uploading ? (
          <h3 style={{ color: "#d8c7cc" }}>Uploading your file... Please wait.</h3>
        ) : (
          <>
            <h3 style={{ color: "white", margin: "10px 0" }}>Drag & Drop file here, or click to browse</h3>
            <p style={{ color: "#c8b6bd", fontSize: "14px", margin: "5px 0" }}>
              Supports PDF, DOCX, Images, and Slides (Max 10MB)
            </p>
          </>
        )}
      </div>

      {/* Files List Table */}
      <div className="institution-table-container">
        <h2>Uploaded Files ({files.length})</h2>
        <table className="institution-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {getFileIcon(file.file_type)}
                      <span style={{ fontWeight: "500" }}>{file.filename}</span>
                    </div>
                  </td>
                  <td>{file.file_type}</td>
                  <td>{formatBytes(file.size_bytes)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      <Calendar size={14} style={{ color: "#c8b6bd" }} />
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <a 
                        href={`http://127.0.0.1:8000/files/${file.filepath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="edit-btn"
                        style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "5px", 
                          textDecoration: "none",
                          fontSize: "14px"
                        }}
                      >
                        <ExternalLink size={14} />
                        View
                      </a>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteFile(file.id)}
                        style={{ marginTop: 0, padding: "8px 15px", fontSize: "14px" }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#c8b6bd" }}>
                  No files uploaded yet. Drag and drop a file above to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FileUpload;

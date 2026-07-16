import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, UploadCloud, FileText, Trash2, Download, Loader2 } from "lucide-react";
import "../css/file.css";

function FileUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/files", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch files");
    }
  };

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
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds the 20MB limit");
      return;
    }
    setSelectedFile(file);
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      await API.post("/upload", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast.success("File uploaded successfully");
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      fetchFiles();
    } catch (error) {
      console.log(error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("File upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
    } catch (error) {
      console.log(error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("File deleted successfully");
      fetchFiles();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete file");
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="file-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={18} /> Dashboard
      </button>

      <div className="upload-card">
        <h2><UploadCloud size={28} color="#3182ce" /> Upload Documents</h2>
        <p className="upload-subtitle">Upload research papers, journals, or technical reports (PDF only, max 20MB)</p>
        
        <form className="upload-form" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
          <input ref={inputRef} type="file" id="file-upload" accept=".pdf,application/pdf" multiple={false} onChange={handleChange} />
          
          <div 
            className={`drag-drop-area ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <UploadCloud size={50} color={dragActive ? "#3182ce" : "#a0aec0"} />
            <p>Drag & Drop your PDF here</p>
            <span>or click to browse</span>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <FileText size={20} color="#2b6cb0" />
              <div className="file-info">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">{formatSize(selectedFile.size)}</span>
              </div>
              <button type="button" className="remove-file-btn" onClick={() => setSelectedFile(null)}>
                <Trash2 size={16} />
              </button>
            </div>
          )}

          <button 
            type="button" 
            className="upload-btn" 
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? <><Loader2 size={18} className="spin" /> Uploading...</> : "Upload File"}
          </button>
        </form>
      </div>

      <div className="file-list-card">
        <h3>My Uploaded Files</h3>
        <div className="table-responsive">
          <table className="file-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Publication</th>
                <th>Uploaded Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id}>
                  <td>
                    <div className="file-name-cell">
                      <FileText size={16} color="#4a5568" />
                      {f.filename}
                    </div>
                  </td>
                  <td>{f.publication_id || "Unlinked"}</td>
                  <td>{formatDate(f.upload_date)}</td>
                  <td>{formatSize(f.file_size)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="download-btn" onClick={() => handleDownload(f.id, f.filename)} title="Download">
                        <Download size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(f.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">No files uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;

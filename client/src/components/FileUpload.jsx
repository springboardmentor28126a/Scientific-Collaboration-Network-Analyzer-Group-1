import { useState } from "react";

export default function FileUpload({ onUpload }) {
    const [file, setFile] = useState(null);

    return (
        <div className="mb-4">
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <button
                className="btn btn-primary ms-3"
                onClick={() => file && onUpload(file)}
            >
                Upload
            </button>
        </div>
    );
}
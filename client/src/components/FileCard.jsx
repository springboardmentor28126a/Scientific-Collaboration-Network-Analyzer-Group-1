export default function FileCard({
    file,
    onDownload,
    onDelete,
}) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff"
            }}
        >
            <div>
                <h4 style={{ margin: 0 }}>{file.file_name}</h4>

                <p style={{ margin: "5px 0" }}>
                    {file.file_type}
                </p>

                <small>
                    {(file.file_size / 1024).toFixed(2)} KB
                </small>
            </div>

            <div>
                <button
                    onClick={() => onDownload(file.id)}
                    style={{ marginRight: "10px" }}
                >
                    Download
                </button>

                <button
                    onClick={() => onDelete(file.id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
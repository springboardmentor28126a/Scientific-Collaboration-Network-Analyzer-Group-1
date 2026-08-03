function SearchSuggestions({
    suggestions,
    visible,
    onSelect
}) {

if (
    !visible ||
    suggestions.length === 0 ||
    suggestions.every(item => !item.title?.trim())
) {
    return null;
}
    return (
        <div
            style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "6px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                zIndex: 1000,
                maxHeight: "350px",
                overflowY: "auto"
            }}
        >
            {suggestions.map((item) => (
                <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => onSelect(item)}
                    style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0"
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        {item.icon} {item.title}
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "#666"
                        }}
                    >
                        {item.subtitle}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SearchSuggestions;
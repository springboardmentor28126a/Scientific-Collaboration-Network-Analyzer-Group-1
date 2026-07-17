function PublicationCard({

    publication,

    onView,

    onEdit,

    onDelete

}) {

    return (

        <div
            style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "15px",
                padding: "20px",
                boxShadow: "0 18px 60px rgba(0,0,0,0.18)"
            }}
        >

            <h2 style={{ color: "#2563eb" }}>

                📄 {publication.title}

            </h2>

            <p>

                <b>👨‍🔬 Authors:</b>

                {publication.authors}

            </p>

            <p>

                <b>📑 Type:</b>

                {publication.publication_type}

            </p>

            <p>

                <b>📚 Journal:</b>

                {publication.journal}

            </p>

            <p>

                <b>📅 Year:</b>

                {publication.publication_year}

            </p>

            <p>

                <b>Status:</b>

                <span
                    style={{
                        color:

                            publication.status === "Published"

                                ? "green"

                                : publication.status === "Draft"

                                ? "orange"

                                : "blue",

                        fontWeight: "bold"

                    }}
                >

                    {" "}

                    {publication.status}

                </span>

            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px"
                }}
            >

                <button onClick={() => onView(publication.id)}>

                    👁 View

                </button>

                <button onClick={() => onEdit(publication)}>

                    ✏ Edit

                </button>

                <button onClick={() => onDelete(publication.id)}>

                    🗑 Delete

                </button>

            </div>

        </div>

    );

}

export default PublicationCard;
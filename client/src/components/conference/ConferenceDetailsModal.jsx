function ConferenceDetailsModal({

    conference,

    onClose

}) {

    if (!conference) return null;

    return (

        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >

            <div
                style={{
                    width: "700px",
                    background: "var(--surface-alt)",
                    color: "var(--text)",
                    padding: "30px",
                    borderRadius: "15px",
                    border: "1px solid var(--border)"
                }}
            >

                <h2>

                    🏛 {conference.name}

                </h2>

                <hr />

                <p>

                    <b>Organizer:</b>

                    {conference.organizer}

                </p>

                <p>

                    <b>Location:</b>

                    {conference.location}

                </p>

                <p>

                    <b>Start Date:</b>

                    {conference.start_date}

                </p>

                <p>

                    <b>End Date:</b>

                    {conference.end_date}

                </p>

                <p>

                    <b>Website:</b>

                    <a

                        href={conference.website}

                        target="_blank"

                        rel="noreferrer"

                    >

                        {conference.website}

                    </a>

                </p>

                <p>

                    <b>Description:</b>

                </p>

                <div
                    style={{
                        background: "var(--surface)",
                        color: "var(--text)",
                        padding: "15px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)"
                    }}
                >

                    {conference.description}

                </div>

                <br />

                <button

                    onClick={onClose}

                >

                    Close

                </button>

            </div>

        </div>

    );

}

export default ConferenceDetailsModal;
export default function GroupOverview({ group }) {

    return (

        <div
            style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,.08)"
            }}
        >

            <h2>About this Group</h2>

            <p>
                {group.description || "No description available."}
            </p>

            <hr />

            <p>
                <b>Created By:</b> {group.created_by_name}
            </p>

            <p>
                <b>Total Members:</b> {group.member_count}
            </p>

            <p>
                <b>Created On:</b>{" "}
                {new Date(group.created_at).toLocaleDateString()}
            </p>

        </div>

    );

}
function DashboardHome() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (

        <div>

            <h1>

                Welcome,
                {" "}
                {user?.name}
                👋

            </h1>

            <p
                style={{
                    color:"#666",
                    fontSize:"18px"
                }}
            >

                Role :
                {" "}
                {user?.role}

            </p>

            <hr />

            <div
                style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(4,1fr)",
                    gap:"20px",
                    marginTop:"30px"
                }}
            >

                <div style={cardStyle}>
                    <h3>📚 Publications</h3>
                    <h1>12</h1>
                </div>

                <div style={cardStyle}>
                    <h3>🤝 Collaborations</h3>
                    <h1>4</h1>
                </div>

                <div style={cardStyle}>
                    <h3>⭐ Citations</h3>
                    <h1>38</h1>
                </div>

                <div style={cardStyle}>
                    <h3>📝 Pending Reviews</h3>
                    <h1>2</h1>
                </div>

            </div>

        </div>

    );

}

const cardStyle = {

    background:"white",

    padding:"25px",

    borderRadius:"12px",

    boxShadow:"0 4px 12px rgba(0,0,0,.1)",

    textAlign:"center"

};

export default DashboardHome;
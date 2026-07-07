function Dashboard() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (

        <div
            style={{
                textAlign: "center",
                marginTop: "100px"
            }}
        >

            <h1>
                Welcome {user?.name} 👋
            </h1>

            <h2>
                Role : {user?.role}
            </h2>

            <p>
                JWT Authentication Successful
            </p>

        </div>

    );

}

export default Dashboard;
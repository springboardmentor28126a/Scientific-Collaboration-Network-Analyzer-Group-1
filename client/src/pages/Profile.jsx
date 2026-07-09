import { useEffect, useState } from "react";

function Profile() {

    const [user, setUser] = useState(null);

    useEffect(() => {

        const storedUser = JSON.parse(
            localStorage.getItem("user")
        );

        setUser(storedUser);

    }, []);

    return (

        <div
            style={{
                padding: "40px"
            }}
        >

            <h1>👤 My Profile</h1>

            <hr />

            <h2>Name</h2>

            <p>{user?.name}</p>

            <h2>Email</h2>

            <p>{user?.email}</p>

            <h2>Role</h2>

            <p>{user?.role}</p>

        </div>

    );

}

export default Profile;
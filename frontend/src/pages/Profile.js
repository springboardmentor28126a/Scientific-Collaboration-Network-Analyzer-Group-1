import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {

  const [profile, setProfile] = useState(null);

  useEffect(() => {

    getProfile();

  }, []);


  const getProfile = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/researcher/1"
      );

      setProfile(response.data);

    } catch (error) {

      console.log(error);

    }

  };


  return (

    <div style={{ padding: "30px" }}>

      <h1>Researcher Profile</h1>

      {
        profile ? (

          <div>

            <p>
              Username: {profile.username}
            </p>

            <p>
              Email: {profile.email}
            </p>

            <p>
              Role: {profile.role}
            </p>

          </div>

        ) : (

          <p>Loading profile...</p>

        )
      }

    </div>

  );

}

export default Profile;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddInstitution() {

    const navigate = useNavigate();

    const [institution, setInstitution] = useState({
        name: "",
        location: "",
        website: ""
    });


    const handleChange = (e) => {
        setInstitution({
            ...institution,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await API.post("/institution/", institution);

            alert("Institution Added Successfully");

            navigate("/institution");

        }
        catch(error) {
            console.log(error);
            alert("Error adding institution");
        }
    };


    return (

        <div className="container mt-4">

            <h2>Add Institution</h2>


            <form onSubmit={handleSubmit}>


                <div className="mb-3">

                    <label>Name</label>

                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={institution.name}
                        onChange={handleChange}
                    />

                </div>



                <div className="mb-3">

                    <label>Location</label>

                    <input
                        type="text"
                        name="location"
                        className="form-control"
                        value={institution.location}
                        onChange={handleChange}
                    />

                </div>



                <div className="mb-3">

                    <label>Website</label>

                    <input
                        type="text"
                        name="website"
                        className="form-control"
                        value={institution.website}
                        onChange={handleChange}
                    />

                </div>



                <button className="btn btn-primary">
                    Add Institution
                </button>


            </form>


        </div>

    );

}


export default AddInstitution;
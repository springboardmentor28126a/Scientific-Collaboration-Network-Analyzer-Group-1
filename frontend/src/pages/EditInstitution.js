import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";


function EditInstitution() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [institution, setInstitution] = useState({
        name: "",
        location: "",
        website: ""
    });



    useEffect(() => {

        fetchInstitution();

    }, []);



    const fetchInstitution = async () => {

        try {

            const response = await API.get(`/institution/${id}`);

            setInstitution(response.data);

        }
        catch(error) {

            console.log(error);

        }

    };



    const handleChange = (e) => {

        setInstitution({

            ...institution,

            [e.target.name]: e.target.value

        });

    };



    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            await API.put(
                `/institution/${id}`,
                institution
            );


            alert("Institution Updated Successfully");


            navigate("/institution");


        }
        catch(error) {

            console.log(error);

        }

    };




    return (

        <div className="container mt-4">


            <h2>Edit Institution</h2>



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

                    Update Institution

                </button>



            </form>


        </div>

    );

}


export default EditInstitution;
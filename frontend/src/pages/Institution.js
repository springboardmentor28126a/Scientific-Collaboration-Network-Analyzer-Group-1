import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function Institution() {

    const [institutions, setInstitutions] = useState([]);


    useEffect(() => {
        fetchInstitutions();
    }, []);



    const fetchInstitutions = async () => {

        try {

            const response = await API.get("/institution/");
            setInstitutions(response.data);

        }
        catch(error) {
            console.log(error);
        }

    };



    const deleteInstitution = async (id) => {

        if(window.confirm("Delete this institution?")) {

            try {

                await API.delete(`/institution/${id}`);

                alert("Institution deleted");

                fetchInstitutions();

            }
            catch(error) {

                console.log(error);

            }

        }

    };



    return (

        <div className="container mt-4">


            <h2>Institution Management</h2>


            <Link
                to="/add-institution"
                className="btn btn-success mb-3"
            >
                Add Institution
            </Link>



            <table className="table table-bordered">


                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Website</th>
                        <th>Actions</th>
                    </tr>

                </thead>



                <tbody>


                {
                    institutions.map((item)=>(

                        <tr key={item.id}>

                            <td>{item.id}</td>

                            <td>{item.name}</td>

                            <td>{item.location}</td>

                            <td>{item.website}</td>


                            <td>

                                <Link
                                    to={`/edit-institution/${item.id}`}
                                    className="btn btn-primary btn-sm me-2"
                                >
                                    Edit
                                </Link>



                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteInstitution(item.id)}
                                >
                                    Delete
                                </button>


                            </td>


                        </tr>


                    ))
                }


                </tbody>


            </table>


        </div>

    );

}


export default Institution;
import { useState } from "react";
import API from "../api";
import { Container, Form, Button, Card } from "react-bootstrap";

function Login() {

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });


  const handleChange = (e) => {

    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await API.post("/login", loginData);

      alert("Login Successful");

      console.log(response.data);

    }
    catch(error){

      alert("Login Failed");

      console.log(error);

    }

  };


  return (

    <Container className="mt-5">

      <Card 
        className="shadow p-4 mx-auto"
        style={{maxWidth:"450px"}}
      >

        <h2 className="text-center mb-4">
          User Login
        </h2>


        <Form onSubmit={handleSubmit}>


          <Form.Group className="mb-3">

            <Form.Label>
              Email
            </Form.Label>

            <Form.Control
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />

          </Form.Group>



          <Form.Group className="mb-3">

            <Form.Label>
              Password
            </Form.Label>

            <Form.Control
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />

          </Form.Group>



          <Button 
            type="submit"
            className="w-100"
          >
            Login
          </Button>


        </Form>


      </Card>

    </Container>

  );

}

export default Login;
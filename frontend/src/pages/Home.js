import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  FaUsers,
  FaBook,
  FaProjectDiagram,
  FaHandshake,
  FaCalendarAlt,
  FaSignInAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Container className="mt-5">

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">
          Scientific Collaboration Network Analyzer
        </h1>

        <p className="lead">
          Research Collaboration Management System
        </p>
      </div>

      <Row className="g-4">

        {/* Researchers */}
        <Col md={4}>
          <Card className="shadow text-center p-3">
            <FaUsers size={50} className="mx-auto text-primary" />
            <Card.Body>
              <Card.Title>Researchers</Card.Title>
              <Card.Text>Manage researcher information.</Card.Text>
              <Button as={Link} to="/researcher">
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Publications */}
        <Col md={4}>
          <Card className="shadow text-center p-3">
            <FaBook size={50} className="mx-auto text-success" />
            <Card.Body>
              <Card.Title>Publications</Card.Title>
              <Card.Text>Manage research publications.</Card.Text>
              <Button variant="success" as={Link} to="/publication">
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Conferences */}
        <Col md={4}>
          <Card className="shadow text-center p-3">
            <FaCalendarAlt size={50} className="mx-auto text-warning" />
            <Card.Body>
              <Card.Title>Conferences</Card.Title>
              <Card.Text>Manage conference details.</Card.Text>
              <Button variant="warning" as={Link} to="/conference">
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Collaborations */}
        <Col md={4}>
          <Card className="shadow text-center p-3">
            <FaHandshake size={50} className="mx-auto text-danger" />
            <Card.Body>
              <Card.Title>Collaborations</Card.Title>
              <Card.Text>Manage collaborations.</Card.Text>
              <Button variant="danger" as={Link} to="/collaboration">
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Projects */}
        <Col md={4}>
          <Card className="shadow text-center p-3">
            <FaProjectDiagram size={50} className="mx-auto text-info" />
            <Card.Body>
              <Card.Title>Projects</Card.Title>
              <Card.Text>Manage research projects.</Card.Text>
              <Button variant="info" as={Link} to="/project">
                Open
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Login */}
        <Col md={4}>
          <Card className="shadow text-center p-3">
            <FaSignInAlt size={50} className="mx-auto text-secondary" />
            <Card.Body>
              <Card.Title>Login</Card.Title>
              <Card.Text>Secure user authentication.</Card.Text>
              <Button variant="secondary" as={Link} to="/login">
                Login
              </Button>
            </Card.Body>
          </Card>
        </Col>

      </Row>

    </Container>
  );
}

export default Home;
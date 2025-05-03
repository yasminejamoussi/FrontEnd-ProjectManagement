import React, { useState, useEffect } from "react";
import { Card, Table, Button, ListGroup } from "react-bootstrap";
import "../../assets/css/style.css";
import Header from "../Layout/Header";
import Sidebar from "../Layout/SideBar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
        
      const jwtToken = localStorage.getItem("token");
      console.log("🔍 Token récupéré :", jwtToken);

      if (!jwtToken) {
        console.warn("⚠️ Aucun token trouvé, redirection vers la connexion.");
        navigate("/signin");
        return;
      }

      if (jwtToken.split(".").length !== 3) {
        console.error("❌ Token JWT mal formé :", jwtToken);
        localStorage.removeItem("jwtToken");
        navigate("/signin");
        return;
      }

      const decoded = jwtDecode(jwtToken);
      console.log("✅ Token décodé :", decoded);
      setUser(decoded);
    } catch (error) {
      console.error("❌ Erreur lors du décodage du token:", error.message);
      localStorage.removeItem("jwtToken");
      navigate("/signin");
    }
  }, [navigate]);

  // ✅ Projets statiques (mock)
  const projects = [
    { _id: "1", name: "Projet Alpha", status: "En cours" },
    { _id: "2", name: "Projet Beta", status: "Terminé" },
    { _id: "3", name: "Projet Gamma", status: "En cours" },
  ];

  // ✅ Tâches statiques (mock)
  const tasks = [
    { name: "Concevoir la maquette", status: "Completed" },
    { name: "Développer l'API", status: "Pending" },
    { name: "Tester les fonctionnalités", status: "Pending" },
  ];

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <div className="app-content">
        <main>
          <div className="container-fluid mt-4">
            {/* Cartes des statistiques */}
            <div className="row">
              <InfoCard title="Total Projets" count={projects.length} color="primary" icon="fas fa-folder" />
              <InfoCard title="Total Tâches" count={tasks.length} color="success" icon="fas fa-tasks" />
            </div>
            <div className="row">
              <InfoCard title="Projets en Retard" count={1} color="danger" icon="fas fa-exclamation-circle" />
              <InfoCard title="Tâches en Attente" count={2} color="warning" icon="fas fa-clock" />
            </div>

            {/* Section principale */}
            <div className="row mt-4">
              {/* Liste des Projets */}
              <div className="col-md-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="main-title">Liste des Projets</h4>
                  {(user?.role === "Admin" || user?.role === "Project Manager") && (
                    <Button variant="success" className="add-button">
                      <i className="fas fa-plus"></i> Ajouter un Projet
                    </Button>
                  )}
                </div>
                <ProjectTable projects={projects} userRole={user?.role} />
              </div>

              {/* Liste des Tâches */}
              <div className="col-md-4">
                <TaskList tasks={tasks} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const InfoCard = ({ title, count, color, icon }) => (
  <div className="col-md-6 mb-4">
    <Card className={`info-card bg-${color} text-white shadow-sm rounded`}>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <h5>{title}</h5>
          <h3>{count}</h3>
        </div>
        <i className={`${icon} fa-3x`}></i>
      </Card.Body>
    </Card>
  </div>
);

const ProjectTable = ({ projects, userRole }) => (
  <Table striped bordered hover responsive className="shadow-sm rounded">
    <thead className="table-dark">
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {projects.length > 0 ? (
        projects.map((project) => (
          <tr key={project._id}>
            <td>{project._id}</td>
            <td>{project.name}</td>
            <td>
              <span className={`badge bg-${project.status === "En cours" ? "warning" : "success"}`}>
                {project.status}
              </span>
            </td>
            <td>
              <Button variant="info" size="sm" className="mx-1">
                <i className="fas fa-eye"></i>
              </Button>
              {(userRole === "Admin" || userRole === "Project Manager") && (
                <Button variant="danger" size="sm" className="mx-1">
                  <i className="fas fa-trash"></i>
                </Button>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="text-center">Aucun projet trouvé.</td>
        </tr>
      )}
    </tbody>
  </Table>
);

const TaskList = ({ tasks }) => (
  <Card className="task-list-card shadow-sm rounded">
    <Card.Header className="bg-dark text-white">
      <i className="fas fa-tasks"></i> Tâches Récentes
    </Card.Header>
    <ListGroup variant="flush">
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
            <strong>{task.name}</strong>
            <span className={`badge bg-${task.status === "Completed" ? "success" : "secondary"}`}>
              {task.status}
            </span>
          </ListGroup.Item>
        ))
      ) : (
        <ListGroup.Item>Aucune tâche trouvée.</ListGroup.Item>
      )}
    </ListGroup>
  </Card>
);

export default Dashboard;
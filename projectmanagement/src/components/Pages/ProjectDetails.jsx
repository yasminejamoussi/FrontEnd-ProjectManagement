import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { NavLink, useParams } from 'react-router-dom';
import { Stack } from '@phosphor-icons/react';
import axios from 'axios';
import Header from "../Layout/Header";
import Sidebar from "../Layout/Sidebar";
import avatar7 from '../../assets/images/avtar/7.png';
import avatar13 from '../../assets/images/avtar/13.png';
import avatar16 from '../../assets/images/avtar/16.png';
import avatar4 from '../../assets/images/avtar/4.png';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      console.log("ID du projet :", id); // Log de l’ID
      try {
        const [projectResponse, usersResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/projects/${id}`),
          axios.get("http://localhost:4000/api/auth/users"),
        ]);
        console.log("Réponse projet complète :", projectResponse.data);
        console.log("teamMembers brut :", projectResponse.data.teamMembers); // Log spécifique pour teamMembers
        setProject(projectResponse.data);
        setTeamMembers(projectResponse.data.teamMembers || []);
        console.log("teamMembers assigné :", projectResponse.data.teamMembers || []); // Log après assignation
        const available = usersResponse.data.filter(user => {
          const roleName = user.role?.name;
          const isValidRole = ["Team Leader", "Team Member"].includes(roleName);
          const isNotAssigned = !projectResponse.data.teamMembers.some(member => member._id === user._id);
          return isValidRole && isNotAssigned;
        });
        console.log("Membres disponibles :", available);
        setAvailableMembers(available);
      } catch (err) {
        console.error("Erreur lors de la récupération :", err.response?.data || err.message);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);
  
  // Ajout d’un log dans le rendu
  console.log("État teamMembers rendu :", teamMembers);

  const removeTeamMember = async (memberId) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ce membre de l’équipe ?`)) {
      try {
        const updatedTeam = teamMembers.filter(member => member._id !== memberId);
        await axios.put(`http://localhost:4000/api/projects/${id}`, { teamMembers: updatedTeam.map(m => m._id) });
        setTeamMembers(updatedTeam);
        setAvailableMembers([...availableMembers, teamMembers.find(m => m._id === memberId)]);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  const addTeamMember = async (e) => {
    e.preventDefault();
    if (selectedMember) {
      try {
        const memberToAdd = availableMembers.find(member => member._id === selectedMember);
        const updatedTeam = [...teamMembers, memberToAdd];
        await axios.put(`http://localhost:4000/api/projects/${id}`, { teamMembers: updatedTeam.map(m => m._id) });
        setTeamMembers(updatedTeam);
        setAvailableMembers(availableMembers.filter(member => member._id !== selectedMember));
        setShowAddMemberModal(false);
        setSelectedMember('');
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  const getProgressPercentage = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return 10;
      case "in progress": return 50;
      case "completed": return 100;
      default: return 0;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-warning";
      case "in progress": return "bg-primary";
      case "completed": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) return <div className="text-center my-5">Chargement en cours...</div>;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;
  if (!project) return <div className="text-center my-5">Projet non trouvé</div>;

  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Sidebar />
      <Helmet>
        <title>Project Details - {project.name}</title>
        <meta name="description" content={`Détails du projet ${project.name}.`} />
      </Helmet>

      <div className="app-content" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <main>
          <div className="container-fluid py-4">
            <div className="row mb-4">
              <div className="col-12">
                <h1 className="main-title text-dark" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {project.name}
                </h1>
                <ul className="app-line-breadcrumbs mb-0 d-flex list-unstyled">
                  <li className="me-2">
                    <NavLink to="/projects" className="f-s-14 f-w-500 text-muted">
                      <Stack size={16} className="ph-duotone me-1" /> Projects
                    </NavLink>
                  </li>
                  <li className="ms-2">
                    <span className="f-s-14 f-w-500 text-primary">Details</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-12 col-lg-6 col-xxl-4 order-1">
                <div className="card shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  <div className="card-header bg-gradient-primary text-white py-4">
                    <h4 className="m-0" style={{ fontWeight: '600' }}>Details of the project</h4>
                  </div>
                  <div className="card-body p-5">
                    <table className="table table-borderless align-middle mb-0">
                      <tbody>
                        <tr>
                          <td className="f-w-600 text-muted" style={{ fontSize: '1.1rem' }}>Name</td>
                          <td className="text-end text-dark" style={{ fontSize: '1.1rem' }}>{project.name}</td>
                        </tr>
                        <tr>
                          <td className="f-w-600 text-muted" style={{ fontSize: '1.1rem' }}>Manager</td>
                          <td className="text-end text-dark" style={{ fontSize: '1.1rem' }}>{project.projectManager?.firstname} {project.projectManager?.lastname}</td>
                        </tr>
                        <tr>
                          <td className="f-w-600 text-muted" style={{ fontSize: '1.1rem' }}>Start</td>
                          <td className="text-end text-primary" style={{ fontSize: '1.1rem' }}>{formatDate(project.startDate)}</td>
                        </tr>
                        <tr>
                          <td className="f-w-600 text-muted" style={{ fontSize: '1.1rem' }}>End</td>
                          <td className="text-end text-danger" style={{ fontSize: '1.1rem' }}>{formatDate(project.endDate)}</td>
                        </tr>
                        <tr>
                          <td className="f-w-600 text-muted" style={{ fontSize: '1.1rem' }}>Status</td>
                          <td className="text-end">
                            <span className={`badge ${getStatusBadgeClass(project.status)} text-white px-3 py-2`} style={{ fontSize: '0.9rem' }}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="f-w-600 text-muted" style={{ fontSize: '1.1rem' }}>Progress</td>
                          <td className="text-end">
                            <div className="progress" style={{ height: '16px', borderRadius: '8px', backgroundColor: '#e9ecef' }}>
                              <div
                                className={`progress-bar ${project.status.toLowerCase() === 'completed' ? 'bg-success' : 'bg-primary'}`}
                                role="progressbar"
                                style={{ 
                                  width: `${getProgressPercentage(project.status)}%`, 
                                  borderRadius: '8px', 
                                  transition: 'width 0.6s ease'
                                }}
                                aria-valuenow={getProgressPercentage(project.status)}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                            <small className="text-muted d-block mt-2" style={{ fontSize: '0.9rem' }}>{getProgressPercentage(project.status)}%</small>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-xxl-4 order-2">
                <div className="card shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  <div className="card-header bg-gradient-dark text-white py-4 d-flex align-items-center justify-content-between">
                    <h4 className="m-0" style={{ fontWeight: '600' }}>Project Team</h4>
                    <button
                      className="btn btn-light btn-sm shadow-sm"
                      onClick={() => setShowAddMemberModal(true)}
                    >
                      <i className="ti ti-plus"></i>
                    </button>
                  </div>
                  <div className="card-body p-5">
                    <div className="project-team-list">
                      {teamMembers.map((member, index) => (
                        <div key={member._id} className="d-flex align-items-center mb-3 p-2 bg-light rounded" style={{ transition: 'background 0.3s' }}>
                          <div className="h-45 w-45 d-flex-center b-r-50 overflow-hidden bg-primary text-white">
                            {index === 0 && <img src={avatar7} alt={member.firstname} className="img-fluid" />}
                            {index === 1 && <img src={avatar13} alt={member.firstname} className="img-fluid" />}
                            {index === 2 && <span>{member.firstname?.charAt(0)}{member.lastname?.charAt(0)}</span>}
                            {index === 3 && <img src={avatar16} alt={member.firstname} className="img-fluid" />}
                            {index === 4 && <span>{member.firstname?.charAt(0)}{member.lastname?.charAt(0)}</span>}
                            {index > 4 && <img src={avatar4} alt={member.firstname} className="img-fluid" />}
                          </div>
                          <div className="flex-grow-1 ps-3">
                            <h6 className="mb-0 text-dark">{member.firstname} {member.lastname}</h6>
                            <p className="text-muted f-s-13 mb-0">{member.role?.name || "Rôle non défini"}</p>
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm ms-2 shadow-sm"
                            onClick={() => removeTeamMember(member._id)}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-xxl-4 order-3">
                <div className="card shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  <div className="card-header bg-gradient-primary text-white py-4">
                    <h4 className="m-0" style={{ fontWeight: '600' }}>Project Management</h4>
                  </div>
                  <div className="card-body p-5">
                    <div className="mb-4 border-bottom pb-3">
                      <h6 className="f-w-600 mb-3 text-dark">
                        <i className="ti ti-target me-2 text-primary"></i> Project Objectives
                      </h6>
                      <ul className="list-group list-group-flush">
                        {project.objectives.map((objective, index) => (
                          <li key={index} className="list-group-item border-0 ps-0 text-muted py-1">
                            <i className="ti ti-circle-check me-2 text-success"></i> {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-4 border-bottom pb-3">
                      <h6 className="f-w-600 mb-3 text-dark">
                        <i className="ti ti-checklist me-2 text-success"></i> Deliverables
                      </h6>
                      <ul className="list-group list-group-flush">
                        {project.deliverables.map((deliverable, index) => (
                          <li key={index} className="list-group-item border-0 ps-0 text-muted py-1">
                            <i className="ti ti-circle-check me-2 text-success"></i> {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h6 className="f-w-600 mb-3 text-dark">
                        <i className="ti ti-calendar me-2 text-danger"></i> Deadline
                      </h6>
                      <p className="text-muted bg-light p-2 rounded">{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-6 col-xxl-4 order-4">
                <div className="card shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  <div className="card-header bg-gradient-dark text-white py-4">
                    <h4 className="m-0" style={{ fontWeight: '600' }}>About the Project</h4>
                  </div>
                  <div className="card-body p-5">
                    <div className="mb-3">
                      <h6 className="text-dark">Project Description</h6>
                      <p className="text-muted bg-light p-3 rounded" style={{ lineHeight: '1.6' }}>
                        {project.description || "Aucune description disponible."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showAddMemberModal && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 1040,
              }}
              onClick={() => setShowAddMemberModal(false)}
            />
            <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                  <div className="modal-header bg-light border-bottom-0 py-3">
                    <h5 className="modal-title text-dark">Add a member to the team</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddMemberModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <form className="app-form" onSubmit={addTeamMember}>
                      <div className="mb-4">
                        <label htmlFor="memberSelect" className="form-label f-w-600 text-dark">Select a member</label>
                        <select
                          className="form-select shadow-sm"
                          id="memberSelect"
                          value={selectedMember}
                          onChange={(e) => setSelectedMember(e.target.value)}
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="">Select a member...</option>
                          {availableMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.firstname} {member.lastname} - {member.role?.name || "Rôle non défini"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="modal-footer border-top-0 pt-0">
                        <button
                          type="button"
                          className="btn btn-outline-secondary shadow-sm"
                          onClick={() => setShowAddMemberModal(false)}
                          style={{ borderRadius: '10px' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary shadow-sm"
                          disabled={!selectedMember}
                          style={{ borderRadius: '10px' }}
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="go-top" style={{ backgroundColor: '#007bff', borderRadius: '50%' }}>
        <span className="progress-value text-white">
          <i className="ti ti-arrow-up"></i>
        </span>
      </div>
    </div>
  );
};

export default ProjectDetails;
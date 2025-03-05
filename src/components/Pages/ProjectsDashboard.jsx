import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import Header from "../Layout/Header";
import Sidebar from "../Layout/Sidebar";
import logo1 from '../../assets/images/icons/logo1.png';
import { jwtDecode } from "jwt-decode";

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [filters, setFilters] = useState({ status: '', projectManager: '', startDate: '', endDate: '' });
  const [sort, setSort] = useState({ sortBy: '', order: 'asc' });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignedTo: [],
    startDate: '', // Ajouté
    dueDate: '',   // Ajouté
  });
  const [predictedDuration, setPredictedDuration] = useState(null);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [taskList, setTaskList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const jwtToken = localStorage.getItem("token");
      if (jwtToken) {
        const decoded = jwtDecode(jwtToken);
        setUserRole(decoded?.role || 'Guest');
        setUserId(decoded?.id);
      }

      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:4000/api/projects", { params: { ...filters, ...sort } }),
          axios.get("http://localhost:4000/api/auth/users"),
        ]);
        console.log("Utilisateurs récupérés :", usersResponse.data);
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, sort]);

  const handleAddProject = async (projectData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.post("http://localhost:4000/api/projects", projectData);
      setProjects([...projects, response.data]);
      setSuccess("Projet ajouté avec succès !");
      setShowModal(false);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  ////////////////////////////////////////////////////////////////
  const suggestPriorityWithIA = async () => {
    if (!newTask.title) {
      setError("Please enter a task title before requesting an AI suggestion.");
      return;
    }

    setIsSuggestingPriority(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:4000/api/prioritize', {
        title: newTask.title,
        description: newTask.description || '',
      });
      const { priority } = response.data;
      setNewTask(prev => ({ ...prev, priority }));
      setSuccess(`AI-suggested priority: ${priority}`);
    } catch (err) {
      setError("Failed to get AI suggestion: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSuggestingPriority(false);
    }
  };
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskAssignedToChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setNewTask(prev => ({ ...prev, assignedTo: selected }));
  };

  ////////////////////////////////

  const handleUpdateProject = async (projectData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.put(`http://localhost:4000/api/projects/${editingProject._id}`, projectData);
      setProjects(projects.map(project => project._id === editingProject._id ? response.data : project));
      setSuccess("Projet modifié avec succès !");
      setShowModal(false);
      setEditingProject(null);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      name: e.target.pName.value,
      description: e.target.projectDescription.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      status: e.target.status.value,
      teamMembers: Array.from(e.target.team.selectedOptions).map(option => option.value),
      deliverables: e.target.deliverables.value.split(',').map(item => item.trim()),
      objectives: e.target.objectives.value.split(',').map(item => item.trim()),
      tasks: taskList,
    };

    if (!editingProject) {
      projectData.projectManager = userId;
    }

    if (new Date(projectData.endDate) < new Date(projectData.startDate)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    if (editingProject) {
      handleUpdateProject(projectData);
    } else {
      handleAddProject(projectData);
    }
    setShowModal(false); //khalil
    setPredictedDuration(null);//khalil
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:4000/api/projects/${projectId}`);
      setProjects(projects.filter(project => project._id !== projectId));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const addTaskToList = () => {
    if (newTask.title.trim()) {
      // Validation des dates si elles sont fournies
      if (newTask.dueDate && newTask.startDate && new Date(newTask.dueDate) < new Date(newTask.startDate)) {
        setError("La date d'échéance de la tâche ne peut pas être antérieure à la date de début.");
        return;
      }
      setTaskList([...taskList, { ...newTask }]);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', assignedTo: [], startDate: '', dueDate: '' });
    }
  };

  const removeTaskFromList = (index) => {
    setTaskList(taskList.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  //Project-deadline-prediction(khalil)
  const suggestEndDate = async () => {
    try {
      const projectData = {
        startDate: document.getElementById("startDate").value,
        tasks: taskList,
        teamMembers: Array.from(document.getElementById("team").selectedOptions).map(option => option.value)
      };

      const response = await axios.post("http://localhost:4000/api/projects/predict", projectData);
      const endDate = new Date(response.data.predictedEndDate);
      document.getElementById("endDate").value = endDate.toISOString().split("T")[0];
      setPredictedDuration(response.data.predictedDuration); // Met à jour la durée ici
    } catch (error) {
      setError("Erreur lors de la prédiction : " + error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-warning";
      case "in progress": return "bg-primary";
      case "completed": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const getProgressPercentage = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return 5;
      case "in progress": return 50;
      case "completed": return 100;
      default: return 0;
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSort(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Chargement en cours...</div>;

  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Sidebar />
      <Helmet>
        <title>Project Management - Projects</title>
        <meta name="description" content="Tableau de bord pour gérer vos projets efficacement." />
      </Helmet>
      <div className="app-content" style={{ flex: 1 }}>
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
                <h1 className="main-title">Projects</h1>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <form className="d-flex flex-wrap gap-3">
                  <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control w-auto">
                    <option value="">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <select name="projectManager" value={filters.projectManager} onChange={handleFilterChange} className="form-control w-auto">
                    <option value="">All managers</option>
                    {users.filter(u => ["Project Manager", "Admin"].includes(u.role?.name)).map(user => (
                      <option key={user._id} value={user._id}>{user.firstname} {user.lastname}</option>
                    ))}
                  </select>
                  <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control w-auto" />
                  <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control w-auto" />
                  <select name="sortBy" value={sort.sortBy} onChange={handleSortChange} className="form-control w-auto">
                    <option value="">Sort by...</option>
                    <option value="name">Name</option>
                    <option value="startDate">Start date</option>
                    <option value="endDate">End date</option>
                  </select>
                  <select name="order" value={sort.order} onChange={handleSortChange} className="form-control w-auto">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  {(userRole === "Admin" || userRole === "Project Manager") && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => { setShowModal(true); setPredictedDuration(null); }}
                    >
                      <i className="ti ti-plus"></i> New project
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="row" id="card-container">
              {projects.map((project) => (
                <div key={project._id} className="col-md-6 col-xl-4 project-card">
                  <div className="card hover-effect">
                    <div className="card-header">
                      <div className="d-flex align-items-center">
                        <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden">
                          <img src={logo1} alt="" className="img-fluid" />
                        </div>
                        <NavLink to={`/project-details/${project._id}`} className="flex-grow-1 ps-2">
                          <h6 className="m-0 text-dark f-w-600">{project.name}</h6>
                          <div className="text-muted f-s-14 f-w-500">{project.description}</div>
                        </NavLink>
                        {(userRole === "Admin" || userRole === "Project Manager") && (
                          <div className="dropdown">
                            <button className="bg-none border-0" type="button" data-bs-toggle="dropdown">
                              <i className="ti ti-dots-vertical text-dark"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  onClick={() => { setEditingProject(project); setTaskList(project.tasks || []); setShowModal(true); }}
                                >
                                  <i className="ti ti-edit text-success"></i> Edit
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item delete-button"
                                  href="#"
                                  onClick={() => handleDeleteProject(project._id)}
                                >
                                  <i className="ti ti-trash text-danger"></i> Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex">
                        <div>
                          <h6 className="text-dark f-s-14">Start: <span className="text-success">{formatDate(project.startDate)}</span></h6>
                          <h6 className="text-dark f-s-14">End: <span className="text-danger">{formatDate(project.endDate)}</span></h6>
                        </div>
                      </div>
                      <p className="text-muted f-s-14 text-secondary txt-ellipsis-2">{project.description}</p>
                      <div className="text-end mb-2">
                        <span className={`badge ${getStatusBadgeClass(project.status)} text-light`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="progress w-100" role="progressbar">
                        <div
                          className={`progress-bar bg-${project.status === "Completed" ? 'success' : 'primary'}`}
                          style={{ width: `${getProgressPercentage(project.status)}%` }}
                        >
                          {getProgressPercentage(project.status)}%
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="row align-items-center">
                        <div className="col-6">
                          <span
                            className="text-dark f-w-600 cursor-pointer"
                            onClick={() => setShowMembersModal(project._id)}
                          >
                            <i className="ti ti-brand-wechat f-s-18"></i> {project.teamMembers.length} Members
                          </span>
                        </div>
                        <div className="col-6 d-flex justify-content-end gap-2">
                          <NavLink
                            to={`/project-details/${project._id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="ti ti-eye f-s-16"></i> Details
                          </NavLink>
                          <NavLink
                            to={`/kanban/${project._id}`}
                            className="btn btn-outline-info btn-sm"
                          >
                            <i className="ti ti-list f-s-16"></i> View tasks
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showModal && (
              <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5">{editingProject ? "Edit a project" : "Add a new project"}</h1>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => { setShowModal(false); setEditingProject(null); setTaskList([]); setSuccess(null); setError(null); }}
                      />
                    </div>
                    <div className="modal-body">
                      <form className="app-form" onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="pName" className="form-label">Project name</label>
                          <input type="text" className="form-control" id="pName" defaultValue={editingProject?.name || ""} required />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Start date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="startDate"
                            defaultValue={editingProject?.startDate ? new Date(editingProject.startDate).toISOString().split('T')[0] : ""}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">End date</label>
                          <input
                            type="date"
                            className="form-control"
                            id="endDate"
                            defaultValue={editingProject?.endDate ? new Date(editingProject.endDate).toISOString().split('T')[0] : ""}
                            required
                          />
                          {/* Project-deadline-prediction(khalil) */}
                          <div className="mb-3">
                            <div className='text-center'>
                              <button type="button" className="btn btn-primary mt-2" onClick={suggestEndDate}>
                                Suggest a date
                              </button>
                              {predictedDuration && (
                                <p className="mt-2 text-muted">Estimated duration : {predictedDuration} Days</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="status" className="form-label">Status</label>
                          <select className="form-control" id="status" defaultValue={editingProject?.status || ""} required>
                            <option value="" disabled>Select a status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="projectDescription" className="form-label">Description</label>
                          <textarea className="form-control" rows="5" id="projectDescription" defaultValue={editingProject?.description || ""} />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="team" className="form-label">Team project</label>
                          <select className="form-control" id="team" multiple defaultValue={editingProject?.teamMembers || []} style={{ height: '150px' }}>
                            {users.filter(user => ["Team Leader", "Team Member"].includes(user.role?.name)).map(user => (
                              <option key={user._id} value={user._id}>
                                {user.firstname} {user.lastname} ({user.role?.name || "Rôle non défini"})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="deliverables" className="form-label">Deliverables</label>
                          <input
                            type="text"
                            className="form-control"
                            id="deliverables"
                            defaultValue={editingProject?.deliverables?.join(', ') || ""}
                            placeholder="Séparés par des virgules"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="objectives" className="form-label">Objectives</label>
                          <input
                            type="text"
                            className="form-control"
                            id="objectives"
                            defaultValue={editingProject?.objectives?.join(', ') || ""}
                            placeholder="Séparés par des virgules"
                          />
                        </div>
                        <div className="mb-3">
                          <h5>Add tasks</h5>
                          <div className="row">
                            <div className="col-md-4">
                              <label className="form-label">Title</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Status</label>
                              <select
                                className="form-control"
                                value={newTask.status}
                                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                              >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                                <option value="Tested">Tested</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Priority</label>
                              <select
                                className="form-control"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-md-4">
                              <label className="form-label">Start date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={newTask.startDate}
                                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Deadline</label>
                              <input
                                type="date"
                                className="form-control"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Assigned to</label>
                              <select
                                className="form-control"
                                multiple
                                value={newTask.assignedTo}
                                onChange={(e) => setNewTask({ ...newTask, assignedTo: Array.from(e.target.selectedOptions).map(opt => opt.value) })}
                                style={{ height: '100px' }}
                              >
                                {users.filter(user => ["Team Leader", "Team Member"].includes(user.role?.name)).map(user => (
                                  <option key={user._id} value={user._id}>
                                    {user.firstname} {user.lastname}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-md-12">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <button
                              type="button"
                              className="btn btn-info me-2"
                              onClick={suggestPriorityWithIA}
                              disabled={isSuggestingPriority}
                            >
                              {isSuggestingPriority ? "Suggesting..." : "Suggest Priority with AI"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-primary mt-2"
                              onClick={addTaskToList}
                            >
                              Add task
                            </button>
                          </div>
                        </div>
                        {taskList.length > 0 && (
                          <div className="mb-3">
                            <h5>Added tasks</h5>
                            <ul className="list-group">
                              {taskList.map((task, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                  <span>
                                    {task.title} ({task.status}, {task.priority})
                                    {task.startDate && ` - Start: ${formatDate(task.startDate)}`}
                                    {task.dueDate && ` - Deadline: ${formatDate(task.dueDate)}`}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeTaskFromList(index)}
                                  >
                                    Delete
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setShowModal(false); setEditingProject(null); setTaskList([]); setSuccess(null); setError(null); setPredictedDuration(null); }}
                          >
                            Close
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Loading..." : (editingProject ? "Edit" : "Add")}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectsDashboard;
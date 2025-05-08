import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import Header from "../Layout/Header";
import Sidebar from '../Layout/SideBar';
import user from '../../assets/images/avtar/user.jpg';
import { jwtDecode } from "jwt-decode";

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
    startDate: '',
    dueDate: '',
  });
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isSuggestingUsers, setIsSuggestingUsers] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [predictedDuration, setPredictedDuration] = useState(null);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleImageError = (e) => {
    e.target.src = user;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const jwtToken = localStorage.getItem("token");
      let userRole = 'Guest';
      let userId = null;

      if (jwtToken) {
        const decoded = jwtDecode(jwtToken);
        userRole = decoded?.role || 'Guest';
        userId = decoded?.id;
        setUserRole(userRole);
        setUserId(userId);
      }

      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:4000/api/projects", {
            headers: { Authorization: `Bearer ${jwtToken}` },
            params: { ...filters, ...sort }
          }),
          axios.get("http://localhost:4000/api/auth/users", {
            headers: { Authorization: `Bearer ${jwtToken}` }
          }),
        ]);

        const allProjects = projectsResponse.data || [];
        const allUsers = usersResponse.data || [];

        let filteredProjects = allProjects;
        if (userRole === 'Project Manager') {
          filteredProjects = allProjects.filter(
            (project) => project.projectManager?._id === userId
          );
        } else if (userRole === 'Team Leader' || userRole === 'Team Member') {
          filteredProjects = allProjects.filter(
            (project) =>
              project.projectManager?._id === userId ||
              project.teamMembers?.some((member) => member._id === userId)
          );
        } else if (userRole === 'Guest') {
          filteredProjects = [];
        }

        setProjects(filteredProjects);
        setUsers(allUsers);
      } catch (error) {
        setFormErrors({ general: " Failed to fetch data - " + (error.response?.data?.message || error.message) });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, sort]);

  useEffect(() => {
    if (editingProject) {
      setSelectedTeamMembers(editingProject.teamMembers.map(member => member._id || member));
      setProjectStartDate(editingProject.startDate ? new Date(editingProject.startDate).toISOString().split('T')[0] : '');
      setProjectEndDate(editingProject.endDate ? new Date(editingProject.endDate).toISOString().split('T')[0] : '');
    } else {
      setSelectedTeamMembers([]);
      setProjectStartDate('');
      setProjectEndDate('');
    }
  }, [editingProject]);

  const handleAddProject = async (projectData) => {
    setIsSubmitting(true);
    setFormErrors({});
    setSuccess(null);
    try {
      const response = await axios.post("http://localhost:4000/api/projects", projectData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setProjects([...projects, response.data.project]);
      setSuccess("Success: Project added successfully!");
      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      setFormErrors({ general: ` Failed to add project - ${errorMessage}` });
      console.error("Error adding project:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestPriorityWithIA = async () => {
    if (!newTask.title) {
      setFormErrors({ taskTitle: " Please enter a task title before requesting an AI suggestion." });
      return;
    }

    setIsSuggestingPriority(true);
    setFormErrors(prev => ({ ...prev, taskPriority: '' }));

    try {
      const response = await axios.post('http://localhost:4000/api/prioritize', {
        title: newTask.title,
        description: newTask.description || '',
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const { priority } = response.data;
      setNewTask(prev => ({ ...prev, priority }));
      setSuccess("Success: AI suggested priority - " + priority);
    } catch (err) {
      setFormErrors({ taskPriority: " Failed to suggest priority - " + (err.response?.data?.error || err.message) });
    } finally {
      setIsSuggestingPriority(false);
    }
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'title' && value.trim()) {
      setFormErrors(prev => ({ ...prev, taskTitle: '' }));
    }
  };

  const handleTaskAssignedToChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setNewTask(prev => ({ ...prev, assignedTo: selected }));
  };

  const handleTeamSelectionChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    const teamLeaders = users.filter(user => user.role?.name === 'Team Leader').map(user => user._id);
    const selectedTeamLeaders = selected.filter(id => teamLeaders.includes(id));
    
    if (selectedTeamLeaders.length > 1) {
      setFormErrors(prev => ({ ...prev, team: " You can only select one Team Leader." }));
      return;
    }

    setSelectedTeamMembers(selected);
    setFormErrors(prev => ({ ...prev, team: '' }));
  };

  const handleUpdateProject = async (projectData) => {
    setIsSubmitting(true);
    setFormErrors({});
    setSuccess(null);
    try {
      const response = await axios.put(`http://localhost:4000/api/projects/${editingProject._id}`, projectData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setProjects(projects.map(project => project._id === editingProject._id ? response.data : project));
      setSuccess("Success: Project updated successfully!");
      setShowModal(false);
      setEditingProject(null);
    } catch (error) {
      setFormErrors({ general: " Failed to update project - " + (error.response?.data?.error || error.message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestUsersBasedOnDeliverables = async (deliverables) => {
    if (!deliverables || deliverables.trim() === "") {
      setSuggestedUsers([]);
      setFormErrors(prev => ({ ...prev, deliverables: '' }));
      return;
    }
  
    setIsSuggestingUsers(true);
    setSuggestedUsers([]);
    setFormErrors(prev => ({ ...prev, deliverables: '' }));
  
    try {
      const tempProjectData = {
        name: "Temp Project",
        description: "Temporary project for skill extraction",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        deliverables: deliverables.split(',').map(item => item.trim()).filter(item => item),
        objectives: [],
        projectManager: userId,
        teamMembers: [],
        tasks: [],
      };
  
      const response = await axios.post("http://localhost:4000/api/projects", tempProjectData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const projectId = response.data.project._id;
  
      const matchResponse = await axios.get(`http://localhost:4000/api/projects/${projectId}/match-users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
  
      setSuggestedUsers(matchResponse.data.matchedUsers || []);
  
      await axios.delete(`http://localhost:4000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (error) {
      setFormErrors(prev => ({
        ...prev,
        deliverables: " Failed to suggest users - " + (error.response?.data?.message || error.message)
      }));
      setSuggestedUsers([]);
    } finally {
      setIsSuggestingUsers(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setProjectStartDate(value);
    } else if (name === 'endDate') {
      setProjectEndDate(value);
    }
    if (projectStartDate && projectEndDate && new Date(projectEndDate) >= new Date(projectStartDate)) {
      setFormErrors(prev => ({ ...prev, endDate: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});
    const projectData = {
      name: e.target.pName.value.trim(),
      description: e.target.projectDescription.value.trim(),
      startDate: projectStartDate,
      endDate: projectEndDate,
      teamMembers: Array.from(e.target.team.selectedOptions).map(option => option.value),
      deliverables: e.target.deliverables.value.split(',').map(item => item.trim()).filter(item => item),
      objectives: e.target.objectives.value.split(',').map(item => item.trim()).filter(item => item),
      tasks: taskList,
    };
  
    if (!editingProject) {
      projectData.projectManager = userId;
    }
  
    // Validation checks
    if (!projectData.name) {
      setFormErrors(prev => ({ ...prev, general: "Project name is required." }));
      return;
    }
    if (!projectData.startDate || !projectData.endDate) {
      setFormErrors(prev => ({ ...prev, general: "Start date and end date are required." }));
      return;
    }
    if (new Date(projectData.endDate) < new Date(projectData.startDate)) {
      setFormErrors(prev => ({ ...prev, endDate: "The end date must be after the start date." }));
      return;
    }
  
    if (editingProject) {
      handleUpdateProject(projectData);
    } else {
      handleAddProject(projectData);
    }
    resetModalState();
    setShowModal(false);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:4000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setProjects(projects.filter(project => project._id !== projectId));
      setSuccess("Success: Project deleted successfully!");
    } catch (error) {
      setFormErrors({ general: " Failed to delete project  " + (error.response?.data?.message || error.message) });
    }
  };

  const addTaskToList = () => {
    if (newTask.title.trim()) {
      const newFieldErrors = {};
      if (newTask.startDate && projectStartDate && new Date(newTask.startDate) < new Date(projectStartDate)) {
        newFieldErrors.startDate = "Error: The task cannot start before the project.";
      }
      if (newTask.dueDate && newTask.startDate && new Date(newTask.dueDate) < new Date(newTask.startDate)) {
        newFieldErrors.dueDate = "Error: The task's due date cannot be earlier than the start date.";
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        return;
      }

      setTaskList([...taskList, { ...newTask }]);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', assignedTo: [], startDate: '', dueDate: '' });
      setFieldErrors({});
    }
  };

  const removeTaskFromList = (index) => {
    setTaskList(taskList.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const suggestEndDate = async () => {
    try {
      const projectData = {
        startDate: projectStartDate,
        tasks: taskList,
        teamMembers: Array.from(document.getElementById("team").selectedOptions).map(option => option.value)
      };

      const response = await axios.post("http://localhost:4000/api/projects/predict", projectData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const endDate = new Date(response.data.predictedEndDate);
      setProjectEndDate(endDate.toISOString().split("T")[0]);
      setPredictedDuration(response.data.predictedDuration);
      if (projectStartDate && new Date(endDate) >= new Date(projectStartDate)) {
        setFormErrors(prev => ({ ...prev, endDate: '' }));
      }
    } catch (error) {
      setFormErrors({ endDate: " Failed to predict end date " });
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

  const resetModalState = () => {
    setEditingProject(null);
    setTaskList([]);
    setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', assignedTo: [], startDate: '', dueDate: '' });
    setSuccess(null);
    setFormErrors({});
    setFieldErrors({});
    setPredictedDuration(null);
    setSuggestedUsers([]);
    setSelectedTeamMembers([]);
    setProjectStartDate('');
    setProjectEndDate('');
    setIsSuggestingUsers(false);
    setIsSuggestingPriority(false);
  };

  const handleOpenModal = (project = null) => {
    resetModalState();
    if (project) {
      setEditingProject(project);
      setTaskList(project.tasks || []);
      setSelectedTeamMembers(project.teamMembers.map(member => member._id || member));
      setProjectStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
      setProjectEndDate(project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
    }
    setShowModal(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Header />
      <Sidebar />
      <Helmet>
        <title>Project Management - Projects</title>
        <meta name="description" content="Dashboard to manage your projects efficiently." />
      </Helmet>
      <div className="app-content" style={{ flex: 1 }}>
        <main>
          <div className="container-fluid">
            <br></br>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="section-title f-w-700">Projects</h4>
              {(userRole === "Admin" || userRole === "Project Manager") && (
                <button
                  id="newProject"
                  type="button"
                  className="btn btn-primary"
                  style={{ minWidth: '150px', height: '38px', borderRadius: '5px', lineHeight: '1.5' }}
                  onClick={() => handleOpenModal()}
                  aria-label="Add new project"
                >
                  <i className="ti ti-plus"></i> New project
                </button>
              )}
            </div>

            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                  <h5 style={{ color: '#34495e', marginBottom: '15px' }}>Filters</h5>
                  <form className="d-flex flex-wrap gap-3 align-items-end">
                    <div className="form-group">
                      <label htmlFor="filterStatus" className="form-label" style={{ color: '#7f8c8d' }}>Status</label>
                      <select
                        id="filterStatus"
                        name="status"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.status}
                        onChange={handleFilterChange}
                        aria-label="Filter by status"
                      >
                        <option value="">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterProjectManager" className="form-label" style={{ color: '#7f8c8d' }}>Project Manager</label>
                      <select
                        id="filterProjectManager"
                        name="projectManager"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.projectManager}
                        onChange={handleFilterChange}
                        aria-label="Filter by project manager"
                      >
                        <option value="">All managers</option>
                        {users.filter(u => ["Project Manager", "Admin"].includes(u.role?.name)).map(user => (
                          <option key={user._id} value={user._id}>{user.firstname} {user.lastname}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterStartDate" className="form-label" style={{ color: '#7f8c8d' }}>Start Date</label>
                      <input
                        id="filterStartDate"
                        type="date"
                        name="startDate"
                        className="form-control"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        aria-label="Filter by start date"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterEndDate" className="form-label" style={{ color: '#7f8c8d' }}>End Date</label>
                      <input
                        id="filterEndDate"
                        type="date"
                        name="endDate"
                        className="form-control"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        aria-label="Filter by end date"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="sortBy" className="form-label" style={{ color: '#7f8c8d' }}>Sort By</label>
                      <select
                        id="sortBy"
                        name="sortBy"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={sort.sortBy}
                        onChange={handleSortChange}
                        aria-label="Sort by"
                      >
                        <option value="">Sort by...</option>
                        <option value="name">Name</option>
                        <option value="startDate">Start date</option>
                        <option value="endDate">End date</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="sortOrder" className="form-label" style={{ color: '#7f8c8d' }}>Order</label>
                      <select
                        id="sortOrder"
                        name="order"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={sort.order}
                        onChange={handleSortChange}
                        aria-label="Sort order"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="row" id="card-container">
              {projects.map((project) => {
                const projectManager = users.find(user => user._id === project.projectManager?._id);
                return (
                  <div key={project._id} className="col-md-6 col-xl-4 project-card">
                    <div className="card hover-effect">
                      <div className="card-header">
                        <div className="d-flex align-items-center">
                          <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden">
                            {projectManager?.profileImage ? (
                              <img
                                src={projectManager.profileImage}
                                alt={`${projectManager?.firstname} ${projectManager?.lastname}`}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={handleImageError}
                              />
                            ) : (
                              <img
                                src={user}
                                alt="Default Project Manager"
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <NavLink to={`/project-details/${project._id}`} className="flex-grow-1 ps-2">
                            <h6 className="m-0 text-dark f-w-600">{project.name}</h6>
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
                                    onClick={() => handleOpenModal(project)}
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
                );
              })}
            </div>
          </div>
        </main>
      </div>
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block', zIndex: 1150 }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5">{editingProject ? "Edit a project" : "Add a new project"}</h1>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      resetModalState();
                    }}
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
                        name="startDate"
                        value={projectStartDate}
                        onChange={handleDateChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">End date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="endDate"
                        name="endDate"
                        value={projectEndDate}
                        onChange={handleDateChange}
                        required
                      />
                      {formErrors.endDate && <div className="text-danger mt-1">{formErrors.endDate}</div>}
                      <div className="mb-3">
                        <div className='text-center'>
                          <button type="button" className="btn btn-primary mt-2" onClick={suggestEndDate}>
                            Suggest a date
                          </button>
                          {predictedDuration && (
                            <p className="mt-2 text-muted">Estimated duration: {predictedDuration} Days</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="projectDescription" className="form-label">Description</label>
                      <textarea className="form-control" rows="5" id="projectDescription" defaultValue={editingProject?.description || ""} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="deliverables" className="form-label">Deliverables</label>
                      <input
                        type="text"
                        className="form-control"
                        id="deliverables"
                        defaultValue={editingProject?.deliverables?.join(', ') || ""}
                        placeholder="Separated by commas"
                        onBlur={(e) => {
                          if (e.target.value) {
                            suggestUsersBasedOnDeliverables(e.target.value);
                          } else {
                            setSuggestedUsers([]);
                            setFormErrors(prev => ({ ...prev, deliverables: '' }));
                          }
                        }}
                      />
                      {formErrors.deliverables && <div className="text-danger mt-1">{formErrors.deliverables}</div>}
                    </div>
                    {isSuggestingUsers && (
                      <div className="mb-3">
                        <p className="text-muted">Loading suggestions...</p>
                      </div>
                    )}
                    {suggestedUsers.length > 0 && (
                      <div className="mb-3">
                        <h5>Suggested Users</h5>
                        <ul className="list-group">
                          {suggestedUsers.map(user => (
                            <li key={user.id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{user.firstname} {user.lastname}</strong> ({user.role})<br />
                                  <small>Skills: {user.skills.join(', ')}</small><br />
                                  <small>Corresponding skills: {user.commonSkills.join(', ')}</small><br />
                                  <small>Assigned tasks: {user.taskCount}</small>
                                </div>
                                <div>
                                  <span className="badge bg-success">Score: {user.score}%</span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="team" className="form-label">Team project</label>
                      <select
                        className="form-control"
                        id="team"
                        multiple
                        defaultValue={editingProject?.teamMembers.map(member => member._id || member) || []}
                        style={{ height: '150px' }}
                        onChange={handleTeamSelectionChange}
                      >
                        {users
                          .filter(user => ["Team Leader", "Team Member"].includes(user.role?.name))
                          .sort((a, b) => {
                            const aProjects = a.managedProjects ? a.managedProjects.length : 0;
                            const bProjects = b.managedProjects ? b.managedProjects.length : 0;
                            return aProjects - bProjects; // Ascending order: fewer projects first
                          })
                          .map(user => (
                            <option key={user._id} value={user._id}>
                              {user.firstname} {user.lastname} ({user.role?.name || "Role not defined"}) - Projects: {user.managedProjects ? user.managedProjects.length : 0}
                            </option>
                          ))}
                      </select>
                      {formErrors.team && <div className="text-danger mt-1">{formErrors.team}</div>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="objectives" className="form-label">Objectives</label>
                      <input
                        type="text"
                        className="form-control"
                        id="objectives"
                        defaultValue={editingProject?.objectives?.join(', ') || ""}
                        placeholder="Separated by commas"
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
                            name="title"
                            onChange={handleTaskInputChange}
                          />
                          {formErrors.taskTitle && <div className="text-danger mt-1">{formErrors.taskTitle}</div>}
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
                          {formErrors.taskPriority && <div className="text-danger mt-1">{formErrors.taskPriority}</div>}
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-md-4">
                          <label className="form-label">Start date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={newTask.startDate}
                            onChange={handleTaskInputChange}
                            name="startDate"
                            min={projectStartDate}
                          />
                          {fieldErrors.startDate && <div className="text-danger mt-1">{fieldErrors.startDate}</div>}
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={newTask.dueDate}
                            onChange={handleTaskInputChange}
                            name="dueDate"
                          />
                          {fieldErrors.dueDate && <div className="text-danger mt-1">{fieldErrors.dueDate}</div>}
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
                            {selectedTeamMembers.length > 0 ? (
                              users
                                .filter(user => selectedTeamMembers.includes(user._id) && user.role?.name === 'Team Member')
                                .map(user => (
                                  <option key={user._id} value={user._id}>
                                    {user.firstname} {user.lastname} ({user.role?.name || "Role not defined"})
                                  </option>
                                ))
                            ) : (
                              <option disabled>No team members selected</option>
                            )}
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
                                {task.assignedTo.length > 0 && (
                                  ` - Assigned to: ${task.assignedTo
                                    .map(userId => {
                                      const user = users.find(u => u._id === userId);
                                      return user ? `${user.firstname} ${user.lastname}` : "Unknown";
                                    })
                                    .join(", ")
                                  }`
                                )}
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
                    {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          resetModalState();
                        }}
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
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1100 }}></div>
        </>
      )}
    </div>
  );
};

export default ProjectsDashboard;
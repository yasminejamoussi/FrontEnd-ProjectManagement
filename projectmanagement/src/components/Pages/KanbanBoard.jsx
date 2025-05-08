import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import initializeKanbanBoard from '../../assets/js/kanban_board.js';
import Header from "../Layout/Header";
import Sidebar from '../Layout/SideBar';
import { jwtDecode } from "jwt-decode";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const KanbanBoard = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [renderKey, setRenderKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [productivityData, setProductivityData] = useState([]);
  const [productivityLoading, setProductivityLoading] = useState(false);
  const [productivityError, setProductivityError] = useState(null);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignedTo: [],
    startDate: '',
    dueDate: '',
  });
  const [editTask, setEditTask] = useState(null);
  const [suggestedDueDate, setSuggestedDueDate] = useState(null);
  const gridsRef = useRef(null);
  const boardRef = useRef(null);

  // Fonction utilitaire pour gérer les erreurs HTTP
  const handleApiError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 403:
          return "Access denied: You do not have the necessary permissions to perform this action.";
        case 422:
          return "Validation error: Please check the entered data and try again.";
        case 404:
          return "Resource not found: The requested project or task does not exist.";
        case 500:
          return "Server error: An error occurred. Please try again later.";
        default:
          return data.message || `Error ${status}: An unexpected error occurred.`;
      }
    }
    return error.message || "Network error: Check your connection and try again.";
  };

  // Effacer les messages d'erreur après 5 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (productivityError) {
      const timer = setTimeout(() => setProductivityError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [productivityError]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.id);
      setUserRole(decoded?.role || 'Guest');
    } else {
      setError("User not authenticated. Please log in.");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, projectResponse, usersResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/tasks?projectId=${projectId}`),
          axios.get(`http://localhost:4000/api/projects/${projectId}`),
          axios.get('http://localhost:4000/api/auth/users'),
        ]);

        const normalizedTasks = (tasksResponse.data || []).map(task => ({
          ...task,
          assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo.map(item => typeof item === 'object' && item._id ? item._id.toString() : item.toString()) : [],
          startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        }));
        setTasks(normalizedTasks);
        setProjectName(projectResponse.data.name || '');
        setProjectStartDate(projectResponse.data.startDate ? new Date(projectResponse.data.startDate).toISOString().split('T')[0] : '');
        setProjectEndDate(projectResponse.data.endDate ? new Date(projectResponse.data.endDate).toISOString().split('T')[0] : '');
        setUsers(usersResponse.data || []);
        const normalizedTeamMembers = (projectResponse.data.teamMembers || []).map(member => {
          if (typeof member === 'string') return member;
          if (member && member._id) return member._id.toString();
          return null;
        }).filter(id => id);
        setTeamMembers(normalizedTeamMembers);
        console.log("Normalized tasks:", normalizedTasks);
        console.log("Normalized team members:", normalizedTeamMembers);
      } catch (err) {
        setError(handleApiError(err));
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  useEffect(() => {
    if (!isLoading && tasks.length > 0 && boardRef.current) {
      try {
        if (gridsRef.current) {
          gridsRef.current.forEach((grid) => grid.destroy());
        }
        const { columnGrids } = initializeKanbanBoard();
        gridsRef.current = columnGrids;

        columnGrids.forEach((grid, index) => {
          grid.on('dragReleaseEnd', async (item) => {
            const taskId = item.getElement().dataset.taskId;
            const newStatus = getColumnStatus(index);
            try {
              const token = localStorage.getItem("token");
              await axios.put(
                `http://localhost:4000/api/tasks/${taskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setTasks(prevTasks =>
                prevTasks.map(task =>
                  task._id === taskId ? { ...task, status: newStatus } : task
                )
              );
              setRenderKey(prev => prev + 1);
            } catch (err) {
              const errorMessage = handleApiError(err);
              setError(errorMessage);
              // Optionnel : Revenir à l'état précédent si la mise à jour échoue
              setTasks(prevTasks => prevTasks); // Rétablir les tâches
              setRenderKey(prev => prev + 1); // Forcer un re-rendu pour remettre la tâche à sa place
            }
          });
        });
      } catch (error) {
        console.error('Error initializing Kanban board:', error);
      }
    }
    return () => {
      if (gridsRef.current) {
        gridsRef.current.forEach((grid) => grid.destroy());
        gridsRef.current = null;
      }
    };
  }, [isLoading, renderKey]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editTask) {
      setEditTask(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTask(prev => ({ ...prev, [name]: value }));
    }
    // Effacer l'erreur pour ce champ lorsqu'il est modifié
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAssignedToChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    if (editTask) {
      setEditTask(prev => ({ ...prev, assignedTo: selected }));
    } else {
      setNewTask(prev => ({ ...prev, assignedTo: selected }));
    }
    setFieldErrors(prev => ({ ...prev, assignedTo: '' }));
  };

  const suggestPriorityWithIA = async () => {
    const task = editTask || newTask;
    if (!task.title) {
      setError("Please enter a title before requesting an AI suggestion.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/prioritize', {
        title: task.title,
        description: task.description || '',
      });
      const { priority } = response.data;
      if (editTask) {
        setEditTask(prev => ({ ...prev, priority }));
      } else {
        setNewTask(prev => ({ ...prev, priority }));
      }
      alert(`AI-suggested priority: ${priority}`);
    } catch (err) {
      console.error("AI prioritization error:", err);
      setError(handleApiError(err));
    }
  };

  const predictTaskDuration = async () => {
    const task = editTask || newTask;
    console.log("Début de predictTaskDuration, task:", task);
    if (!task.title || !task.startDate) {
      setError("Please enter a title and start date before requesting a prediction.");
      console.log("Error: title or startDate missing");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("Envoi de la requête POST avec:", {
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        project: projectId,
        startDate: task.startDate,
      });
      const response = await axios.post('http://localhost:4000/api/tasks/predict-duration', {
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        project: projectId,
        startDate: task.startDate,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Réponse de l’API:", response.data);
      const { estimatedDueDate } = response.data;
      setSuggestedDueDate(estimatedDueDate.split('T')[0]);
      if (editTask) {
        setEditTask(prev => ({ ...prev, dueDate: estimatedDueDate.split('T')[0] }));
      } else {
        setNewTask(prev => ({ ...prev, dueDate: estimatedDueDate.split('T')[0] }));
      }
    } catch (err) {
      console.error("Erreur dans predictTaskDuration:", err);
      setError(handleApiError(err));
    }
  };

  const fetchProductivityData = async () => {
    setProductivityLoading(true);
    setProductivityError(null);
    try {
      const response = await axios.get(`http://localhost:4000/api/productivity/${projectId}`);
      console.log('Productivity data received:', response.data);
      setProductivityData([response.data]);
    } catch (err) {
      setProductivityError(handleApiError(err));
      console.error(err);
    } finally {
      setProductivityLoading(false);
      setShowProductivityModal(true);
    }
  };

  const handleGenerateChart = () => {
    fetchProductivityData();
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditTask(null);
    setNewTask({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      assignedTo: [],
      startDate: '',
      dueDate: '',
    });
    setSuggestedDueDate(null);
    setFieldErrors({});
    setError(null);
  };

  const handleCloseProductivityModal = () => {
    setShowProductivityModal(false);
    setProductivityData([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      setError("User not authenticated. Please log in.");
      return;
    }
    const taskData = editTask || newTask;
    const newFieldErrors = {};

    // Validation des dates par rapport au projet (uniquement pour startDate)
    if (taskData.startDate && projectStartDate && new Date(taskData.startDate) < new Date(projectStartDate)) {
      newFieldErrors.startDate = `The start date cannot be earlier than the project's start date (${projectStartDate}).`;
    }
    if (taskData.dueDate && projectEndDate && new Date(taskData.dueDate) > new Date(projectEndDate)) {
      newFieldErrors.dueDate = "The due date must be equal or earlier than the project end date.";
    }
    if (taskData.dueDate && taskData.startDate && new Date(taskData.dueDate) < new Date(taskData.startDate)) {
      newFieldErrors.dueDate = "Due date cannot be earlier than start date.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      if (editTask) {
        const response = await axios.put(`http://localhost:4000/api/tasks/${editTask._id}`, taskData);
        setTasks(prevTasks => prevTasks.map(task => task._id === editTask._id ? {
          ...response.data,
          startDate: response.data.startDate ? new Date(response.data.startDate).toISOString().split('T')[0] : '',
          dueDate: response.data.dueDate ? new Date(response.data.dueDate).toISOString().split('T')[0] : ''
        } : task));
        setEditTask(null);
      } else {
        const taskToCreate = { ...taskData, project: projectId, createdBy: currentUserId };
        const response = await axios.post('http://localhost:4000/api/tasks', taskToCreate);
        setTasks(prevTasks => [...prevTasks, {
          ...response.data,
          startDate: response.data.startDate ? new Date(response.data.startDate).toISOString().split('T')[0] : '',
          dueDate: response.data.dueDate ? new Date(response.data.dueDate).toISOString().split('T')[0] : ''
        }]);
        setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', assignedTo: [], startDate: '', dueDate: '' });
      }
      handleCloseModal();
      setFieldErrors({});
      setRenderKey(prev => prev + 1);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleEdit = (task) => {
    console.log("Task to edit:", task);
    setEditTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:4000/api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      setRenderKey(prev => prev + 1);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const getAssignedNames = (assignedTo) => {
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) return 'Unassigned';
    return assignedTo.map(id => {
      const userId = id.toString();
      const user = users.find(u => u._id.toString() === userId);
      return user ? `${user.firstname} ${user.lastname}` : 'Unknown';
    }).join(', ');
  };

  const getColumnStatus = (index) => ["To Do", "In Progress", "Review", "Done", "Tested"][index];

  const priorityOrder = { 'Urgent': 4, 'High': 3, "Medium": 2, 'Low': 1 };
  const tasksByStatus = {
    "To Do": tasks.filter(task => task.status === "To Do").sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]),
    "In Progress": tasks.filter(task => task.status === "In Progress").sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]),
    "Review": tasks.filter(task => task.status === "Review").sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]),
    "Done": tasks.filter(task => task.status === "Done").sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]),
    "Tested": tasks.filter(task => task.status === "Tested").sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]),
  };

  const getColumnIcon = (column) => {
    const icons = { "To Do": "ph-list-bullets", "In Progress": "ph-chart-line-up", "Review": "ph-eye", "Done": "ph-check-square-offset", "Tested": "ph-check-circle" };
    return icons[column] || "ph-list-bullets";
  };

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <Helmet>
        <title>Kanban Board</title>
        <meta name="description" content="Kanban board to manage project tasks." />
      </Helmet>

      {isLoading && <div className="loader-wrapper"><div className="loader_16"></div></div>}

      <div className="app-content">
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
                <h4 className="main-title">
                  Board {projectName ? `for project "${projectName}"` : ''}
                  {['Admin', 'Project Manager', 'Team Leader'].includes(userRole) && (
                    <button
                      className="btn btn-primary ms-3"
                      onClick={() => { setShowForm(true); setEditTask(null); }}
                      disabled={teamMembers.length === 0}
                    >
                      <i className="ti ti-plus"></i> Add Task
                    </button>
                  )}
                  <button
                    className="btn btn-success ms-3"
                    onClick={handleGenerateChart}
                    disabled={productivityLoading}
                  >
                    {productivityLoading ? 'Loading...' : 'Generate Productivity Chart'}
                  </button>
                </h4>
                <ul className="app-line-breadcrumbs mb-3">
                  <li className="active"><a className="f-s-14 f-w-500" href="#">Projects</a></li>
                </ul>
                {teamMembers.length === 0 && (
                  <div className="alert btn-primary" role="alert">
                    <h4 className="alert-heading">
                      <strong>Oops! Orchestra Incomplete!</strong>
                    </h4>
                    It seems this project lacks its musical ensemble! 🎶
                    <br />
                    Assemble your orchestra by assigning members in the{' '}
                    <a
                      href={`/project-details/${projectId}`}
                      className="fw-bold"
                      style={{ color: '#ffffff', textDecoration: 'none' }}
                    >
                      Project Settings
                    </a>{' '}
                    to unleash the symphony of task creation!
                  </div>
                )}
                {error && <div className="alert alert-danger">{error}</div>}
              </div>
            </div>

            {showForm && (
              <>
                <div className="modal fade show" style={{ display: 'block', zIndex: 1150 }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{editTask ? 'Edit Task' : 'Add Task'}</h5>
                        <button type="button" className="btn-close" onClick={handleCloseModal} />
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={editTask ? editTask.title : newTask.title}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-control"
                              name="description"
                              value={editTask ? editTask.description : newTask.description}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Status</label>
                            <select
                              className="form-control"
                              name="status"
                              value={editTask ? editTask.status : newTask.status}
                              onChange={handleInputChange}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Done">Done</option>
                              <option value="Tested">Tested</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Priority</label>
                            <select
                              className="form-control"
                              name="priority"
                              value={editTask ? editTask.priority : newTask.priority}
                              onChange={handleInputChange}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={suggestPriorityWithIA}
                            >
                              Suggest Priority with AI
                            </button>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Start Date</label>
                            <input
                              type="date"
                              className="form-control"
                              name="startDate"
                              value={editTask ? editTask.startDate : newTask.startDate}
                              onChange={handleInputChange}
                              min={projectStartDate} // Restrict start date to project start date or later
                            />
                            {fieldErrors.startDate && <div className="text-danger">{fieldErrors.startDate}</div>}
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Due Date</label>
                            <input
                              type="date"
                              className="form-control"
                              name="dueDate"
                              value={editTask ? editTask.dueDate : newTask.dueDate}
                              onChange={handleInputChange}
                            />
                            {fieldErrors.dueDate && <div className="text-danger">{fieldErrors.dueDate}</div>}
                            <button
                              type="button"
                              className="btn btn-info mt-2"
                              onClick={predictTaskDuration}
                            >
                              Suggest a duration with AI
                            </button>
                          </div>
                          {['Admin', 'Project Manager', 'Team Leader'].includes(userRole) && (
                            <div className="mb-3">
                              <label className="form-label">Assigned To</label>
                              <select
                                className="form-control"
                                name="assignedTo"
                                multiple
                                value={editTask ? (editTask.assignedTo || []) : newTask.assignedTo}
                                onChange={handleAssignedToChange}
                                style={{ height: '100px' }}
                              >
                                {teamMembers.length > 0 ? (
                                  (() => {
                                    const teamMemberUsers = users.filter(user => {
                                      if (!user._id) return false;
                                      const userId = user._id.toString();
                                      return teamMembers.includes(userId) && user.role?.name === 'Team Member';
                                    });
                                    if (teamMemberUsers.length === 0) {
                                      return <option disabled>No team members found</option>;
                                    }
                                    return teamMemberUsers.map(user => (
                                      <option key={user._id} value={user._id}>
                                        {user.firstname} {user.lastname} ({user.role?.name || "Role not defined"})
                                      </option>
                                    ));
                                  })()
                                ) : (
                                  <option disabled>No team members assigned to this project</option>
                                )}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            {editTask ? 'Update' : 'Create'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1100 }}></div>
              </>
            )}

            <div className="row">
              <div className="col-12">
                <div className="kanban-board-container app-scroll">
                  <div className="board" ref={boardRef} key={renderKey}>
                    {["To Do", "In Progress", "Review", "Done", "Tested"].map((column, index) => (
                      <div key={column} className="board-column app-scroll">
                        <div className="board-column-header">
                          <i className={`ph-bold ${getColumnIcon(column)} me-2 f-s-16`}></i> {column.toUpperCase()}
                        </div>
                        <div className="board-column-content-wrapper">
                          <div className="board-column-content">
                            {tasksByStatus[column].length > 0 ? (
                              tasksByStatus[column].map(task => (
                                <div key={task._id} className="board-item" data-task-id={task._id}>
                                  <div className="board-item-content">
                                    <h6 className="mb-1">{task.title}</h6>
                                    <p className="mb-1"><strong>Status:</strong> {task.status}</p>
                                    <p className="mb-1"><strong>Assigned To:</strong> {getAssignedNames(task.assignedTo)}</p>
                                    <p className="mb-1"><strong>Priority:</strong> {task.priority}</p>
                                    {task.startDate && <p className="mb-1"><strong>Start:</strong> {new Date(task.startDate).toLocaleDateString('en-GB')}</p>}
                                    {task.dueDate && <p className="mb-1"><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString('en-GB')}</p>}
                                    <div className="board-footer">
                                      <span className="badge bg-light-danger f-s-14">
                                        <i className="ph-bold ph-clock-afternoon"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                                      </span>
                                      <span className="badge bg-light-primary f-s-14 ms-2">
                                        <i className="ph-bold ph-check-square-offset"></i> {task.priority}
                                      </span>
                                      <br></br> <br></br>
                                      <div className='text-center'>
                                        <button
                                          className="btn btn-sm btn-outline-success ms-2"
                                          onClick={() => handleEdit(task)}
                                        >
                                          <i className="ti ti-edit"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-danger ms-2"
                                          onClick={() => handleDelete(task._id)}
                                        >
                                          <i className="ti ti-trash"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-muted text-center p-3">No tasks</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {productivityLoading && <div className="loader-wrapper"><div className="loader_16"></div></div>}
            {productivityError && <div className="alert alert-danger mt-3">{productivityError}</div>}

            <Modal
              show={showProductivityModal}
              onHide={handleCloseProductivityModal}
              centered
              size="md"
              backdrop="static"
              keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>Productivity of Project "{projectName}"</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {!productivityLoading && productivityData.length > 0 && (
                  [...new Map(productivityData.map(item => [item.project, item])).values()].map((item, index) => (
                    <div key={index} className="mb-3">
                      {('totalTasksCompleted' in item && item.totalTasksCompleted > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[item]} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                              dataKey="project"
                              type="category"
                              hide={true}
                              allowDuplicatedCategory={false}
                            />
                            <YAxis
                              label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                              itemStyle={{ color: '#333' }}
                            />
                            <Legend
                              wrapperStyle={{ paddingTop: '10px' }}
                              iconType="circle"
                            />
                            <Bar
                              dataKey="totalTasksCompleted"
                              fill="#4CAF50"
                              name="Completed Tasks"
                              animationBegin={300}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            />
                            <Bar
                              dataKey="score"
                              fill="#2196F3"
                              name="Productivity Score"
                              animationBegin={300}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="alert alert-info">For the project "{item.project}" : No task is completed</p>
                      )}
                    </div>
                  ))
                )}
                {productivityLoading && <div className="loader-wrapper"><div className="loader_16"></div></div>}
                {productivityError && <div className="alert alert-danger">Error: {productivityError}</div>}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseProductivityModal}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </main>
        <div className="go-top">
          <span className="progress-value">
            <i className="ti ti-arrow-up"></i>
          </span>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import initializeKanbanBoard from '../../assets/js/kanban_board.js'; // Ajuste selon ton chemin
import Header from "../Layout/Header";
import Sidebar from "../Layout/Sidebar";

const KanbanBoard = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // Gardé pour référence, mais pas pour limiter la liste
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignedTo: [],
  });
  const [editTask, setEditTask] = useState(null);
  const gridsRef = useRef(null);
  const boardRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, projectResponse, usersResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/tasks?projectId=${projectId}`),
          axios.get(`http://localhost:4000/api/projects/${projectId}`),
          axios.get('http://localhost:4000/api/auth/users'),
        ]);

        console.log("Tâches brutes :", JSON.stringify(tasksResponse.data, null, 2));
        console.log("Projet brut :", JSON.stringify(projectResponse.data, null, 2));
        console.log("Utilisateurs bruts :", JSON.stringify(usersResponse.data, null, 2));

        const normalizedTasks = (tasksResponse.data || []).map(task => {
          let assignedTo = [];
          if (Array.isArray(task.assignedTo)) {
            assignedTo = task.assignedTo.map(item => {
              return typeof item === 'object' && item._id ? item._id.toString() : item.toString();
            });
          }
          return { ...task, assignedTo };
        });
        console.log("Tâches normalisées :", normalizedTasks);
        setTasks(normalizedTasks);

        setProjectName(projectResponse.data.name || '');
        setUsers(usersResponse.data || []);

        const normalizedTeamMembers = (projectResponse.data.teamMembers || []).map(id => id.toString());
        setTeamMembers(normalizedTeamMembers);
        console.log("TeamMembers normalisés :", normalizedTeamMembers);
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError(err.response?.data?.message || err.message);
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
          grid.on('dragStart', (item) => {
            console.log("Début du drag pour la tâche :", item.getElement().dataset.taskId);
          });
          grid.on('dragReleaseEnd', async (item) => {
            const taskId = item.getElement().dataset.taskId;
            const newStatus = getColumnStatus(index);
            try {
              await axios.put(`http://localhost:4000/api/tasks/${taskId}`, { status: newStatus });
              setTasks(prevTasks =>
                prevTasks.map(task => task._id === taskId ? { ...task, status: newStatus } : task)
              );
              setRenderKey(prev => prev + 1);
            } catch (err) {
              setError(err.response?.data?.message || err.message);
            }
          });
        });
      } catch (error) {
        console.error('Erreur lors de l’initialisation du Kanban board:', error);
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
  };

  const handleAssignedToChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    if (editTask) {
      setEditTask(prev => ({ ...prev, assignedTo: selected }));
    } else {
      setNewTask(prev => ({ ...prev, assignedTo: selected }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        const response = await axios.put(`http://localhost:4000/api/tasks/${editTask._id}`, editTask);
        setTasks(prevTasks => prevTasks.map(task => task._id === editTask._id ? response.data : task));
        setEditTask(null);
      } else {
        const taskToCreate = { ...newTask, project: projectId, createdBy: "currentUserId" }; // Remplace par l'ID réel
        const response = await axios.post('http://localhost:4000/api/tasks', taskToCreate);
        setTasks(prevTasks => [...prevTasks, response.data]);
        setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', assignedTo: [] });
      }
      setShowForm(false);
      setRenderKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:4000/api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      setRenderKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const getAssignedNames = (assignedTo) => {
    console.log("assignedTo pour cette tâche :", assignedTo);
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) return 'Non assigné';
    return assignedTo.map(id => {
      const userId = id.toString();
      const user = users.find(u => u._id.toString() === userId);
      if (!user) console.log(`Utilisateur non trouvé pour ID ${userId} dans users:`, users);
      return user ? `${user.firstname} ${user.lastname}` : 'Inconnu';
    }).join(', ');
  };

  const getColumnStatus = (index) => ["To Do", "In Progress", "Review", "Done", "Tested"][index];

  const tasksByStatus = {
    "To Do": tasks.filter(task => task.status === "To Do"),
    "In Progress": tasks.filter(task => task.status === "In Progress"),
    "Review": tasks.filter(task => task.status === "Review"),
    "Done": tasks.filter(task => task.status === "Done"),
    "Tested": tasks.filter(task => task.status === "Tested"),
  };

  console.log("Tâches par statut avant rendu :", tasksByStatus);

  const getColumnIcon = (column) => {
    const icons = {
      "To Do": "ph-list-bullets",
      "In Progress": "ph-chart-line-up",
      "Review": "ph-eye",
      "Done": "ph-check-square-offset",
      "Tested": "ph-check-circle",
    };
    return icons[column] || "ph-list-bullets";
  };

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <Helmet>
        <title>Kanban Board</title>
        <meta name="description" content="Tableau Kanban pour gérer les tâches de projet." />
      </Helmet>

      {isLoading && <div className="loader-wrapper"><div className="loader_16"></div></div>}

      <div className="app-content">
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
                <h4 className="main-title">
                  Kanban Board {projectName ? `du projet "${projectName}"` : ''}
                  <button
                    className="btn btn-primary ms-3"
                    onClick={() => { setShowForm(true); setEditTask(null); }}
                  >
                    <i className="ti ti-plus"></i> Ajouter une tâche
                  </button>
                </h4>
                <ul className="app-line-breadcrumbs mb-3">
                  <li><a className="f-s-14 f-w-500" href="#"><i className="ph-duotone ph-stack f-s-16"></i> Apps</a></li>
                  <li className="active"><a className="f-s-14 f-w-500" href="#">Kanban Board</a></li>
                </ul>
                {error && <div className="alert alert-danger">{error}</div>}
              </div>
            </div>

            {showForm && (
              <div className="modal fade show" style={{ display: 'block' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{editTask ? 'Modifier la tâche' : 'Ajouter une tâche'}</h5>
                      <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Titre</label>
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
                          <label className="form-label">Statut</label>
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
                          <label className="form-label">Priorité</label>
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
                          <label className="form-label">Assigné à</label>
                          <select
                            className="form-control"
                            name="assignedTo"
                            multiple
                            value={editTask ? (editTask.assignedTo || []) : newTask.assignedTo}
                            onChange={handleAssignedToChange}
                            style={{ height: '100px' }}
                          >
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.firstname} {user.lastname}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                          Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {editTask ? 'Modifier' : 'Créer'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
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
                                    <p className="mb-1"><strong>Statut :</strong> {task.status}</p>
                                    <p className="mb-1"><strong>Assigné à :</strong> {getAssignedNames(task.assignedTo)}</p>
                                    <div className="board-footer">
                                      <span className="badge bg-light-danger f-s-14">
                                        <i className="ph-bold ph-clock-afternoon"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'N/A'}
                                      </span>
                                      <i className="ph-bold ph-list f-s-14 me-2"></i>
                                      <span className="f-s-14 me-2">
                                        <i className="ph-bold ph-chat-text"></i>
                                        <span>0</span>
                                      </span>
                                      <span className="badge bg-light-primary f-s-14">
                                        <i className="ph-bold ph-check-square-offset"></i> {task.priority}
                                      </span>
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
                              ))
                            ) : (
                              <div className="text-muted text-center p-3">Aucune tâche</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layout/SideBar';
import Header from '../Layout/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';

const TasksPage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [sortByTasksAssigned, setSortByTasksAssigned] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const userResponse = await axios.get('http://localhost:4000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        setUserData(user);
        setRole(user.role.name);

        if (user.role.name === 'Guest') {
          toast.error('Access denied: Guests cannot view tasks.');
          navigate('/dashboard');
          return;
        }

        let usersToShow = [];
        if (user.role.name === 'Admin') {
          const usersResponse = await axios.get('http://localhost:4000/api/auth/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          usersToShow = usersResponse.data || [];
        } else if (user.role.name === 'Project Manager') {
          const projectsResponse = await axios.get('http://localhost:4000/api/projects', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const managedProjects = projectsResponse.data.filter(project => project.projectManager?._id === user._id);
          const projectIds = managedProjects.map(project => project._id);

          const tasksResponse = await axios.get('http://localhost:4000/api/tasks', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const projectTasks = tasksResponse.data.filter(task => projectIds.includes(task.project?._id));
          const userIds = [...new Set(projectTasks.flatMap(task => task.assignedTo.map(u => u._id)))];
          const usersResponse = await axios.get('http://localhost:4000/api/auth/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          usersToShow = usersResponse.data.filter(u => userIds.includes(u._id)) || [];
        } else if (user.role.name === 'Team Leader') {
          const usersResponse = await axios.get('http://localhost:4000/api/auth/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          usersToShow = usersResponse.data.filter(u => u.teamLeader?._id === user._id || u._id === user._id) || [];
        } else if (user.role.name === 'Team Member') {
          usersToShow = [user];
        }
        setUsers(usersToShow);

        const projectsResponse = await axios.get('http://localhost:4000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let projectsToShow = [];
        if (user.role.name === 'Admin') {
          projectsToShow = projectsResponse.data || [];
        } else if (user.role.name === 'Project Manager') {
          projectsToShow = projectsResponse.data.filter(project => project.projectManager?._id === user._id) || [];
        } else if (user.role.name === 'Team Leader' || user.role.name === 'Team Member') {
          const tasksResponse = await axios.get('http://localhost:4000/api/tasks', {
            headers: { Authorization: `Bearer ${token}` },
          });
          let userTasks = [];
          if (user.role.name === 'Team Leader') {
            userTasks = tasksResponse.data.filter(task =>
              task.assignedTo.some(u => u._id === user._id || u.teamLeader?._id === user._id)
            );
          } else {
            userTasks = tasksResponse.data.filter(task => task.assignedTo.some(u => u._id === user._id));
          }
          const projectIds = [...new Set(userTasks.map(task => task.project?._id))];
          projectsToShow = projectsResponse.data.filter(project => projectIds.includes(project._id)) || [];
        }
        setProjects(projectsToShow);

        const tasksResponse = await axios.get('http://localhost:4000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let tasksToShow = [];
        if (user.role.name === 'Admin') {
          tasksToShow = tasksResponse.data || [];
        } else if (user.role.name === 'Project Manager') {
          const projectIds = projectsToShow.map(project => project._id.toString());
          tasksToShow = tasksResponse.data.filter(task => projectIds.includes(task.project?._id)) || [];
        } else if (user.role.name === 'Team Leader') {
          tasksToShow = tasksResponse.data.filter(task => {
            if (!Array.isArray(task.assignedTo)) return false;
            return (
              task.assignedTo.some(u => u._id === user._id) ||
              task.assignedTo.some(u => u.teamLeader?._id === user._id)
            );
          }) || [];
        } else if (user.role.name === 'Team Member') {
          tasksToShow = tasksResponse.data.filter(task => {
            if (!Array.isArray(task.assignedTo)) return false;
            return task.assignedTo.some(u => u._id === user._id);
          }) || [];
        }
        setAllTasks(tasksToShow);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  useEffect(() => {
    let tasks = [...allTasks];

    if (selectedUser && role !== 'Team Member') {
      tasks = tasks.filter(task =>
        task.assignedTo.some(user => user._id === selectedUser)
      );
    }

    if (selectedProject) {
      tasks = tasks.filter(task => task.project?._id === selectedProject);
    }

    if (selectedPriority) {
      tasks = tasks.filter(task => task.priority === selectedPriority);
    }

    if (sortByTasksAssigned && role !== 'Team Member') {
      const userTaskCount = {};
      tasks.forEach(task => {
        task.assignedTo.forEach(user => {
          userTaskCount[user._id] = (userTaskCount[user._id] || 0) + 1;
        });
      });

      tasks.sort((a, b) => {
        const aMaxCount = Math.max(...a.assignedTo.map(user => userTaskCount[user._id] || 0));
        const bMaxCount = Math.max(...b.assignedTo.map(user => userTaskCount[user._id] || 0));
        return bMaxCount - aMaxCount;
      });
    }

    setFilteredTasks(tasks);
  }, [selectedUser, selectedProject, selectedPriority, sortByTasksAssigned, allTasks, role]);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId || null);
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId || null);
  };

  const handlePriorityChange = (e) => {
    const priority = e.target.value;
    setSelectedPriority(priority || null);
  };

  const handleSortChange = (e) => {
    setSortByTasksAssigned(e.target.checked);
  };

  const selectedUserData = users.find(user => user._id === selectedUser);

  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="loader-wrapper">
          <div className="loader_16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Tasks Management - Tasks</title>
        <meta name="description" content="Dashboard to manage tasks efficiently." />
      </Helmet>
      <Header />
      <Sidebar />
      <div className="app-content" style={{ flex: 1 }}>
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
                <h4 className="main-title">Tasks</h4>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                  <h5 style={{ color: '#34495e', marginBottom: '15px' }}>Filters</h5>
                  <form className="d-flex flex-wrap gap-3 align-items-end">
                    {role !== 'Team Member' && (
                      <div className="form-group">
                        <label htmlFor="filterUser" className="form-label" style={{ color: '#7f8c8d' }}>User</label>
                        <select
                          id="filterUser"
                          className="form-select"
                          style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                          value={selectedUser || ''}
                          onChange={handleUserChange}
                          aria-label="Filter by user"
                        >
                          <option value="">All users</option>
                          {users.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.firstname} {user.lastname} ({user.role?.name || 'Unknown role'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor="filterProject" className="form-label" style={{ color: '#7f8c8d' }}>Project</label>
                      <select
                        id="filterProject"
                        className="form-select"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={selectedProject || ''}
                        onChange={handleProjectChange}
                        aria-label="Filter by project"
                      >
                        <option value="">All projects</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterPriority" className="form-label" style={{ color: '#7f8c8d' }}>Priority</label>
                      <select
                        id="filterPriority"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={selectedPriority || ''}
                        onChange={handlePriorityChange}
                        aria-label="Filter by priority"
                      >
                        <option value="">All priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    {role !== 'Team Member' && (
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="sortByTasksAssigned"
                          checked={sortByTasksAssigned}
                          onChange={handleSortChange}
                        />
                        <label className="form-check-label" htmlFor="sortByTasksAssigned" style={{ color: '#7f8c8d' }}>
                          Sort by most tasks assigned
                        </label>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {selectedUserData && role !== 'Team Member' && (
              <div className="row mb-3">
                <div className="col-12">
                  <p className="text-muted" style={{ fontSize: '1rem', backgroundColor: '#e9ecef', padding: '10px', borderRadius: '5px' }}>
                    {selectedUserData.firstname} {selectedUserData.lastname} has {filteredTasks.length} tasks in total.
                  </p>
                </div>
              </div>
            )}

            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm mb-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                  <div className="card-body py-3 px-0">
                    <div className="table-responsive app-scroll">
                      <table className="table align-middle project-status-table mb-0" role="grid">
                        <thead>
                          <tr>
                            <th scope="col">Title</th>
                            <th scope="col">Project</th>
                            <th scope="col">Status</th>
                            <th scope="col">Priority</th>
                            <th scope="col">Assigned to</th>
                            <th scope="col">Start Date</th>
                            <th scope="col">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                              <tr key={task._id}>
                                <td>
                                  <h6
                                    className="mb-0 text-success-dark text-nowrap"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.title) }}
                                  />
                                </td>
                                <td>{task.project?.name || 'Unknown project'}</td>
                                <td>
                                  <span
                                    className={`badge badge-${
                                      task.status ? task.status.toLowerCase().replace(" ", "-") : "unknown"
                                    } f-s-9 f-w-700`}
                                    style={
                                      task.status === "In Progress"
                                        ? { backgroundColor: "#f5f5d5", color: "#000" }
                                        : task.status === "Completed"
                                        ? { backgroundColor: "#d3e2e5", color: "#4a4a4a" }
                                        : task.status === "Pending"
                                        ? { backgroundColor: "#d3e2e5", color: "#4a4a4a" }
                                        : { backgroundColor: "#e0e0e0", color: "#000" }
                                    }
                                  >
                                    {task.status || "Unknown"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      task.priority === "Urgent"
                                        ? "bg-danger"
                                        : task.priority === "High"
                                        ? "bg-warning"
                                        : task.priority === "Medium"
                                        ? "bg-info"
                                        : "bg-success"
                                    }`}
                                  >
                                    {task.priority || "Unknown"}
                                  </span>
                                </td>
                                <td>
                                  {task.assignedTo?.length > 0
                                    ? task.assignedTo.map(user => `${user.firstname} ${user.lastname}`).join(", ")
                                    : "Not assigned"}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {task.startDate
                                    ? new Date(task.startDate).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric',
                                      })
                                    : 'Not set'}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric',
                                      })
                                    : 'Not set'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center" style={{ color: '#7f8c8d', padding: '20px' }}>
                                No tasks available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default TasksPage;
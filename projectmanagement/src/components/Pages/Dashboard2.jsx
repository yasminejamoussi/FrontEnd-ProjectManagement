import React, { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { CircleDashed, CheckCircle, PlayCircle, PauseCircle, Circle, ArrowUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Sidebar from '../Layout/SideBar';
import Header from '../Layout/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Avatar4 from '../../assets/images/avtar/user.jpg';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dateRange, setDateRange] = useState({ min: null, max: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', startDate: '', dueDate: '', status: '', priority: '' });
  const projectsPerPage = 10;
  const navigate = useNavigate();
  const location = useLocation(); // Ajout pour lire les paramètres de l'URL

  const API_BASE_URL = "https://backend-projectmanagement-mg0q.onrender.com";

  // Extraction des paramètres token et email après redirection Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      localStorage.setItem('token', token); // Stocker le token
      localStorage.setItem('user-info', JSON.stringify({ email, token })); // Stocker les infos utilisateur
      window.history.replaceState({}, document.title, '/dashboard'); // Nettoyer l'URL
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [userResponse, projectsResponse, tasksResponse, usersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${API_BASE_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${API_BASE_URL}/api/tasks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${API_BASE_URL}/api/auth/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }).catch(() => ({ data: [] })),
        ]);

        const user = userResponse.data;
        setUserData(user);
        setRole(user.role.name);

        const projects = projectsResponse.data || [];
        setAllProjects(projects);

        let relevantProjects = projects;
        if (user.role.name === 'Project Manager') {
          relevantProjects = projects.filter(
            (project) => project.projectManager?._id === user._id
          );
        } else if (user.role.name === 'Team Leader' || user.role.name === 'Team Member') {
          relevantProjects = projects.filter(
            (project) =>
              project.projectManager?._id === user._id ||
              project.teamMembers?.some((member) => member._id === user._id)
          );
        } else if (user.role.name === 'Guest') {
          relevantProjects = [];
        }

        const formattedEvents = relevantProjects
          .map((project) => {
            const startDate = new Date(project.startDate);
            if (isNaN(startDate.getTime())) {
              console.error('Invalid date for project:', project);
              return null;
            }
            return {
              title: DOMPurify.sanitize(project.name),
              date: startDate.toISOString().split('T')[0],
              projectDetails: project,
            };
          })
          .filter((event) => event !== null);
        setCalendarEvents(formattedEvents);

        let tasks = tasksResponse.data || [];
        if (user.role.name === 'Admin') {
          setAllTasks(tasks);
        } else if (user.role.name === 'Project Manager') {
          tasks = tasks.filter((task) =>
            relevantProjects.some((project) => project._id === task.project?._id)
          );
          setAllTasks(tasks);
        } else if (user.role.name === 'Team Leader') {
          tasks = tasks.filter((task) => {
            if (!Array.isArray(task.assignedTo)) return false;
            return (
              task.assignedTo.some((u) => u._id === user._id) ||
              task.assignedTo.some((u) => u.teamLeader?._id === user._id)
            );
          });
          setAllTasks(tasks);
        } else if (user.role.name === 'Team Member') {
          tasks = tasks.filter((task) => {
            if (!Array.isArray(task.assignedTo)) return false;
            return task.assignedTo.some((u) => u._id === user._id);
          });
          setAllTasks(tasks);
        } else {
          setAllTasks([]);
        }

        if (user.role.name === 'Admin') {
          setAllUsers(usersResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, location]);

  // Le reste du code reste identique (handleImageError, handleEventClick, etc.)
  // Copié ici pour référence, mais non modifié
  const handleImageError = (e) => {
    e.target.src = Avatar4;
  };

  const handleEventClick = (clickInfo) => {
    setSelectedProject(clickInfo.event.extendedProps.projectDetails);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleTaskClick = (task) => {
    const assignedToNames = Array.isArray(task.assignedTo) && task.assignedTo.length > 0
      ? task.assignedTo.map(user => `${user.firstname || 'N/A'} ${user.lastname || 'N/A'}`).join(', ')
      : 'Not Assigned';

    const startDate = task.startDate
      ? new Date(task.startDate).toLocaleDateString('en-US')
      : 'Not Set';
    const dueDate = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString('en-US')
      : 'Not Set';

    setSelectedTask({
      ...task,
      assignedToNames,
      formattedStartDate: startDate,
      formattedDueDate: dueDate,
    });
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status || '',
      priority: task.priority || '',
    });
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setTaskForm({ title: '', description: '', startDate: '', dueDate: '', status: '', priority: '' });
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/tasks/${selectedTask._id}`,
        taskForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedTask = response.data;
      setAllTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      toast.success('Task updated successfully!');
      handleCloseTaskModal();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${selectedTask._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllTasks((prevTasks) => prevTasks.filter((task) => task._id !== selectedTask._id));
      toast.success('Task deleted successfully!');
      handleCloseTaskModal();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const generateReport = () => {
    navigate('/report');
  };

  const getTaskProgress = (task) => {
    switch (task.status?.toLowerCase()) {
      case 'done':
        return 100;
      case 'tested':
        return 90;
      case 'review':
        return 70;
      case 'in progress':
        return 50;
      case 'to do':
        return 0;
      default:
        return 0;
    }
  };

  const getTaskColorClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return { bg: 'bg-danger-300', text: 'text-danger-dark', progress: 'bg-danger-dark' };
      case 'high':
        return { bg: 'bg-warning-300', text: 'text-warning-dark', progress: 'bg-warning-dark' };
      case 'medium':
        return { bg: 'bg-info-300', text: 'text-info-dark', progress: 'bg-info-dark' };
      case 'low':
        return { bg: 'bg-success-300', text: 'text-success-dark', progress: 'bg-success-dark' };
      default:
        return { bg: 'bg-secondary-300', text: 'text-secondary-dark', progress: 'bg-secondary-dark' };
    }
  };

  const displayedProjects = useMemo(() => {
    let filtered = allProjects;
    if (role === 'Project Manager') {
      filtered = allProjects.filter((project) => project.projectManager?._id === userData?._id);
    } else if (role === 'Team Leader' || role === 'Team Member') {
      filtered = allProjects.filter(
        (project) =>
          project.projectManager?._id === userData?._id ||
          project.teamMembers?.some((member) => member._id === userData?._id)
      );
    } else if (role === 'Guest') {
      filtered = [];
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }
    return filtered;
  }, [allProjects, userData, role, statusFilter]);

  const displayedTasks = useMemo(() => {
    if (role === 'Admin') return allTasks;
    if (role === 'Project Manager') {
      return allTasks.filter((task) =>
        displayedProjects.some((project) => project._id === task.project?._id)
      );
    }
    if (role === 'Team Leader') {
      return allTasks.filter((task) => {
        if (!Array.isArray(task.assignedTo)) return false;
        return (
          task.assignedTo.some((u) => u._id === userData?._id) ||
          task.assignedTo.some((u) => u.teamLeader?._id === userData?._id)
        );
      });
    }
    if (role === 'Team Member') {
      return allTasks.filter((task) => {
        if (!Array.isArray(task.assignedTo)) return false;
        return task.assignedTo.some((u) => u._id === userData?._id);
      });
    }
    return [];
  }, [allTasks, userData, role, displayedProjects]);

  const getProjectStats = useMemo(() => {
    return {
      total: displayedProjects.length,
      completed: displayedProjects.filter((p) => p.status === 'Completed').length,
      inProgress: displayedProjects.filter((p) => p.status === 'In Progress').length,
      pending: displayedProjects.filter((p) => p.status === 'Pending').length,
    };
  }, [displayedProjects]);

  const getTotalHours = useMemo(() => {
    const tasks = displayedTasks;
    const totalEffort = tasks.reduce((sum, task) => sum + (task.effort || 1), 0);
    const productive = tasks
      .filter((t) => ['done', 'tested'].includes(t.status?.toLowerCase()))
      .reduce((sum, t) => sum + (t.effort || 1), 0);
    const middle = tasks
      .filter((t) => ['review', 'in progress'].includes(t.status?.toLowerCase()))
      .reduce((sum, t) => sum + (t.effort || 1), 0);
    const idle = tasks
      .filter((t) => t.status?.toLowerCase() === 'to do')
      .reduce((sum, t) => sum + (t.effort || 1), 0);
    const total = productive + middle + idle || 1;
    return {
      total: totalEffort,
      productive: Number(((productive / total) * 100).toFixed(1)),
      middle: Number(((middle / total) * 100).toFixed(1)),
      idle: Number(((idle / total) * 100).toFixed(1)),
    };
  }, [displayedTasks]);

  const getTimelineData = useMemo(() => {
    let series = [];
    let colors = ['#6f42c1', '#343a40', '#007bff', '#28a745', '#dc3545'];
    let minDate = new Date('9999-12-31');
    let maxDate = new Date('1970-01-01');

    const updateDateRange = (startDate, endDate) => {
      if (startDate < minDate) minDate = startDate;
      if (endDate > maxDate) maxDate = endDate;
    };

    if (role === 'Admin') {
      series = allUsers
        .filter((user) => user.firstname && user.lastname)
        .map((user) => {
          const userTasks = allTasks.filter((task) => {
            if (!Array.isArray(task.assignedTo)) return false;
            return task.assignedTo.some((u) => u._id === user._id);
          });
          return {
            name: `${user.firstname} ${user.lastname}`,
            data: userTasks.map((task) => {
              const startDate = new Date(task.startDate || task.createdAt || new Date());
              const endDate = task.dueDate
                ? new Date(task.dueDate)
                : ['Done', 'Tested'].includes(task.status)
                ? new Date(task.updatedAt || new Date())
                : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error('Invalid dates for task:', task);
                return {
                  x: DOMPurify.sanitize(task.title),
                  y: [new Date().getTime(), new Date().getTime() + 7 * 24 * 60 * 60 * 1000],
                };
              }
              updateDateRange(startDate, endDate);
              return {
                x: DOMPurify.sanitize(task.title),
                y: [startDate.getTime(), endDate.getTime()],
              };
            }),
          };
        })
        .filter((serie) => serie.data.length > 0);
    } else if (role === 'Team Leader') {
      const teamMembers = allUsers.filter((user) => user.teamLeader?._id === userData?._id);
      series = [
        {
          name: `${userData.firstname} ${userData.lastname}`,
          data: displayedTasks
            .filter((task) => {
              if (!Array.isArray(task.assignedTo)) return false;
              return task.assignedTo.some((u) => u._id === userData?._id);
            })
            .map((task) => {
              const startDate = new Date(task.startDate || task.createdAt || new Date());
              const endDate = task.dueDate
                ? new Date(task.dueDate)
                : ['Done', 'Tested'].includes(task.status)
                ? new Date(task.updatedAt || new Date())
                : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              updateDateRange(startDate, endDate);
              return {
                x: DOMPurify.sanitize(task.title),
                y: [startDate.getTime(), endDate.getTime()],
              };
            }),
        },
        ...teamMembers.map((member) => ({
          name: `${member.firstname} ${member.lastname}`,
          data: displayedTasks
            .filter((task) => {
              if (!Array.isArray(task.assignedTo)) return false;
              return task.assignedTo.some((u) => u._id === member._id);
            })
            .map((task) => {
              const startDate = new Date(task.startDate || task.createdAt || new Date());
              const endDate = task.dueDate
                ? new Date(task.dueDate)
                : ['Done', 'Tested'].includes(task.status)
                ? new Date(task.updatedAt || new Date())
                : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
              updateDateRange(startDate, endDate);
              return {
                x: DOMPurify.sanitize(task.title),
                y: [startDate.getTime(), endDate.getTime()],
              };
            }),
        })),
      ].filter((serie) => serie.data.length > 0);
    } else if (role === 'Team Member' || role === 'Project Manager') {
      series = [
        {
          name: `${userData?.firstname} ${userData?.lastname || 'User'}`,
          data: displayedTasks.map((task) => {
            const startDate = new Date(task.startDate || task.createdAt || new Date());
            const endDate = task.dueDate
              ? new Date(task.dueDate)
              : ['Done', 'Tested'].includes(task.status)
              ? new Date(task.updatedAt || new Date())
              : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.error('Invalid dates for task:', task);
              return {
                x: DOMPurify.sanitize(task.title),
                y: [new Date().getTime(), new Date().getTime() + 7 * 24 * 60 * 60 * 1000],
              };
            }
            updateDateRange(startDate, endDate);
            return {
              x: DOMPurify.sanitize(task.title),
              y: [startDate.getTime(), endDate.getTime()],
            };
          }),
        },
      ].filter((serie) => serie.data.length > 0);
    }

    if (minDate > maxDate) {
      minDate = new Date();
      maxDate = new Date(minDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const initialMin = minDate.getTime();
    const initialMax = maxDate.getTime();

    return {
      series,
      colors: role === 'Admin' || role === 'Team Leader' ? colors : [colors[0]],
      minDate: initialMin,
      maxDate: initialMax,
      overallMin: minDate.getTime(),
      overallMax: maxDate.getTime(),
    };
  }, [allTasks, allUsers, userData, role, displayedTasks]);

  useEffect(() => {
    if (
      getTimelineData &&
      getTimelineData.minDate &&
      getTimelineData.maxDate &&
      !dateRange.min &&
      !dateRange.max
    ) {
      setDateRange({
        min: getTimelineData.minDate,
        max: getTimelineData.maxDate,
      });
    }
  }, [getTimelineData]);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = displayedProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(displayedProjects.length / projectsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrev = () => {
    if (!dateRange.min || !dateRange.max) return;
    const newMin = new Date(dateRange.min).getTime() - 30 * 24 * 60 * 60 * 1000;
    const newMax = new Date(dateRange.max).getTime() - 30 * 24 * 60 * 60 * 1000;
    setDateRange({
      min: Math.max(newMin, getTimelineData.overallMin),
      max: Math.max(newMax, getTimelineData.overallMin + 30 * 24 * 60 * 60 * 1000),
    });
  };

  const handleNext = () => {
    if (!dateRange.min || !dateRange.max) return;
    const newMin = new Date(dateRange.min).getTime() + 30 * 24 * 60 * 60 * 1000;
    const newMax = new Date(dateRange.max).getTime() + 30 * 24 * 60 * 60 * 1000;
    setDateRange({
      min: Math.min(newMin, getTimelineData.overallMax - 30 * 24 * 60 * 60 * 1000),
      max: Math.min(newMax, getTimelineData.overallMax),
    });
  };

  const isProjectDelayed = (project) => {
    if (project.endDate && new Date(project.endDate) < new Date()) {
      return 'Overdue';
    }
    if (
      project.status !== 'Completed' &&
      project.endDate &&
      new Date(project.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ) {
      return 'At Risk';
    }
    return 'On Time';
  };

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
    <div className="app-wrapper">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main>
          <div className="container-fluid mt-4">
            <div className="row mb-4">
              <div className="col-lg-9 col-xl-9 order-1-md mb-4 mb-lg-0">
                <div className="p-3 d-flex justify-content-between align-items-center">
                  <h5 className="section-title">Project Status</h5>
                  <select
                    className="form-select w-auto"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="card shadow-sm mb-0">
                  <div className="card-body py-3 px-0 overflow-hidden">
                    <div className="table-responsive app-scroll">
                      <table className="table align-middle project-status-table mb-0" role="grid">
                        <thead>
                          <tr>
                            <th scope="col">Project</th>
                            <th scope="col">Status</th>
                            <th scope="col">Project Owner</th>
                            <th scope="col">Start Date</th>
                            <th scope="col">End Date</th>
                            <th scope="col">Description</th>
                            <th scope="col">Delay Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentProjects.length > 0 ? (
                            currentProjects.map((project) => (
                              <tr key={project._id}>
                                <td>
                                  <h6
                                    className="mb-0 text-success-dark text-nowrap"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.name) }}
                                  />
                                </td>
                                <td>
                                  <span
                                    className={`badge badge-${project.status ? project.status.toLowerCase().replace(" ", "-") : "unknown"} f-s-9 f-w-700`}
                                    style={
                                      project.status === "In Progress"
                                        ? { backgroundColor: "#f5f5d5", color: "#000" }
                                        : project.status === "Completed"
                                        ? { backgroundColor: "#d3e2e5", color: "#4a4a4a" }
                                        : project.status === "Pending"
                                        ? { backgroundColor: "#d3e2e5", color: "#4a4a4a" }
                                        : { backgroundColor: "#e0e0e0", color: "#000" }
                                    }
                                  >
                                    {project.status || "Unknown"}
                                  </span>
                                </td>
                                <td className="f-w-600 text-dark text-nowrap">
                                  {project.projectManager?.profileImage ? (
                                    <img
                                      src={project.projectManager?.profileImage}
                                      alt="Team Leader"
                                      className="rounded-circle"
                                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                      onError={handleImageError}
                                    />
                                  ) : (
                                    <img
                                      src={Avatar4}
                                      alt="Team Lead"
                                      className="rounded-circle"
                                      style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                    />
                                  )}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {project.startDate
                                    ? new Date(project.startDate).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric',
                                      })
                                    : 'Not Set'}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {project.endDate
                                    ? new Date(project.endDate).toLocaleDateString('en-US', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        year: 'numeric',
                                      })
                                    : 'Not Set'}
                                </td>
                                <td>
                                  <span className="text-dark f-s-14 f-w-500 text-nowrap">
                                    <CircleDashed className="me-2 f-s-6" />
                                    {DOMPurify.sanitize(project.description || 'No description available')}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      isProjectDelayed(project) === 'Overdue'
                                        ? 'bg-danger'
                                        : isProjectDelayed(project) === 'At Risk'
                                        ? 'bg-warning'
                                        : 'bg-success'
                                    }`}
                                  >
                                    {isProjectDelayed(project)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center">
                                No projects available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="table-footer d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0 f-s-15 f-w-500 txt-ellipsis-1">
                    Showing {currentProjects.length} of {displayedProjects.length} entries
                  </p>
                  <ul className="pagination app-pagination justify-content-end">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <a
                        className="page-link b-r-left"
                        href="#"
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Previous"
                      >
                        Previous
                      </a>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <a className="page-link" href="#" onClick={() => handlePageChange(page)}>
                          {page}
                        </a>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <a
                        className="page-link b-r-right"
                        href="#"
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Next"
                      >
                        Next
                      </a>
                    </li>
                  </ul>
                </div>
                {role === 'Admin' && (
                  <div className="text-center mt-3">
                    <button className="btn btn-primary" onClick={generateReport} aria-label="Generate Report">
                      Generate Report
                    </button>
                  </div>
                )}
              </div>

              <div className="col-lg-3 col-xl-3">
                <div className="p-3">
                  <h5 className="section-title">{role === 'Admin' ? 'All Tasks' : 'My Tasks'}</h5>
                </div>
                <div className="card shadow-sm">
                  <div className="card-body task-list-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="task-list">
                      {displayedTasks.length > 0 ? (
                        displayedTasks.map((task) => {
                          const progress = getTaskProgress(task);
                          const { bg, text, progress: progressColor } = getTaskColorClass(task.priority);

                          return (
                            <div
                              key={task._id}
                              className={`card task-card ${bg} mb-3`}
                              onClick={() => handleTaskClick(task)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="card-body">
                                <h6
                                  className={`${text} txt-ellipsis-1`}
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.title) }}
                                />

                                <div className="d-flex justify-content-between align-items-center">
                                  <div
                                    className="progress w-100"
                                    role="progressbar"
                                    aria-valuenow={progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  >
                                    <div
                                      className={`progress-bar ${progressColor} progress-bar-striped progress-bar-animated`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="badge bg-white-400 text-secondary-dark ms-2">+ {progress}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center">
                          <p>No tasks available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="section-title">Member Productivity by Tasks</h5>
                  </div>
                  <div className="card-body">
                    {getTimelineData.series.length > 0 ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <button
                            onClick={handlePrev}
                            disabled={dateRange.min === null || dateRange.min <= getTimelineData.overallMin}
                            className="btn btn-light"
                            aria-label="Previous period"
                          >
                            <ChevronLeft size={20} /> Previous
                          </button>
                          <span>
                            {dateRange.min && dateRange.max
                              ? `${new Date(dateRange.min).toLocaleDateString('en-US')} - ${new Date(
                                  dateRange.max
                                ).toLocaleDateString('en-US')}`
                              : 'Select a date range'}
                          </span>
                          <button
                            onClick={handleNext}
                            disabled={dateRange.max === null || dateRange.max >= getTimelineData.overallMax}
                            className="btn btn-light"
                            aria-label="Next period"
                          >
                            Next <ChevronRight size={20} />
                          </button>
                        </div>
                        <Chart
                          options={{
                            chart: {
                              type: 'rangeBar',
                              toolbar: { show: false },
                              zoom: { enabled: false },
                            },
                            plotOptions: {
                              bar: {
                                horizontal: true,
                                barHeight: '50%',
                                rangeBarGroupRows: true,
                              },
                            },
                            xaxis: {
                              type: 'datetime',
                              min: dateRange.min,
                              max: dateRange.max,
                              labels: {
                                format: 'MM/dd/yyyy',
                                datetimeUTC: false,
                                style: { fontSize: '12px' },
                              },
                              tickAmount: 6,
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '14px', fontWeight: 600 },
                                maxWidth: 200,
                                formatter: (value) => (value.length > 20 ? value.substring(0, 17) + '...' : value),
                              },
                            },
                            fill: { type: 'solid', opacity: 0.8 },
                            colors: getTimelineData.colors,
                            legend: {
                              position: 'top',
                              horizontalAlign: 'right',
                              markers: { width: 12, height: 12, radius: 12 },
                            },
                            dataLabels: { enabled: false },
                            tooltip: {
                              enabled: true,
                              custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                                const data = w.config.series[seriesIndex].data[dataPointIndex];
                                const start = new Date(data.y[0]).toLocaleDateString('en-US');
                                const end = new Date(data.y[1]).toLocaleDateString('en-US');
                                return `<div class="apexcharts-tooltip-rangebar">
                                  <div><strong>${w.config.series[seriesIndex].name}</strong></div>
                                  <div>Task: ${DOMPurify.sanitize(data.x)}</div>
                                  <div>Start: ${start}</div>
                                  <div>End: ${end}</div>
                                </div>`;
                              },
                            },
                          }}
                          series={getTimelineData.series}
                          type="rangeBar"
                          height={300}
                        />
                      </>
                    ) : (
                      <div className="text-center">
                        <p>No tasks available for this period</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="section-title">Task Status Distribution</h5>
                  </div>
                  <div className="card-body">
                    <Chart
                      options={{
                        chart: { type: 'donut' },
                        labels: ['Done', 'Tested', 'Review', 'In Progress', 'To Do'],
                        colors: ['#28a745', '#17a2b8', '#ffc107', '#007bff', '#dc3545'],
                        legend: { position: 'bottom', fontSize: '14px' },
                        dataLabels: {
                          enabled: true,
                          formatter: (val, opts) => {
                            const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            return `${((val / total) * 100).toFixed(1)}%`;
                          },
                        },
                        responsive: [
                          {
                            breakpoint: 480,
                            options: {
                              chart: { width: 200 },
                              legend: { position: 'bottom' },
                            },
                          },
                        ],
                      }}
                      series={[
                        displayedTasks.filter((t) => t.status === 'Done').length,
                        displayedTasks.filter((t) => t.status === 'Tested').length,
                        displayedTasks.filter((t) => t.status === 'Review').length,
                        displayedTasks.filter((t) => t.status === 'In Progress').length,
                        displayedTasks.filter((t) => t.status === 'To Do').length,
                      ]}
                      type="donut"
                      height={250}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-sm-3">
                    <div className="card ticket-card shadow-sm bg-light-primary mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <Circle className="f-s-20 text-primary" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">All Projects</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-primary-dark f-s-28 f-w-700">{getProjectStats.total}</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-primary b-2-light position-relative">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-primary border border-light rounded-circle"></span>
                              <img alt="avatar" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="card ticket-card shadow-sm bg-light-success mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <CheckCircle className="f-s-20 text-success" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">Completed Projects</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-success-dark f-s-28 f-w-700">{getProjectStats.completed}</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-success b-2-light position-relative">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-success border border-light rounded-circle"></span>
                              <img alt="avatar" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="card ticket-card shadow-sm bg-light-info mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <PlayCircle className="f-s-20 text-info" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">In Progress Projects</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-info-dark f-s-28 f-w-700">{getProjectStats.inProgress}</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-info b-2-light position-relative">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-info border border-light rounded-circle"></span>
                              <img alt="avatar" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="card ticket-card shadow-sm bg-light-warning mb-4">
                      <div className="card-body">
                        <Circle className="circle-bg-img" />
                        <div className="h-40 w-60 d-flex-center b-r-10 bg-white mb-2 mx-auto">
                          <PauseCircle className="f-s-20 text-warning" />
                        </div>
                        <p className="f-s-14 text-center text-uppercase text-dark">Pending Projects</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h3 className="text-warning-dark f-s-28 f-w-700">{getProjectStats.pending}</h3>
                          <ul className="avatar-group">
                            <li className="h-30 w-30 d-flex-center b-r-50 text-bg-warning b-2-light position-relative">
                              <span className="position-absolute top-0 end-0 h-10 w-10 bg-warning border border-light rounded-circle"></span>
                              <img alt="avatar" className="img-fluid b-r-50 overflow-hidden" src={Avatar4} />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-lg-6">
                <div className="card shadow-sm project-total-card">
                  <div className="card-body">
                    <div className="d-flex position-relative">
                      <h5 className="section-title txt-ellipsis-1">Total Hours</h5>
                    </div>
                    <div>
                      {getTotalHours.total > 0 ? (
                        <>
                          <div className="d-flex justify-content-center">
                            <h2 className="text-info-dark hour-display">{getTotalHours.total.toFixed(1)}H</h2>
                          </div>
                          <div className="progress-labels mg-t-40">
                            <span className="text-info" title="Done or Tested tasks">Productive</span>
                            <span className="text-info" title="Review or In Progress tasks">In Progress</span>
                            <span className="text-info" title="To Do tasks">Idle</span>
                          </div>
                          <div className="custom-progress-container info-progress">
                            <div className="progress-bar productive" style={{ width: `${getTotalHours.productive}%` }}></div>
                            <div className="progress-bar middle" style={{ width: `${getTotalHours.middle}%` }}></div>
                            <div className="progress-bar idle" style={{ width: `${getTotalHours.idle}%` }}></div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <p>No task hours recorded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="section-title">Project Summary</h5>
                  </div>
                  <div className="card-body">
                    <p><strong>Total Projects:</strong> {getProjectStats.total}</p>
                    <p>
                      <strong>Completed Projects:</strong> {getProjectStats.completed} (
                      {((getProjectStats.completed / getProjectStats.total) * 100 || 0).toFixed(1)}%)
                    </p>
                    <p><strong>In Progress Projects:</strong> {getProjectStats.inProgress}</p>
                    <p><strong>Pending Projects:</strong> {getProjectStats.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-12">
                <div className="container-fluid">
                  <div className="row m-1">
                    <div className="col-12">
                      <h4 className="main-title">Calendar</h4>
                    </div>
                  </div>
                  <div className="row m-1 calendar app-fullcalender">
                    <div className="col-12">
                      <div className="card shadow-sm">
                        <div className="card-body" id="mydraggable">
                          <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            headerToolbar={{
                              left: 'prev,next',
                              center: 'title',
                              right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek',
                            }}
                            height="auto"
                            eventBackgroundColor="#6f42c1"
                            eventBorderColor="#6f42c1"
                            eventClick={handleEventClick}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="go-top">
        <span className="progress-value">
          <ArrowUp />
        </span>
      </div>

      <div className="modal fade" id="welcomeCard" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content welcome-card">
            <div className="modal-body p-0">
              <div className="text-center position-relative welcome-card-content z-1 p-3">
                <div className="text-end position-relative z-1">
                  <X className="fs-5 text-dark f-w-600" data-bs-dismiss="modal" />
                </div>
                
                <div className="modal-btn mb-4">
                  <button
                    className="btn btn-primary text-white btn-sm rounded"
                    data-bs-dismiss="modal"
                    type="button"
                    aria-label="Get Started"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProject ? (
            <div>
              <h5 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProject.name) }} />
              <p>
                <strong>Description:</strong>{' '}
                {DOMPurify.sanitize(selectedProject.description || 'No description')}
              </p>
              <p>
                <strong>Objectives:</strong>{' '}
                {selectedProject.objectives?.join(', ') || 'No objectives'}
              </p>
              <p><strong>Status:</strong> {selectedProject.status}</p>
              <p>
                <strong>Start Date:</strong>{' '}
                {new Date(selectedProject.startDate).toLocaleDateString('en-US')}
              </p>
              <p>
                <strong>End Date:</strong>{' '}
                {new Date(selectedProject.endDate).toLocaleDateString('en-US')}
              </p>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTaskModal} onHide={handleCloseTaskModal}>
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <div>
              {['Admin', 'Project Manager', 'Team Leader'].includes(role) ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={taskForm.description}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={taskForm.startDate}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="dueDate"
                      value={taskForm.dueDate}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={taskForm.status}
                      onChange={handleFormChange}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Tested">Tested</option>
                      <option value="Done">Done</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleFormChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              ) : (
                <>
                  <h5 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTask.title) }} />
                  <p>
                    <strong>Description:</strong>{' '}
                    {DOMPurify.sanitize(selectedTask.description || 'No description')}
                  </p>
                  <p><strong>Status:</strong> {selectedTask.status}</p>
                  <p><strong>Priority:</strong> {selectedTask.priority}</p>
                  <p>
                    <strong>Start Date:</strong> {selectedTask.formattedStartDate}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {selectedTask.formattedDueDate}
                  </p>
                  <p>
                    <strong>Assigned To:</strong> {selectedTask.assignedToNames}
                  </p>
                  <p>
                    <strong>Project:</strong>{' '}
                    {selectedTask.project?.name || 'N/A'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTaskModal}>
            Close
          </Button>
          {['Admin', 'Project Manager', 'Team Leader'].includes(role) && selectedTask && (
            <>
              <Button
                variant="primary"
                onClick={handleUpdateTask}
                aria-label="Update Task"
              >
                Update Task
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteTask}
                aria-label="Delete Task"
              >
                Delete Task
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default Dashboard;
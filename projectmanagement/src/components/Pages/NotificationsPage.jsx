import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [persistentNotifications, setPersistentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [filters, setFilters] = useState({
    notificationType: '',
    read: '',
    date: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const notificationsPerPage = 10;

  // Fonction pour récupérer les notifications dynamiques (comme dans Header)
  const fetchDynamicNotifications = async () => {
    try {
      console.log('Fetching projects...');
      const projectsResponse = await axios.get('http://localhost:4000/api/projects');
      console.log('Projects received:', projectsResponse.data);
      const projects = projectsResponse.data;

      const projectDelayPromises = projects.map(async (project) => {
        try {
          const delayResponse = await axios.get(`http://localhost:4000/api/projects/${project._id}/predict-delay`);
          console.log(`Project ${project.name} prediction:`, delayResponse.data);
          if (delayResponse.data.riskOfDelay === 'Oui') {
            return {
              type: 'project',
              projectId: project._id,
              projectName: project.name,
              riskOfDelay: delayResponse.data.riskOfDelay,
              delayDays: delayResponse.data.delayDays,
              status: project.status,
              endDate: project.endDate,
              createdAt: new Date(), // Pour simuler une date de création
              read: false, // Les notifications dynamiques sont considérées comme non lues
              message: `Potential delay detected for project "${project.name}". Risk of delay: ${delayResponse.data.riskOfDelay}, Estimated delay: ${delayResponse.data.delayDays} days. End date: ${new Date(project.endDate).toLocaleDateString('en-GB')}.`,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error predicting delay for project ${project._id}:`, error.message);
          return null;
        }
      });

      console.log('Fetching tasks...');
      const tasksResponse = await axios.get('http://localhost:4000/api/tasks');
      console.log('Tasks received:', tasksResponse.data);
      const tasks = tasksResponse.data;

      const taskDelayPromises = tasks.map(async (task) => {
        try {
          const delayResponse = await axios.get(`http://localhost:4000/api/tasks/${task._id}/predict-delay`);
          console.log(`Task ${task.title} prediction:`, delayResponse.data);
          if (delayResponse.data.riskOfDelay === 'Oui') {
            const assignedToNames = task.assignedTo.map(user => ` ${user.firstname} ${user.lastname}`).join(', ') || 'Unknown';
            return {
              type: 'task',
              taskId: task._id,
              taskTitle: task.title,
              projectName: task.project?.name || 'Unknown',
              riskOfDelay: delayResponse.data.riskOfDelay,
              delayDays: delayResponse.data.delayDays,
              status: task.status,
              dueDate: task.dueDate,
              assignedTo: task.assignedTo || [],
              createdAt: new Date(),
              read: false,
              message: `Potential delay detected for task "${task.title}" in project "${task.project?.name || 'Unknown'}". Risk of delay: ${delayResponse.data.riskOfDelay}, Estimated delay: ${delayResponse.data.delayDays} days. End date: ${new Date(task.dueDate).toLocaleDateString('en-GB')}. Assigned to: ${assignedToNames}.`,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error predicting delay for task ${task._id}:`, error.message);
          return null;
        }
      });

      const projectDelays = (await Promise.all(projectDelayPromises)).filter(p => p !== null);
      const taskDelays = (await Promise.all(taskDelayPromises)).filter(t => t !== null);

      return [...projectDelays, ...taskDelays];
    } catch (error) {
      console.error('Global error in fetchDynamicNotifications:', error.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        // Récupérer le profil utilisateur
        const userResponse = await axios.get('http://localhost:4000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = userResponse.data;
        setUserRole(user.role?.name || 'Guest');
        setUserId(user._id);

        // Récupérer les notifications dynamiques
        const dynamicNotifications = await fetchDynamicNotifications();

        // Récupérer les notifications persistantes (par exemple, anomalies)
        const persistentResponse = await axios.get('http://localhost:4000/api/notifications/my-notifications', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: notificationsPerPage,
          },
        });

        if (!persistentResponse.data || typeof persistentResponse.data !== 'object') {
          throw new Error('Invalid response from server: Response data is undefined or not an object.');
        }

        const persistentNotifs = persistentResponse.data.notifications || persistentResponse.data;
        setPersistentNotifications(persistentNotifs);

        // Fusionner les notifications dynamiques et persistantes
        const allNotifications = [
          ...dynamicNotifications.map(notif => ({
            ...notif,
            _id: `dynamic-${notif.type}-${notif.projectId || notif.taskId}`, // ID temporaire pour les notifications dynamiques
            notificationType: notif.type,
          })),
          ...persistentNotifs,
        ];

        // Filtrer les notifications pertinentes pour l'utilisateur
        const filteredNotifications = allNotifications.filter(notif => {
          if (notif.notificationType === 'ANOMALY') {
            return true; // Les anomalies sont déjà filtrées par l'utilisateur dans l'endpoint
          }
          // Pour les notifications dynamiques (project/task), vérifier si l'utilisateur est concerné
          const isProjectManager = notif.projectManager?._id === userId;
          const isAssignedToTask = notif.assignedTo?.some(assignee => assignee._id === userId);
          const isAdmin = userRole === 'Admin';
          return isAdmin || isProjectManager || isAssignedToTask;
        });

        setNotifications(filteredNotifications);
        setTotalNotifications(filteredNotifications.length);
        setTotalPages(Math.ceil(filteredNotifications.length / notificationsPerPage));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error fetching notifications.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage, userId, userRole]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const filteredNotifications = notifications
    .filter((notif) => {
      return (
        (!filters.notificationType || notif.notificationType === filters.notificationType) &&
        (filters.read === '' || (filters.read === 'unread' ? !notif.read : notif.read)) &&
        (!filters.date || new Date(notif.createdAt).toISOString().split('T')[0] === filters.date)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((currentPage - 1) * notificationsPerPage, currentPage * notificationsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const markAsRead = async (notificationId) => {
    // On ne peut marquer comme lues que les notifications persistantes
    if (!notificationId.startsWith('dynamic-')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:4000/api/notifications/mark-read/${notificationId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        ));
        setPersistentNotifications(persistentNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        ));
      } catch (err) {
        console.error('Error marking notification as read:', err);
        alert('Error marking notification as read.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTypeBadgeClass = (type) => {
    switch (type.toUpperCase()) {
      case 'PROJECT':
        return 'bg-primary';
      case 'TASK':
        return 'bg-success';
      case 'ANOMALY':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="app-wrapper">
        <Header />
        <Sidebar />
        <div className="app-content">
          <main>
            <div className="container-fluid">
              <div className="text-center">Loading notifications...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Sidebar />
      <Helmet>
        <title>Notifications</title>
        <meta name="description" content="View your notifications." />
      </Helmet>
      <div className="app-content" style={{ flex: 1 }}>
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
              <h4 className="section-title f-w-700 mb-4">Notifications Management</h4>
              </div>
            </div>
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                  <h5 style={{ color: '#34495e', marginBottom: '15px' }}>Filters</h5>
                  <form className="d-flex flex-wrap gap-3 align-items-end">
                    <div className="form-group">
                      <label htmlFor="filterNotificationType" className="form-label" style={{ color: '#7f8c8d' }}>Type</label>
                      <select
                        id="filterNotificationType"
                        name="notificationType"
                        className="form-select"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.notificationType}
                        onChange={handleFilterChange}
                        aria-label="Filter by notification type"
                      >
                        <option value="">All Types</option>
                        <option value="project">Project Delay</option>
                        <option value="task">Task Delay</option>
                        <option value="ANOMALY">Anomaly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterRead" className="form-label" style={{ color: '#7f8c8d' }}>Status</label>
                      <select
                        id="filterRead"
                        name="read"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.read}
                        onChange={handleFilterChange}
                        aria-label="Filter by read status"
                      >
                        <option value="">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterDate" className="form-label" style={{ color: '#7f8c8d' }}>Date</label>
                      <input
                        id="filterDate"
                        type="date"
                        name="date"
                        className="form-control"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.date}
                        onChange={handleFilterChange}
                        aria-label="Filter by date"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {filteredNotifications.length === 0 && !error && (
              <div className="alert alert-info" role="alert">
                No notifications to display.
              </div>
            )}

            {filteredNotifications.length > 0 && (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Message</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredNotifications.map((notif) => (
                            <tr key={notif._id}>
                              <td>{formatDate(notif.createdAt)}</td>
                              <td>
                                <span className={`badge ${getTypeBadgeClass(notif.notificationType)} text-light`}>
                                  {notif.notificationType === 'project' ? 'Project Delay' : 
                                   notif.notificationType === 'task' ? 'Task Delay' : 'Anomaly'}
                                </span>
                              </td>
                              <td>{notif.message}</td>
                              <td>
                                {!notif.read && !notif._id.startsWith('dynamic-') && (
                                  <button
                                    onClick={() => markAsRead(notif._id)}
                                    className="btn btn-sm btn-primary"
                                  >
                                    Mark as Read
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="table-footer d-flex justify-content-between align-items-center mt-3">
                        <p className="mb-0 f-s-15 f-w-500 txt-ellipsis-1">
                          Showing {filteredNotifications.length} of {totalNotifications} entries
                        </p>
                        <ul className="pagination app-pagination justify-content-end">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <a
                              className="page-link b-r-left"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                              }}
                              aria-label="Previous"
                            >
                              Previous
                            </a>
                          </li>
                          <li className={`page-item ${currentPage === currentPage ? 'active' : ''}`}>
                            <a
                              className="page-link"
                              href="#"
                              onClick={(e) => e.preventDefault()}
                            >
                              {currentPage}
                            </a>
                          </li>
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <a
                              className="page-link b-r-right"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                              }}
                              aria-label="Next"
                            >
                              Next
                            </a>
                          </li>
                        </ul>
                      </div>
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

export default NotificationsPage;
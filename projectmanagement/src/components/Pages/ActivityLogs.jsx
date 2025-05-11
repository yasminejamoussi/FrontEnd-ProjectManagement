import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Header from '../Layout/Header';
import Sidebar from '../Layout/SideBar';

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filters, setFilters] = useState({
    project: '',
    user: '',
    action: '',
    date: '',
    targetType: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;
  const [selectedLogs, setSelectedLogs] = useState([]);

  // Define the API base URL using the deployed backend URL
  const API_BASE_URL = "https://backend-projectmanagement-5rbq.onrender.com";

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
        const [userResponse, projectsResponse, tasksResponse, usersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/auth/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] })),
        ]);

        const user = userResponse.data;
        setUserRole(user.role?.name || 'Guest');
        setUserId(user._id);
        setAllProjects(projectsResponse.data);
        setAllTasks(tasksResponse.data);
        console.log("All tasks fetched:", tasksResponse.data);
        setAllUsers(usersResponse.data);

        // Récupérer les logs avec pagination
        const logsResponse = await axios.get(`${API_BASE_URL}/api/logs/activity-logs`, {
          params: { 
            userId: user._id, 
            page: currentPage, 
            limit: logsPerPage 
          },
        });

        // Vérifier la structure de la réponse
        if (!logsResponse.data || typeof logsResponse.data !== 'object') {
          throw new Error('Invalid response from server: Response data is undefined or not an object.');
        }

        if (!logsResponse.data.logs) {
          throw new Error(logsResponse.data.message || 'No logs found in response.');
        }

        // Dédupliquer les logs par leur _id (bien que le backend devrait déjà gérer ça)
        const uniqueLogs = Array.from(new Map(logsResponse.data.logs.map(log => [log._id, log])).values());
        setLogs(uniqueLogs);
        setTotalLogs(logsResponse.data.totalLogs || 0);
        setTotalPages(logsResponse.data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error fetching logs.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const filteredLogs = logs
    .filter((log) => {
      return (
        (!filters.project || (log.targetId && log.targetId.toString() === filters.project)) &&
        (!filters.user || (log.user && log.user._id.toString() === filters.user)) &&
        (!filters.action || log.action === filters.action) &&
        (!filters.date || new Date(log.createdAt).toISOString().split('T')[0] === filters.date) &&
        (!filters.targetType || log.targetType === filters.targetType)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedLogs([]);
  };

  const handleSelectLog = (logId) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter((id) => id !== logId));
    } else {
      setSelectedLogs([...selectedLogs, logId]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLogs(logs.map((log) => log._id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) {
      alert('Please select at least one log to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedLogs.length} log(s)?`)) {
      return;
    }

    try {
      console.log('Deleting logs with IDs:', selectedLogs, 'for userId:', userId);
      const response = await axios.delete(`${API_BASE_URL}/api/logs/activity-logs/delete`, {
        data: { logIds: selectedLogs, userId: userId },
      });
      console.log('Delete response:', response.data);

      setLogs(logs.filter((log) => !selectedLogs.includes(log._id)));
      setSelectedLogs([]);
      setTotalLogs(totalLogs - selectedLogs.length);
      alert('Logs deleted successfully.');
    } catch (err) {
      console.error('Error deleting logs:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        alert(err.response.data.message || 'Error deleting logs.');
      } else {
        alert('Network error: Unable to delete logs.');
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

  const getActionBadgeClass = (action) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-success';
      case 'UPDATE':
        return 'bg-primary';
      case 'DELETE':
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
              <div className="text-center">Loading logs...</div>
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
        <title>Activity Logs</title>
        <meta name="description" content="View activity logs based on your permissions." />
      </Helmet>
      <div className="app-content" style={{ flex: 1 }}>
        <main>
          <div className="container-fluid">
            <div className="row m-1">
              <div className="col-12">
              <h4 className="section-title f-w-700 mb-4">Activity Logs </h4>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                  <h5 style={{ color: '#34495e', marginBottom: '15px' }}>Filters</h5>
                  <form className="d-flex flex-wrap gap-3 align-items-end">
                    <div className="form-group">
                      <label htmlFor="filterProject" className="form-label" style={{ color: '#7f8c8d' }}>Project</label>
                      <select
                        id="filterProject"
                        name="project"
                        className="form-select"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.project}
                        onChange={handleFilterChange}
                        aria-label="Filter by project"
                      >
                        <option value="">All Projects</option>
                        {allProjects
                          .filter(project => 
                            userRole === 'Admin' ||
                            project.projectManager?._id === userId ||
                            project.teamMembers?.some(member => member._id === userId)
                          )
                          .map((project) => (
                            <option key={project._id} value={project._id}>
                              {project.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterUser" className="form-label" style={{ color: '#7f8c8d' }}>User</label>
                      <select
                        id="filterUser"
                        name="user"
                        className="form-select"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.user}
                        onChange={handleFilterChange}
                        aria-label="Filter by user"
                      >
                        <option value="">All Users</option>
                        {allUsers.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.firstname} {user.lastname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterAction" className="form-label" style={{ color: '#7f8c8d' }}>Action</label>
                      <select
                        id="filterAction"
                        name="action"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.action}
                        onChange={handleFilterChange}
                        aria-label="Filter by action"
                      >
                        <option value="">All Actions</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterTargetType" className="form-label" style={{ color: '#7f8c8d' }}>Type</label>
                      <select
                        id="filterTargetType"
                        name="targetType"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={filters.targetType}
                        onChange={handleFilterChange}
                        aria-label="Filter by target type"
                      >
                        <option value="">All Types</option>
                        <option value="PROJECT">Projects</option>
                        <option value="TASK">Tasks</option>
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

            {logs.length === 0 && !error && (
              <div className="alert alert-info" role="alert">
                No activity logs found.
              </div>
            )}

            {logs.length > 0 && (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      {userRole === 'Admin' && (
                        <div className="mb-3">
                          <button
                            className="btn btn-danger"
                            onClick={handleDeleteSelected}
                            disabled={selectedLogs.length === 0}
                          >
                            Delete Selected ({selectedLogs.length})
                          </button>
                        </div>
                      )}

                      <table className="table table-striped">
                        <thead>
                          <tr>
                            {userRole === 'Admin' && (
                              <th>
                                <input
                                  type="checkbox"
                                  onChange={handleSelectAll}
                                  checked={
                                    logs.length > 0 &&
                                    logs.every((log) => selectedLogs.includes(log._id))
                                  }
                                />
                              </th>
                            )}
                            <th>Date</th>
                            <th>Project</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log) => {
                            let projectName = 'N/A';
                            if (log.targetType === 'PROJECT') {
                              projectName = allProjects.find(p => p._id === log.targetId.toString())?.name || 'Unknown Project';
                            } else if (log.targetType === 'TASK') {
                              const task = allTasks.find(t => t._id === log.targetId.toString());
                              if (task) {
                                console.log(`Task ${log.targetId}:`, task);
                                if (task.project) {
                                  if (typeof task.project === 'object' && task.project.name) {
                                    projectName = task.project.name;
                                  } else {
                                    projectName = allProjects.find(p => p._id === task.project.toString())?.name || 'Unknown Project';
                                  }
                                } else {
                                  console.log(`Task ${log.targetId} has no project reference`);
                                  projectName = 'No Project';
                                }
                              } else {
                                console.log(`Task ${log.targetId} not found in allTasks`);
                                projectName = 'Task Not Found';
                              }
                            }

                            return (
                              <tr key={log._id}>
                                {userRole === 'Admin' && (
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedLogs.includes(log._id)}
                                      onChange={() => handleSelectLog(log._id)}
                                    />
                                  </td>
                                )}
                                <td>{formatDate(log.createdAt)}</td>
                                <td>{projectName}</td>
                                <td>
                                  {log.user
                                    ? `${log.user.firstname} ${log.user.lastname}`
                                    : 'Unknown User'}
                                </td>
                                <td>
                                  <span className={`badge ${getActionBadgeClass(log.action)} text-light`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td>{log.message}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="table-footer d-flex justify-content-between align-items-center mt-3">
                        <p className="mb-0 f-s-15 f-w-500 txt-ellipsis-1">
                          Showing {logs.length} of {totalLogs} entries
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

export default ActivityLogs;
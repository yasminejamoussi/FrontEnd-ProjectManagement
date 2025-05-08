import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Header from '../Layout/Header';
import Sidebar from '../Layout/SideBar';
import axios from 'axios';
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa';

const RoleManagement = () => {
  const permissionsList = [
    'View Projects',
    'Edit Projects',
    'Delete Projects',
    'Manage Users',
    'Assign Roles',
    'View Reports',
  ];

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState(10);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: [],
    users: [],
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

    if (!token) {
      console.error('Aucun token trouvé, l\'utilisateur doit se connecter.');
      return;
    }

    Promise.all([
      axios.get(`${apiBaseUrl}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${apiBaseUrl}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([usersResponse, rolesResponse]) => {
        setAllUsers(usersResponse.data);
        setRoles(rolesResponse.data);
      })
      .catch((error) => console.error('Erreur récupération données:', error));
  }, [token, apiBaseUrl]);

  const handleRoleChange = (e, mode = 'add') => {
    const { name, value, type, checked, multiple } = e.target;

    if (mode === 'edit' && selectedRole) {
      if (type === 'checkbox') {
        setSelectedRole((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      } else if (multiple) {
        setSelectedRole((prev) => ({
          ...prev,
          [name]: Array.from(e.target.selectedOptions, (option) => option.value),
        }));
      } else {
        setSelectedRole((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      if (type === 'checkbox') {
        setNewRole((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      } else if (multiple) {
        setNewRole((prev) => ({
          ...prev,
          [name]: Array.from(e.target.selectedOptions, (option) => option.value),
        }));
      } else {
        setNewRole((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleCreateRole = async () => {
    if (!token) {
      console.error('Token non disponible');
      return;
    }

    if (!newRole.name || newRole.name.trim() === '') {
      alert('Veuillez entrer un nom pour le rôle');
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/roles`,
        newRole,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        alert('Rôle créé avec succès !');
        setRoles([...roles, response.data.role]);
        setShowCreateRoleModal(false);
        setNewRole({ name: '', permissions: [], users: [] });
      }
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création du rôle');
    }
  };

  const handlePermissionChange = (permission, isChecked) => {
    setNewRole((prevRole) => ({
      ...prevRole,
      permissions: isChecked
        ? [...prevRole.permissions, permission]
        : prevRole.permissions.filter((p) => p !== permission),
    }));
  };

  const handleAddRole = async () => {
    if (!token) {
      console.error('Token non disponible');
      return;
    }

    const { name: roleName, users: [userId] } = newRole;

    if (!roleName || !userId) {
      alert('Veuillez sélectionner un rôle et un utilisateur');
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/roles/assign-user`,
        { roleName, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert('Rôle assigné avec succès !');
        const rolesResponse = await axios.get(`${apiBaseUrl}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(rolesResponse.data);
        setShowAddModal(false);
        setNewRole({ name: '', permissions: [], users: [] });
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation du rôle:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'assignation du rôle');
    }
  };

  const handleEditClick = (role) => {
    setSelectedRole({ ...role, users: role.users.map((user) => user._id) });
    setShowEditModal(true);
  };

  const handleSaveRole = async () => {
    if (!token) {
      console.error('Token non disponible');
      return;
    }
    if (!selectedRole) {
      console.error('Aucun rôle sélectionné');
      return;
    }

    try {
      // Mettre à jour le rôle
      const roleResponse = await axios.put(
        `${apiBaseUrl}/api/roles/${selectedRole._id}`,
        {
          name: selectedRole.name,
          permissions: selectedRole.permissions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Synchroniser User.role pour chaque utilisateur
      const previousUsers = roles.find((r) => r._id === selectedRole._id).users.map((u) => u._id.toString());
      const newUsers = selectedRole.users;

      // Utilisateurs à retirer
      const usersToRemove = previousUsers.filter((id) => !newUsers.includes(id));
      for (const userId of usersToRemove) {
        const guestRole = await Role.findOne({ name: 'Guest' });
        await User.findByIdAndUpdate(userId, { role: guestRole._id });
      }

      // Utilisateurs à ajouter
      const usersToAdd = newUsers.filter((id) => !previousUsers.includes(id));
      for (const userId of usersToAdd) {
        await User.findByIdAndUpdate(userId, { role: selectedRole._id });
      }

      // Mettre à jour Role.users
      await Role.findByIdAndUpdate(selectedRole._id, {
        $set: { users: newUsers },
      });

      setRoles((prevRoles) =>
        prevRoles.map((role) => (role._id === selectedRole._id ? { ...roleResponse.data, users: newUsers } : role))
      );
      setShowEditModal(false);
    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!token) {
      console.error('Token non disponible');
      return;
    }
    if (!selectedRole) {
      return;
    }

    try {
      await axios.delete(`${apiBaseUrl}/api/roles/${selectedRole._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles((prevRoles) => prevRoles.filter((role) => role._id !== selectedRole._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erreur suppression rôle:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression du rôle');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getRoleStyle = (roleName) => {
    if (!roleName) return { class: 'bg-secondary', color: '#000' };
    switch (roleName) {
      case 'Admin':
        return { class: 'bg-danger', color: '#fff' };
      case 'Guest':
        return { class: 'bg-success', color: '#fff' };
      case 'Team Leader':
        return { class: 'bg-warning', color: '#000' };
      case 'Team Member':
        return { class: 'bg-info', color: '#fff' };
      case 'Project Manager':
        return { class: 'bg-primary', color: '#fff' };
      default:
        return { class: 'bg-secondary', color: '#000' };
    }
  };

  const filteredRoles = roles.filter((role) => {
    const roleNameMatch = role.name.toLowerCase().includes(searchQuery.toLowerCase());
    const userNameMatch = role.users?.some((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
    return roleNameMatch || userNameMatch || searchQuery === '';
  });

  const indexOfLastRole = currentPage * entries;
  const indexOfFirstRole = indexOfLastRole - entries;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / entries);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Récupérer tous les utilisateurs pour l'assignation
  useEffect(() => {
    if (token) {
      axios
        .get(`${apiBaseUrl}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAvailableUsers(response.data);
        })
        .catch((error) => console.error('Erreur récupération utilisateurs:', error));
    }
  }, [token, apiBaseUrl]);

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <div className="app-content">
        <main>
          <div className="container-fluid">
            <h4 className="section-title f-w-700 mb-4">Role Management</h4>

            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                  <h5 style={{ color: '#34495e', marginBottom: '15px' }}>Filters</h5>
                  <form className="d-flex flex-wrap gap-3 align-items-end">
                    <div className="form-group">
                      <label htmlFor="filterEntries" className="form-label" style={{ color: '#7f8c8d' }}>
                        Show Entries
                      </label>
                      <select
                        id="filterEntries"
                        name="entries"
                        className="form-select"
                        style={{ minWidth: '150px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={entries}
                        onChange={(e) => setEntries(parseInt(e.target.value))}
                        aria-label="Select number of entries"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterSearch" className="form-label" style={{ color: '#7f8c8d' }}>
                        Search
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaSearch />
                        </span>
                        <input
                          id="filterSearch"
                          type="text"
                          className="form-control"
                          style={{ borderColor: '#ced4da', borderRadius: '5px' }}
                          placeholder="Search by role or username"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          aria-label="Search by role or username"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <Button
                        id="createRole"
                        variant="primary"
                        onClick={() => setShowCreateRoleModal(true)}
                        style={{ minWidth: '150px', height: '38px', borderRadius: '5px', lineHeight: '1.5' }}
                        aria-label="Create a new role"
                      >
                        Create Role
                      </Button>
                    </div>
                    <div className="form-group">
                      <Button
                        id="assignRole"
                        variant="primary"
                        onClick={() => setShowAddModal(true)}
                        style={{ minWidth: '150px', height: '38px', borderRadius: '5px', lineHeight: '1.5' }}
                        aria-label="Assign a role"
                      >
                        Assign
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body py-3 px-0 overflow-hidden">
                    <div className="table-responsive app-scroll">
                      <table className="table align-middle project-status-table mb-0" role="grid">
                        <thead>
                          <tr>
                            <th scope="col">Role</th>
                            <th scope="col">Permissions</th>
                            <th scope="col">Users</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRoles.length > 0 ? (
                            currentRoles.map((role) => (
                              <tr key={role._id}>
                                <td>
                                  <span
                                    className={`badge ${getRoleStyle(role.name).class} f-s-11 f-w-700 px-2 py-1`}
                                    style={{ color: getRoleStyle(role.name).color }}
                                  >
                                    {role.name || 'Unknown'}
                                  </span>
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {role.permissions?.join(', ') || 'No permissions'}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {role.users?.length
                                    ? role.users.map((user) => `${user.firstname} ${user.lastname}`).join(', ')
                                    : 'No Users'}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleEditClick(role)}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteClick(role)}
                                  >
                                    <FaTrash />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">
                                Aucun rôle trouvé
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
                    Showing {currentRoles.length} of {filteredRoles.length} entries
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
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setNewRole({ name: '', permissions: [], users: [] });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign a Role to a User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">User</label>
            <select
              className="form-control"
              value={newRole.users[0] || ''}
              onChange={(e) => setNewRole({ ...newRole, users: [e.target.value] })}
            >
              <option value="">Select a user</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstname} {user.lastname}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddModal(false);
              setNewRole({ name: '', permissions: [], users: [] });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddRole} disabled={!newRole.name || !newRole.users[0]}>
            Assign Role
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateRoleModal} onHide={() => setShowCreateRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Role Name</label>
            <select
              className="form-control"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            >
              <option value="">Select a role name</option>
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Team Member">Team Member</option>
              <option value="Guest">Guest</option>
            </select>
          </div>
          <div className="permissions-list" style={{ marginTop: '20px' }}>
            <h5>Permissions</h5>
            {permissionsList.map((permission) => (
              <div key={permission} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={permission}
                  name="permissions"
                  value={permission}
                  checked={newRole.permissions.includes(permission)}
                  onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={permission}>
                  {permission}
                </label>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateRole}>
            Create Role
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Role Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={selectedRole?.name || ''}
              onChange={(e) => setSelectedRole((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Role name"
            />
          </div>
          <div className="user-list" style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
            <h5>Users</h5>
            {allUsers.length > 0 ? (
              <select
                multiple
                className="form-control"
                name="users"
                value={selectedRole?.users || []}
                onChange={(e) =>
                  setSelectedRole((prev) => ({
                    ...prev,
                    users: Array.from(e.target.selectedOptions, (option) => option.value),
                  }))
                }
              >
                {allUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstname} {user.lastname}
                  </option>
                ))}
              </select>
            ) : (
              <p>No users found.</p>
            )}
          </div>
          <div className="permissions-list" style={{ marginTop: '20px' }}>
            <h5>Permissions</h5>
            {permissionsList.map((permission) => (
              <div key={permission} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={permission}
                  name="permissions"
                  value={permission}
                  checked={selectedRole?.permissions.includes(permission)}
                  onChange={(e) => handleRoleChange(e, 'edit')}
                />
                <label className="form-check-label" htmlFor={permission}>
                  {permission}
                </label>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveRole}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this role?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoleManagement;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import Header from '../Layout/Header';
import Sidebar from '../Layout/SideBar';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All');
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4000';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s-]{8,15}$/;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Aucun token trouvé.');
      setError('Vous devez être connecté.');
      return;
    }

    Promise.all([
      axios.get(`${apiBaseUrl}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        throw err;
      }),
      axios.get(`${apiBaseUrl}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => {
        console.error('Erreur lors de la récupération des rôles:', err);
        throw err;
      }),
    ])
      .then(([usersResponse, rolesResponse]) => {
        console.log('Utilisateurs récupérés:', usersResponse.data);
        console.log('Rôles récupérés:', rolesResponse.data);
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        setRoles(rolesResponse.data);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error.response?.data?.message || 'Impossible de charger les données.');
      });
  }, [apiBaseUrl]);

  useEffect(() => {
    console.log('Mise à jour du filtre - searchTerm:', searchTerm, 'roleFilter:', roleFilter);
    const filtered = users.filter((user) => {
      const matchesFirstName = user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesPhone = user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesRole = roleFilter === 'All' || user.role?.name === roleFilter;
      return (matchesFirstName || matchesPhone) && matchesRole;
    });
    console.log('Utilisateurs filtrés:', filtered);
    setFilteredUsers(filtered);
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  }, [searchTerm, roleFilter, users]);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${apiBaseUrl}/api/auth/users/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== selectedUser._id));
        setFilteredUsers(filteredUsers.filter((user) => user._id !== selectedUser._id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        alert(error.response?.data?.message || 'Erreur lors de la suppression.');
      }
    }
    setShowDeleteModal(false);
  };

  const handleEditClick = (user) => {
    setSelectedUser({ ...user, role: user.role?.name || '' });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedUser.firstname?.trim()) errors.firstname = 'Le prénom est requis.';
    if (!selectedUser.lastname?.trim()) errors.lastname = 'Le nom est requis.';
    if (!selectedUser.phone?.trim()) errors.phone = 'Le numéro de téléphone est requis.';
    else if (!phoneRegex.test(selectedUser.phone)) errors.phone = 'Le numéro de téléphone est invalide.';
    if (!selectedUser.email?.trim()) errors.email = 'L\'email est requis.';
    else if (!emailRegex.test(selectedUser.email)) errors.email = 'L\'email est invalide.';
    if (!selectedUser.role) errors.role = 'Le rôle est requis.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `${apiBaseUrl}/api/auth/users/${selectedUser._id}`,
        selectedUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(users.map((user) => (user._id === selectedUser._id ? response.data : user)));
      setFilteredUsers(filteredUsers.map((user) => (user._id === selectedUser._id ? response.data : user)));
      setShowEditModal(false);
      alert('Utilisateur mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(filteredUsers.length / entries);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  const indexOfLastUser = currentPage * entries;
  const indexOfFirstUser = indexOfLastUser - entries;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / entries);

  if (error) return <p>{error}</p>;

  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <div className="app-content">
        <main>
          <div className="container-fluid">
            <h4 className="section-title f-w-700 mb-4">Users Management</h4>
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
                      <label htmlFor="filterRole" className="form-label" style={{ color: '#7f8c8d' }}>
                        Role
                      </label>
                      <select
                        id="filterRole"
                        className="form-select"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        aria-label="Filter by role"
                      >
                        <option value="All">All</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
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
                          type="search"
                          className="form-control"
                          style={{ borderColor: '#ced4da', borderRadius: '5px' }}
                          placeholder="Search by name or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          aria-label="Search by name or phone"
                        />
                      </div>
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
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Email</th>
                            <th scope="col">Role</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                              <tr key={user._id}>
                                <td>
                                  <h6 className="mb-0 text-success-dark text-nowrap">{user.firstname || 'N/A'}</h6>
                                </td>
                                <td>
                                  <h6 className="mb-0 text-success-dark text-nowrap">{user.lastname || 'N/A'}</h6>
                                </td>
                                <td className="text-success-dark f-w-600">{user.phone || 'N/A'}</td>
                                <td className="text-success-dark f-w-600">{user.email || 'N/A'}</td>
                                <td>
                                  <span
                                    className={`badge ${getRoleStyle(user.role?.name).class} f-s-11 f-w-700 px-2 py-1`}
                                    style={{ color: getRoleStyle(user.role?.name).color }}
                                  >
                                    {user.role?.name || 'Unknown'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm me-2"
                                    onClick={() => handleDeleteClick(user)}
                                  >
                                    <FaTrash />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <FaEdit />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                Aucun utilisateur disponible
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
                    Showing {currentUsers.length} of {filteredUsers.length} entries
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

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mettre à jour l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="editFirstname" className="form-label">Prénom</label>
              <input
                type="text"
                className="form-control"
                id="editFirstname"
                name="firstname"
                value={selectedUser?.firstname || ''}
                onChange={handleInputChange}
                placeholder="Prénom"
              />
              {formErrors.firstname && (
                <small className="text-danger">{formErrors.firstname}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="editLastname" className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                id="editLastname"
                name="lastname"
                value={selectedUser?.lastname || ''}
                onChange={handleInputChange}
                placeholder="Nom"
              />
              {formErrors.lastname && (
                <small className="text-danger">{formErrors.lastname}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="editPhone" className="form-label">Téléphone</label>
              <input
                type="text"
                className="form-control"
                id="editPhone"
                name="phone"
                value={selectedUser?.phone || ''}
                onChange={handleInputChange}
                placeholder="Téléphone"
              />
              {formErrors.phone && (
                <small className="text-danger">{formErrors.phone}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="editEmail" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="editEmail"
                name="email"
                value={selectedUser?.email || ''}
                onChange={handleInputChange}
                placeholder="Email"
              />
              {formErrors.email && (
                <small className="text-danger">{formErrors.email}</small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="editRole" className="form-label">Rôle</label>
              <select
                className="form-control"
                id="editRole"
                name="role"
                value={selectedUser?.role || ''}
                onChange={handleInputChange}
              >
                <option value="">Sélectionner un rôle</option>
                {roles.map((role) => (
                  <option key={role._id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              {formErrors.role && (
                <small className="text-danger">{formErrors.role}</small>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Body className="text-center">
          <div className="mb-3">
            <FaTrash size={40} className="text-danger" />
          </div>
          <h4 className="text-danger f-w-600">Are You Sure?</h4>
          <p className="text-secondary f-s-16">You won't be able to revert this!</p>
          <div className="mt-3">
            <Button variant="secondary" onClick={handleCloseDeleteModal} className="me-2">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserList;
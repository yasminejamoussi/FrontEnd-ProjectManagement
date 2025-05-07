import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import Header from "../Layout/Header";
import Sidebar from '../Layout/SideBar';

const ApiPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredUsers.length / entries);
  const [showEditModal, setShowEditModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
    axios.get(`${apiBaseUrl}/api/auth/users`)
      .then((response) => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      });
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesFirstName = user.firstname.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhone = user.phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role?.name === roleFilter;
      return (matchesFirstName || matchesPhone) && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
      axios.delete(`${apiBaseUrl}/api/auth/users/${selectedUser._id}`)
        .then(() => {
          setUsers(users.filter(user => user._id !== selectedUser._id));
          setFilteredUsers(filteredUsers.filter(user => user._id !== selectedUser._id));
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de l'utilisateur:", error);
        });
    }
    setShowDeleteModal(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getRoleStyle = (roleName) => {
    if (!roleName) return { class: "bg-secondary", color: "#000" };
    switch (roleName) {
      case "Admin":
        return { class: "bg-danger", color: "#fff" };
      case "Guest":
        return { class: "bg-success", color: "#fff" };
      case "Team Leader":
        return { class: "bg-warning", color: "#000" };
      case "Team Member":
        return { class: "bg-info", color: "#fff" };
      case "Project Manager":
        return { class: "bg-primary", color: "#fff" };
      default:
        return { class: "bg-secondary", color: "#000" };
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = () => {
    const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
    axios.put(`${apiBaseUrl}/api/auth/users/${selectedUser._id}`, selectedUser)
      .then(() => {
        setUsers(users.map(user => (user._id === selectedUser._id ? selectedUser : user)));
        setFilteredUsers(filteredUsers.map(user => (user._id === selectedUser._id ? selectedUser : user)));
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      });
  };

  const indexOfLastUser = currentPage * entries;
  const indexOfFirstUser = indexOfLastUser - entries;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
                      <label htmlFor="filterEntries" className="form-label" style={{ color: '#7f8c8d' }}>Show Entries</label>
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
                      <label htmlFor="filterRole" className="form-label" style={{ color: '#7f8c8d' }}>Role</label>
                      <select
                        id="filterRole"
                        className="form-select"
                        style={{ minWidth: '200px', borderColor: '#ced4da', borderRadius: '5px' }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        aria-label="Filter by role"
                      >
                        <option value="All">All</option>
                        <option value="Admin">Admin</option>
                        <option value="Guest">Guest</option>
                        <option value="Team Leader">Team Leader</option>
                        <option value="Team Member">Team Member</option>
                        <option value="Project Manager">Project Manager</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filterSearch" className="form-label" style={{ color: '#7f8c8d' }}>Search</label>
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
                                  <h6 className="mb-0 text-success-dark text-nowrap">
                                    {user.firstname}
                                  </h6>
                                </td>
                                <td>
                                  <h6 className="mb-0 text-success-dark text-nowrap">
                                    {user.lastname}
                                  </h6>
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {user.phone}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {user.email}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${getRoleStyle(user.role?.name).class} f-s-11 f-w-700 px-2 py-1`}
                                    style={{ color: getRoleStyle(user.role?.name).color }}
                                  >
                                    {user.role?.name || "Unknown"}
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
                                No users available
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Body>
          <h4>Update User</h4>
          <input
            type="text"
            className="form-control mb-2"
            name="firstname"
            value={selectedUser?.firstname || ""}
            onChange={handleInputChange}
            placeholder="Prénom"
          />
          <input
            type="text"
            className="form-control mb-2"
            name="lastname"
            value={selectedUser?.lastname || ""}
            onChange={handleInputChange}
            placeholder="Nom"
          />
          <input
            type="text"
            className="form-control mb-2"
            name="phone"
            value={selectedUser?.phone || ""}
            onChange={handleInputChange}
            placeholder="Téléphone"
          />
          <input
            type="email"
            className="form-control mb-2"
            name="email"
            value={selectedUser?.email || ""}
            onChange={handleInputChange}
            placeholder="Email"
          />
          <select className="form-control" name="role" value={selectedUser?.role || ""} onChange={handleInputChange}>
            <option value="Admin">Admin</option>
            <option value="Guest">Guest</option>
            <option value="Team Leader">Team Leader</option>
            <option value="Team Member">Team Member</option>
            <option value="Project Manager">Project Manager</option>
          </select>
          <Button variant="primary" onClick={handleSaveUser} className="mt-3">Save</Button>
        </Modal.Body>
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

export default ApiPage;
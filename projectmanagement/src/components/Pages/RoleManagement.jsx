import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Header from "../Layout/Header";
import Sidebar from '../Layout/SideBar';
import axios from "axios";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";

const RoleManagement = () => {
  const permissionsList = [
    "View Projects",
    "Edit Projects",
    "Delete Projects",
    "Manage Users",
    "Assign Roles",
    "View Reports",
  ];
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchQuery, setSearchQuery] = useState("");
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
    name: "",
    permissions: [],
    users: [],
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);

    if (!token) {
      console.error("Aucun token trouvé, l'utilisateur doit se connecter.");
      return;
    }

    axios
      .get("http://localhost:4000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAllUsers(response.data);
      })
      .catch((error) => console.error("Erreur récupération utilisateurs :", error));

    axios
      .get("http://localhost:4000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRoles(response.data);
      })
      .catch((error) => console.error("Erreur récupération rôles :", error));
  }, [token]);

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
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token non disponible");
      return;
    }

    if (!newRole.name || newRole.name.trim() === "") {
      alert("Veuillez entrer un nom pour le rôle");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/roles",
        newRole,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        alert("Rôle créé avec succès !");

        const rolesResponse = await axios.get("http://localhost:4000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(rolesResponse.data);

        setShowCreateRoleModal(false);
        setNewRole({ name: "", permissions: [], users: [] });
      }
    } catch (error) {
      console.error("Erreur lors de la création du rôle :", error);
      alert("Erreur lors de la création du rôle");
    }
  };

  const handlePermissionChange = (permission, isChecked) => {
    if (isChecked) {
      setNewRole((prevRole) => ({
        ...prevRole,
        permissions: [...prevRole.permissions, permission],
      }));
    } else {
      setNewRole((prevRole) => ({
        ...prevRole,
        permissions: prevRole.permissions.filter((p) => p !== permission),
      }));
    }
  };

  const handleAddRole = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token non disponible");
      return;
    }

    const { name: roleName, users: [userId] } = newRole;

    if (!roleName || !userId) {
      alert("Please select a role and user");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/api/roles/assign-user`,
        { roleName, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Role successfully assigned !");

        const rolesResponse = await axios.get("http://localhost:4000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(rolesResponse.data);

        setShowAddModal(false);
        setNewRole({ name: "", permissions: [], users: [] });
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du rôle :", error);
      alert("Erreur lors de l'assignation du rôle");
    }
  };

  const handleEditClick = (role) => {
    setSelectedRole({ ...role });
    setShowEditModal(true);
  };

  const handleSaveRole = () => {
    const jwtToken = localStorage.getItem("token");

    if (!jwtToken) return console.error("Token non disponible");
    if (!selectedRole) return console.error("Aucun rôle sélectionné");

    axios
      .put(`http://localhost:4000/api/roles/${selectedRole._id}`, selectedRole, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((response) => {
        setRoles((prevRoles) =>
          prevRoles.map((role) => (role._id === selectedRole._id ? response.data : role))
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        console.error("Erreur mise à jour rôle:", error);
      });
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!token) return console.error("Token non disponible");
    if (!selectedRole) return;

    axios
      .delete(`http://localhost:4000/api/roles/${selectedRole._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setRoles((prevRoles) => prevRoles.filter((role) => role._id !== selectedRole._id));
        setShowDeleteModal(false);
      })
      .catch((error) => console.error("Erreur suppression rôle:", error));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
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

  const filteredRoles = roles.filter((role) => {
    if (!role.users || role.users.length === 0) return false;
    return role.users.some((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
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
                      <label htmlFor="filterSearch" className="form-label" style={{ color: '#7f8c8d' }}>Search</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaSearch />
                        </span>
                        <input
                          id="filterSearch"
                          type="text"
                          className="form-control"
                          style={{ borderColor: '#ced4da', borderRadius: '5px' }}
                          placeholder="Search by username"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          aria-label="Search by username"
                        />
                      </div>
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
                                    {role.name || "Unknown"}
                                  </span>
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {role.permissions?.join(", ") || "Aucune permission"}
                                </td>
                                <td className="text-success-dark f-w-600">
                                  {role.users?.length
                                    ? role.users.map((user) => `${user.firstname} ${user.lastname}`).join(", ")
                                    : "Aucun utilisateur"}
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

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Body>
          <h4>Assign a role to a user</h4>
          <div className="mb-3">
            <label>Role</label>
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
            <label>Users</label>
            <select
              className="form-control"
              value={newRole.users[0] || ""}
              onChange={(e) => setNewRole({ ...newRole, users: [e.target.value] })}
            >
              <option value="">Select a user</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstname} {user.lastname}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={handleAddRole} className="mt-3">
            Assign a role
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showCreateRoleModal} onHide={() => setShowCreateRoleModal(false)}>
        <Modal.Body>
          <h4>Créer un nouveau rôle</h4>
          <div className="mb-3">
            <label>Nom du rôle</label>
            <input
              type="text"
              className="form-control"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              placeholder="Entrez le nom du rôle"
            />
          </div>
          <div className="permissions-list" style={{ marginTop: "20px" }}>
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
          <Button variant="primary" onClick={handleCreateRole} className="mt-3">
            Créer le rôle
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Body>
          <h4>Modifier le rôle</h4>
          <input
            type="text"
            className="form-control"
            name="name"
            value={selectedRole?.name || ""}
            onChange={(e) => setSelectedRole((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nom du rôle"
          />
          <div className="user-list" style={{ maxHeight: "200px", overflowY: "auto", marginTop: "10px" }}>
            <h5>Utilisateurs</h5>
            {allUsers.length > 0 ? (
              <select
                multiple
                className="form-control"
                name="users"
                value={selectedRole?.users || []}
                onChange={(e) => setSelectedRole((prev) => ({
                  ...prev,
                  users: Array.from(e.target.selectedOptions, (option) => option.value),
                }))}
              >
                {allUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstname} {user.lastname}
                  </option>
                ))}
              </select>
            ) : (
              <p>Aucun utilisateur trouvé.</p>
            )}
          </div>
          <div className="permissions-list" style={{ marginTop: "20px" }}>
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
          <Button variant="primary" onClick={handleSaveRole} className="mt-3">
            Sauvegarder
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Body>
          <h4>Confirmer la suppression ?</h4>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Oui, Supprimer
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RoleManagement;
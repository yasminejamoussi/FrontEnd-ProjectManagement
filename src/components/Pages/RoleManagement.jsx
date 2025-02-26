import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Header from "../Layout/Header";
import Sidebar from "../Layout/Sidebar";
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
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;
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

  const token = localStorage.getItem("token");

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
      // For edit mode, you need to update the selectedRole state
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
      // For add mode, the previous logic remains
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
  

  const handleAddRole = () => {
    if (!token) return console.error("Token non disponible");

    axios
      .post("http://localhost:4000/api/roles", newRole, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRoles((prevRoles) => [...prevRoles, response.data]);
        setShowAddModal(false);
        setNewRole({ name: "", permissions: [], users: [] });
      })
      .catch((error) => console.error("Erreur ajout rôle:", error));
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
  const tableHeaderStyle = {
    backgroundColor: "#8C76F0", // Mauve
    color: "white", // Texte en blanc pour contraster
  };
  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <div className="app-content">
        <main>
          <div className="container-fluid">
          <h2 className="mb-4">Gestion des rôles</h2>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Ajouter un rôle
              </Button>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>
                  Show {" "}
                  <select
                    name="entries"
                    className="form-select d-inline w-auto mx-2"
                    value={entries}
                    onChange={(e) => setEntries(parseInt(e.target.value))}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>{" "}
                  entries
                </label>
              </div>
              <div className="col-md-6 text-end">
                <label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                   
                  </div>
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive app-scroll app-datatable-default">
                      <table className="table table-hover table-striped">
                        <thead style={tableHeaderStyle}> {/* Appliquer le style mauve */}
                          <tr>
                          <th>Rôle</th>
                      <th>Permissions</th>
                      <th>Utilisateurs</th>
                      <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <tr key={role._id}>
                          <td>{role.name}</td>
                          <td>{role.permissions?.join(", ") || "Aucune permission"}</td>
                          <td>
                            {role.users?.length
                              ? role.users.map((user) => `${user.firstname} ${user.lastname}`).join(", ")
                              : "Aucun utilisateur"}
                          </td>
                          <td>
                              <>
                                <button className="btn btn-success me-2" onClick={() => handleEditClick(role)}>
                                <FaEdit />

                                </button>
                                <button className="btn btn-danger" onClick={() => handleDeleteClick(role)}>
                                <FaTrash />

                                </button>
                              </>
                            
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">Aucun rôle disponible</td>
                      </tr>
                    )}
                  </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages).keys()].map((page) => (
                      <li key={page + 1} className={`page-item ${currentPage === page + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                          {page + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </main>
      </div>
    
      {/* Modals */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
  <Modal.Body>
    <h4>Ajouter un rôle</h4>
    <input
      type="text"
      className="form-control"
      name="name"
      value={newRole.name}
      onChange={handleRoleChange}
      placeholder="Nom du rôle"
    />

    {/* Liste des utilisateurs avec scroll */}
    <div className="user-list" style={{ maxHeight: "200px", overflowY: "auto", marginTop: "10px" }}>
      <h5>Utilisateurs</h5>
      {allUsers.length > 0 ? (
        <select
          multiple
          className="form-control"
          name="users"
          value={newRole.users}
          onChange={handleRoleChange}
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

    {/* Liste des permissions avec checkboxes */}
    <div className="permissions-list" style={{ marginTop: "20px" }}>
      <h5>Permissions</h5>
      {permissionsList.map((permission, index) => (
        <div key={index} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={permission}
            name="permissions"
            value={permission}
            checked={newRole.permissions.includes(permission)}
            onChange={handleRoleChange}
          />
          <label className="form-check-label" htmlFor={permission}>
            {permission}
          </label>
        </div>
      ))}
    </div>

    <Button variant="primary" onClick={handleAddRole} className="mt-3">
      Ajouter
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

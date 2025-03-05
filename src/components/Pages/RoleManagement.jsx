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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState(10);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
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

  //const token = localStorage.getItem("token");

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
      // Appeler l'API pour créer le rôle
      const response = await axios.post(
        "http://localhost:4000/api/roles",
        newRole,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 201) {
        alert("Rôle créé avec succès !");
  
        // Rafraîchir la liste des rôles après la création
        const rolesResponse = await axios.get("http://localhost:4000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(rolesResponse.data);
  
        // Fermer la modale et réinitialiser le formulaire
        setShowCreateRoleModal(false);
        setNewRole({ name: "", permissions: [] });
      }
    } catch (error) {
      console.error("Erreur lors de la création du rôle :", error);
      alert("Erreur lors de la création du rôle");
    }
  };
  const handlePermissionChange = (permission, isChecked) => {
    if (isChecked) {
      // Ajouter la permission à la liste
      setNewRole((prevRole) => ({
        ...prevRole,
        permissions: [...prevRole.permissions, permission],
      }));
    } else {
      // Retirer la permission de la liste
      setNewRole((prevRole) => ({
        ...prevRole,
        permissions: prevRole.permissions.filter((p) => p !== permission),
      }));
    }
  };
  {/*const handleAddRole = () => {
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
  };*/}
  const handleAddRole = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token non disponible");
      return;
    }
  
    const { name: roleName, users: [userId] } = newRole;
  
    console.log("Données envoyées :", { roleName, userId }); // Ajoutez ce log pour vérifier
  
    if (!roleName || !userId) {
      alert("Veuillez sélectionner un rôle et un utilisateur");
      return;
    }
  
    try {
      // Appeler l'API pour assigner le rôle à l'utilisateur
      const response = await axios.post(
        `http://localhost:4000/api/roles/assign-user`,
        { roleName, userId }, // Envoyez les données correctes
        {
          headers: { Authorization: `Bearer ${token}` }, // Ajoutez le token d'authentification
        }
      );
  
      if (response.status === 200) {
        alert("Rôle assigné avec succès !");
  
        // Rafraîchir la liste des rôles après l'assignation
        const rolesResponse = await axios.get("http://localhost:4000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(rolesResponse.data);
  
        // Fermer la modale et réinitialiser le formulaire
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
  const tableHeaderStyle = {
    backgroundColor: "#8C76F0", // Mauve
    color: "white", // Texte en blanc pour contraster
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const filteredRoles = roles.filter((role) => {
    // Si aucun utilisateur n'est assigné au rôle, on le filtre
    if (!role.users || role.users.length === 0) return false;
  
    // Vérifier si au moins un utilisateur du rôle correspond à la recherche
    return role.users.some((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  });
  return (
    <div className="app-wrapper">
      <Header />
      <Sidebar />
      <div className="app-content">
        <main>
          <div className="container-fluid">
          <h2 className="mb-4">Gestion des rôles</h2>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Assigner 
              </Button>
              {/*<Button variant="primary" onClick={() => setShowCreateRoleModal(true)}>
                Ajouter un rôle
              </Button>*/}
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
                </label>
              </div>
              <div className="col-md-6 text-end">
  <label>
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="Rechercher par nom d'utilisateur"
        onChange={(e) => handleSearch(e.target.value)}
      />
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
  {filteredRoles.length > 0 ? (
    filteredRoles.map((role) => (
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
      <td colSpan="4">Aucun rôle trouvé</td>
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
     {/* <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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
*/}
<Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
  <Modal.Body>
    <h4>Assigner un rôle à un utilisateur</h4>

    {/* Sélection du rôle */}
    <div className="mb-3">
      <label>Rôle</label>
      <select
        className="form-control"
        value={newRole.name}
        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
      >
        <option value="">Sélectionner un rôle</option>
        {roles.map((role) => (
          <option key={role._id} value={role.name}> {/* Utilisez role.name ici */}
            {role.name}
          </option>
        ))}
      </select>
    </div>

    {/* Sélection de l'utilisateur */}
    <div className="mb-3">
      <label>Utilisateur</label>
      <select
        className="form-control"
        value={newRole.users[0] || ""} // On prend le premier utilisateur sélectionné
        onChange={(e) => setNewRole({ ...newRole, users: [e.target.value] })}
      >
        <option value="">Sélectionner un utilisateur</option>
        {allUsers.map((user) => (
          <option key={user._id} value={user._id}> {/* Utilisez user._id ici */}
            {user.firstname} {user.lastname}
          </option>
        ))}
      </select>
    </div>

    {/* Bouton pour assigner le rôle */}
    <Button variant="primary" onClick={handleAddRole} className="mt-3">
      Assigner le rôle
    </Button>
  </Modal.Body>
</Modal>
<Modal show={showCreateRoleModal} onHide={() => setShowCreateRoleModal(false)}>
  <Modal.Body>
    <h4>Créer un nouveau rôle</h4>

    {/* Champ pour le nom du rôle */}
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

    {/* Liste des permissions avec des cases à cocher */}
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

    {/* Bouton pour créer le rôle */}
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

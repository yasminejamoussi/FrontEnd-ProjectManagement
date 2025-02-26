import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../Layout/Header";
import SideBar from "../Layout/SideBar";
import "../../assets/css/style.css";
import "../../assets/vendor/bootstrap/bootstrap.min.css";
import "../../assets/vendor/fontawesome/css/all.css";
import "../../assets/vendor/animation/animate.min.css";
import "../../assets/vendor/ionio-icon/css/iconoir.css";
import "../../assets/vendor/tabler-icons/tabler-icons.css";
import "../../assets/vendor/flag-icons-master/flag-icon.css";
import "../../assets/vendor/prism/prism.min.css";
import "../../assets/vendor/simplebar/simplebar.css";
import "../../assets/css/responsive.css";

const ApiPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Pour stocker les utilisateurs filtrés
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  useEffect(() => {
    axios.get("http://localhost:4000/api/auth/users")
      .then((response) => {
        console.log(response.data);
        setUsers(response.data);
        setFilteredUsers(response.data); // Initialiser les utilisateurs filtrés avec toutes les données
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      });
  }, []);

  // Fonction pour filtrer les utilisateurs en fonction de la recherche
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesFirstName = user.firstname.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhone = user.phone.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFirstName || matchesPhone;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
      axios.delete(`http://localhost:4000/api/auth/users/${selectedUser._id}`)
        .then(() => {
          setUsers(users.filter(user => user._id !== selectedUser._id));
          setFilteredUsers(filteredUsers.filter(user => user._id !== selectedUser._id)); // Mettre à jour les utilisateurs filtrés
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

  return (
    <div className="app-wrapper">
      <Header />
      <SideBar />

      <div className="app-content">
        <main>
          <div className="container-fluid">
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
                  Search: {" "}
                  <input
                    type="search"
                    className="form-control d-inline w-auto"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body p-0">
                    <div className="table-responsive app-scroll app-datatable-default">
                      <table className="w-100 display apikey-data-table table-bottom-border">
                        <thead>
                          <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user._id}>
                              <td>{user.firstname}</td>
                              <td>{user.lastname}</td>
                              <td>{user.phone}</td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger icon-btn b-r-4 delete-btn"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <i className="ti ti-trash"></i>
                                </button>
                                <Link to={`/updatee-user/${user._id}`}>
                                  <button type="button" className="btn btn-success icon-btn b-r-4">
                                    <i className="ti ti-edit"></i>
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          ))}
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

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Body>
          <div className="text-center">
            <h4 className="text-danger f-w-600">Are You Sure?</h4>
            <p className="text-secondary f-s-16">You won't be able to revert this!</p>
          </div>
          <div className="text-center mt-3">
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleConfirmDelete}>
              Yes, Delete it
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ApiPage;
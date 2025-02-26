import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import Header from "../Layout/Header";
import SideBar from "../Layout/side";

const ApiPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  useEffect(() => {
    axios.get("http://localhost:4000/api/auth/users")
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

  // Fonction pour obtenir le style en fonction du rôle
  const getRoleStyle = (role) => {
    switch (role) {
      case "Admin":
        return { color: "#fc7cb1", fontWeight: "bold" }; // Rouge pour Admin
      case "Guest":
        return { color: "#F8C8DC", fontWeight: "bold" }; // Vert pour User
      case "Team Leader":
        return { color: "#f0e78b", fontWeight: "bold" }; // Jaune pour Editor
      case "Team Member":
        return { color: "#97e68a", fontWeight: "bold" }; // Bleu pour Guest
        case "Project Manager":
          return { color: "#f0b881", fontWeight: "bold" }; // Bleu pour Guest
      default:
        return {};
    }
  };

  // Style pour l'en-tête du tableau en mauve
  const tableHeaderStyle = {
    backgroundColor: "#8C76F0", // Mauve
    color: "white", // Texte en blanc pour contraster
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
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                              <td style={getRoleStyle(user.role)}>{user.role}</td> {/* Appliquer le style en fonction du rôle */}
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm me-2"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <FaTrash />
                                </button>
                                <Link to={`/updatee-user/${user._id}`}>
                                  <button type="button" className="btn btn-success btn-sm">
                                    <FaEdit />
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
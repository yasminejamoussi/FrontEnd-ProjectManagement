import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UserProfileForm = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [showRoleWarning, setShowRoleWarning] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get("http://localhost:4000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setUpdatedUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:4000/api/profile/update",
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User profile not found</p>;
  }

  return (
    <form className="app-form">
      <h5>User Info</h5>
      <div className="row">
        <div className="col-md-12">
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              name="firstname"
              value={updatedUser.firstname}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="col-md-12">
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              name="lastname"
              value={updatedUser.lastname}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={updatedUser.phone}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
      {/* Email Field */}
      <div className="col-12">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={updatedUser.email}
            readOnly
            onFocus={() => setShowEmailWarning(true)}
            onBlur={() => setShowEmailWarning(false)}
          />
          {showEmailWarning && (
            <small className="text-danger">This field cannot be modified.</small>
          )}
        </div>
      </div>

      {/* Role Field */}
      <div className="col-12">
        <div className="mb-3">
          <label className="form-label">Role</label>
          <input
            type="text"
            className="form-control"
            name="role"
            value={updatedUser.role.name}
            readOnly
            onFocus={() => setShowRoleWarning(true)}
            onBlur={() => setShowRoleWarning(false)}
          />
          {showRoleWarning && (
            <small className="text-danger">This field cannot be modified.</small>
          )}
        </div>
      </div>

        <div className="col-12">
          <button
            type="button"
            className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserProfileForm;

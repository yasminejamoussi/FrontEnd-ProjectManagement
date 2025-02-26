import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UserProfileForm = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Récupérer le token depuis le stockage local
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        // Décoder le token pour obtenir l'ID utilisateur (si nécessaire)
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id; // Assure-toi que l'ID utilisateur est bien dans le token

        // Effectuer la requête API
        const response = await axios.get("http://localhost:4000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
            <input type="text" className="form-control" value={user.firstname} readOnly />
          </div>
        </div>
        <div className="col-md-12">
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-control" value={user.lastname} readOnly />
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-control" value={user.phone} readOnly />
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={user.email} readOnly />
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={user.role} readOnly />
          </div>
        </div>
      </div>
    </form>
  );
};

export default UserProfileForm;

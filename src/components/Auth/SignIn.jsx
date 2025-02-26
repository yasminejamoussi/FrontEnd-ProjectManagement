import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FaceRecognition from "../Pages/FaceRecognition"; // Importez le composant FaceRecognition

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [useFaceID, setUseFaceID] = useState(false); // État pour activer/désactiver Face ID
  const [isBlocked, setIsBlocked] = useState(false); // État pour gérer le blocage de l'utilisateur
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est bloqué au chargement du composant
    const blockExpiration = localStorage.getItem("blockExpiration");
    if (blockExpiration && new Date().getTime() < Number(blockExpiration)) {
      setIsBlocked(true);
      setError("Vous êtes bloqué, réessayez dans 1 minute.");
    } else {
      localStorage.removeItem("blockExpiration");
      setIsBlocked(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", { email, password });

      if (response.status === 200) {
        const { token, user } = response.data;

        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Rediriger vers le tableau de bord
        navigate("/users");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 403) {
        // Gérer le blocage de l'utilisateur
        const blockedUntil = err.response.data.message.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        if (blockedUntil) {
          localStorage.setItem("blockExpiration", new Date(blockedUntil[0]).getTime());
          setIsBlocked(true);
          setError(`Votre compte est bloqué jusqu'à ${new Date(blockedUntil[0]).toLocaleString()}.`);
        } else {
          setError("Votre compte est bloqué en raison de trop d'anomalies.");
        }
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFaceIDSuccess = async (label) => {
    // Envoyer une requête au backend pour valider l'utilisateur reconnu
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:4000/api/auth/login-with-face", { label });
      if (response.status === 200) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/users");
      }
    } catch (err) {
      console.error("Face ID login error:", err);
      setError(err.response?.data?.message || "Face ID recognition failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-bg">
      <div className="app-wrapper d-block">
        <div className="main-container">
          <div className="container">
            <div className="row sign-in-content-bg">
              {/* Section Image */}
              <div className="col-lg-6 image-contentbox d-none d-lg-block">
                <div className="form-container">
                  <div className="signup-content mt-4">
                    <span>
                      <img alt="logo" className="img-fluid" src="/images/logo/1.png" />
                    </span>
                  </div>
                  <div className="signup-bg-img">
                    <img alt="signin" className="img-fluid" src="/images/login/01.png" />
                  </div>
                </div>
              </div>

              {/* Section Formulaire */}
              <div className="col-lg-6 form-contentbox p-4">
                <div className="form-container">
                  <form className="app-form rounded-control" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12 text-center text-lg-start mb-5">
                        <h2 className="text-primary-dark f-w-600">Welcome To Axelit!</h2>
                        <p>Sign in with your data that you entered during registration</p>
                      </div>

                      {error && (
                        <div className="col-12 mb-3">
                          <div className="alert alert-danger">{error}</div>
                        </div>
                      )}

                      <div className="col-12 mb-3">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                          className="form-control"
                          id="email"
                          placeholder="Enter Your Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading || isBlocked}
                          required
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                          className="form-control"
                          id="password"
                          placeholder="Enter Your Password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading || isBlocked}
                          required
                        />
                        <Link className="link-primary-dark float-end" to="/emailsend">Forgot Password?</Link>
                      </div>

                      <div className="col-12 mb-3">
                        <button className="btn btnSignIn w-100" type="submit" disabled={loading || isBlocked}>
                          {loading ? "Signing In..." : "Sign In"}
                        </button>
                      </div>

                      <div className="col-12 mb-3">
                        <button
                          className="btn btnFaceID w-100"
                          type="button"
                          onClick={() => setUseFaceID(true)}
                          disabled={loading || isBlocked}
                        >
                          {loading ? "Processing..." : "Sign In with Face ID"}
                        </button>
                      </div>

                      <div className="col-12 text-center text-lg-start">
                        Don't Have an Account yet? 
                        <Link className="link-primary-dark text-decoration-underline" to="/signup">
                          Sign up
                        </Link>
                      </div>
                    </div>
                  </form>

                  {/* Composant FaceRecognition */}
                  {useFaceID && (
                    <div className="faceid-modal">
                      <FaceRecognition onSuccess={handleFaceIDSuccess} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
import LogoNoir from '../../assets/images/logo/LogoNoir.png';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import FaceRecognition from "../Pages/FaceRecognition";
import AOS from 'aos';
import 'aos/dist/aos.css';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [useFaceID, setUseFaceID] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    const blockExpiration = localStorage.getItem("blockExpiration");
    if (blockExpiration && new Date().getTime() < Number(blockExpiration)) {
      setIsBlocked(true);
      setError("You are blocked, please try again in 1 minute.");
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
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending login request with:", { email, password });
      const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
      const response = await axios.post(`${apiBaseUrl}/api/auth/login`, { email, password });
      console.log("API response:", response.data);

      const { token, user } = response.data;
      console.log("Received user object:", user);
      const roleName = user?.role?.name || "Guest";
      console.log("Parsed role name:", roleName);

      if (roleName === "Guest") {
        console.log("Guest user detected, showing modal");
        setShowGuestModal(true);
        setLoading(false);
        return;
      }

      if (response.data.message === "2FA required") {
        console.log("Non-guest user, redirecting to 2FA");
        localStorage.setItem("token", token);
        localStorage.setItem("email", email);
        navigate("/verify-2fa", { state: { email } });
        setLoading(false);
        return;
      }

      console.log("Non-guest user, proceeding with login");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", roleName);

      console.log("Navigating to dashboard for non-guest user");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 403) {
        const blockedUntil = err.response.data.message.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        if (blockedUntil) {
          localStorage.setItem("blockExpiration", new Date(blockedUntil[0]).getTime());
          setIsBlocked(true);
          setError(`Your account is blocked until ${new Date(blockedUntil[0]).toLocaleString()}.`);
        } else {
          setError("Your account is blocked due to too many anomalies.");
        }
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFaceIDSuccess = async (label) => {
    try {
      setLoading(true);
      console.log("FaceID login attempt with label:", label);
      const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;
      const response = await axios.post(`${apiBaseUrl}/api/auth/login-with-face`, { faceLabel: label });
      console.log("FaceID API response:", response.data);

      const { token, user } = response.data;
      console.log("Received user object (FaceID):", user);
      const roleName = user?.role?.name || "Guest";
      console.log("Parsed role name (FaceID):", roleName);

      if (roleName === "Guest") {
        console.log("Guest user detected (FaceID), showing modal");
        setShowGuestModal(true);
        setLoading(false);
        return;
      }

      if (response.data.message === "2FA required") {
        console.log("Non-guest user (FaceID), redirecting to 2FA");
        localStorage.setItem("token", token);
        localStorage.setItem("email", user.email);
        navigate("/verify-2fa", { state: { email: user.email } });
        setLoading(false);
        return;
      }

      console.log("Non-guest user (FaceID), proceeding with login");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", roleName);

      console.log("Navigating to users for non-guest user");
      navigate("/users");
    } catch (err) {
      console.error("Face ID login error:", err);
      setError(err.response?.data?.message || "Face ID recognition failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestModalClose = () => {
    setShowGuestModal(false);
    console.log("Guest user, redirecting to landing page");
    navigate("/"); // Always redirect Guest users to landing page
  };

  return (
    <div className="sign-in-bg">
      <div className="app-wrapper d-block">
        <div className="main-container">
          <div className="container">
            <div className="row sign-in-content-bg">
              <div className="col-lg-6 image-contentbox d-none d-lg-block">
                <div className="form-container">
                  <div className="signup-content mt-4">
                    <span>
                      <img src={LogoNoir} alt="Orkestra Logo" width="400" />
                    </span>
                  </div>
                  <div className="signup-bg-img">
                    <img alt="signin" className="img-fluid" src="/images/login/01.png" />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 form-contentbox p-4">
                <div className="form-container">
                  <form className="app-form rounded-control" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12 text-center text-lg-start mb-5">
                        <h2 className="text-primary-dark f-w-600">Welcome to Orkestra!</h2>
                        <p>Sign in with the credentials provided during registration</p>
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
                          placeholder="Enter your email"
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
                          placeholder="Enter your password"
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
                        Don’t have an account yet?
                        <Link className="link-primary-dark text-decoration-underline" to="/signup">
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </form>
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
      <Modal
        show={showGuestModal}
        onHide={handleGuestModalClose}
        centered
        aria-labelledby="guest-modal-title"
      >
        <Modal.Header style={{ background: 'linear-gradient(135deg, #202335 0%, #f00ac8 100%)', color: '#ffffff' }} closeButton>
          <Modal.Title id="guest-modal-title">Welcome to Orkestra! 🎶</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center" data-aos="fade-up">
            <img src={LogoNoir} alt="Orkestra Logo" width="150" className="mb-3" data-aos="zoom-in" />
            <p className="fs-5">
              You are signed in as a guest. Wait to join our symphony! <br />
              A conductor (admin) will soon validate your access to play the first notes.
            </p>
            <p className="fs-6">
              Check your inbox for a notification about your new role!
            </p>
            <p className="fs-6 mt-3">
              In the meantime, discover our platform on{' '}
              <a href="https://facebook.com/orkestra" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>{' '}
              or{' '}
              <a href="https://twitter.com/orkestra" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>!
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center" data-aos="fade-up" data-aos-delay="200">
          <Button variant="danger" onClick={handleGuestModalClose} aria-label="Return to home">
            Return to Home
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SignIn;
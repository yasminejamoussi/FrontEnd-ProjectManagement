import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../api';
import { FaCopy } from "react-icons/fa"; // Import de l'icône
import axios from 'axios';
import "../../assets/css/style.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    terms: false,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) {
      alert("You must accept the terms and conditions to sign up.");
      return;
    }

    console.log("Form Data:", formData);

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        alert('Registration successful');
        window.location.href = '/signin';
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert('Something went wrong');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTermsChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      terms: e.target.checked,
    }));
  };

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        const { email, name, image } = result.data.user;
        const token = result.data.token;
        const obj = { email, name, token, image };
        localStorage.setItem('user-info', JSON.stringify(obj));
        navigate('/users');
      }
    } catch (e) {
      console.log('Error while Google Login...', e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const [suggestedPassword, setSuggestedPassword] = useState('');


  const handleSuggestPassword = async () => {
    console.log("Bouton cliqué !");

    try {
      const response = await axios.get("http://localhost:4000/api/auth/generate-password");

      setSuggestedPassword(response.data.password);
      console.log("Mot de passe suggéré :", response.data.password);
    } catch (error) {
      if (error.response) {
        console.error("Erreur lors de la suggestion du mot de passe :", error.response.data);
        alert(error.response.data.message || "Erreur lors de la suggestion du mot de passe.");
      } else {
        console.error("Erreur inconnue :", error);
        alert("Erreur inconnue lors de la suggestion du mot de passe.");
      }
    }
  };

  const handleCopyPassword = () => {
    if (suggestedPassword) {
      navigator.clipboard.writeText(suggestedPassword)
        .then(() => {
          console.log("Mot de passe copié :", suggestedPassword);
          alert("Mot de passe copié !");
        })
        .catch(err => console.error("Erreur lors de la copie :", err));
    }
  };


  const useSuggestedPassword = () => {
    setFormData((prevData) => ({
      ...prevData,
      password: suggestedPassword,
    }));
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
                      <img alt="Logo" className="img-fluid" src="/images/logo/1.png" />
                    </span>
                  </div>
                  <div className="signup-bg-img">
                    <img alt="Background" className="img-fluid" src="/images/login/02.png" />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 form-contentbox">
                <div className="form-container">
                  <form className="app-form rounded-control" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-5 text-center text-lg-start">
                          <h2 className="text-primary-dark f-w-600">Create Account</h2>
                          <p>Get Started For Free Today!</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label" htmlFor="firstname">First Name</label>
                            <input
                              className="form-control"
                              id="firstname"
                              name="firstname"
                              placeholder="Enter Your First Name"
                              value={formData.firstname}
                              onChange={handleInputChange}
                              required
                              type="text"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label" htmlFor="lastname">Last Name</label>
                            <input
                              className="form-control"
                              id="lastname"
                              name="lastname"
                              placeholder="Enter Your Last Name"
                              value={formData.lastname}
                              onChange={handleInputChange}
                              required
                              type="text"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="email">Email</label>
                          <input
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="Enter Your Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            type="email"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="phone">Phone Number</label>
                          <input
                            className="form-control"
                            id="phone"
                            name="phone"
                            placeholder="Enter Your Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="password">Password</label>
                          <input
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Enter Your Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            type="password"
                          />
                        </div>
                      </div>

                      {/* Bouton de suggestion de mot de passe */}
                      <div className="col-6">
                        <button className="btn btn-primary w-100 mb-2" type="button" onClick={handleSuggestPassword}>
                          Suggest a Secure Password
                        </button>
                      </div>

                      {suggestedPassword && (
                        <div className="col-6">
                          <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                            <span className=" text-black">{suggestedPassword}</span>
                            <button className="btn btn-sm btn-primary" type="button" onClick={useSuggestedPassword}>
                              Use
                            </button>
                            <FaCopy className="cursor-pointer hover:text-gray-800 transition"
                              style={{ color: "#8c76f0", fontSize: "22px" }}
                              onClick={handleCopyPassword}
                            />

                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            id="terms"
                            type="checkbox"
                            checked={formData.terms}
                            onChange={handleTermsChange}
                            required
                          />
                          <label className="form-check-label text-secondary" htmlFor="terms">
                            Accept Terms & Conditions
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <button className="btn btnSignIn w-100" type="submit">Sign Up</button>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="text-center text-lg-start">
                          Already Have An Account? <Link className="link-primary-dark text-decoration-underline" to="/signin">Sign in</Link>
                        </div>
                      </div>
                      <div className="app-divider-v justify-content-center">
                        <p>Or sign up with</p>
                      </div>
                      <div className="col-12">
                        <div className="text-center">
                          <button className="btn btn-light-facebook icon-btn b-r-22 m-1" type="button" >
                            <i className="ti ti-brand-facebook"></i>
                          </button>
                          <button className="btn btn-light-gmail icon-btn b-r-22 m-1" type="button" onClick={googleLogin}>
                            <i className="ti ti-brand-google"></i>
                          </button>
                          <button className="btn btn-light-github icon-btn b-r-22 m-1" type="button">
                            <i className="ti ti-brand-github"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

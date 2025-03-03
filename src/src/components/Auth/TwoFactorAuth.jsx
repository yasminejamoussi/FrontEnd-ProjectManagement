import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TwoFactorAuth = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        if (!email) {
          throw new Error("Aucun email trouvé dans le stockage local !");
        }

        const response = await fetch("http://localhost:4000/api/auth/generate-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log("📌 Réponse API QR Code:", data);

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors de la récupération du QR Code");
        }

        setQrCode(data.qrCode);
      } catch (error) {
        console.error("❌ Erreur lors de la génération du QR Code :", error);
        setError(error.message);
      }
    };

    fetchQRCode();
  }, [email]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      if (!email) {
        throw new Error("Aucun email trouvé pour la vérification du 2FA !");
      }
  
      // ✅ Étape 1 : Activer le 2FA
      const enableResponse = await fetch("http://localhost:4000/api/auth/enable-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: verificationCode }),
      });
  
      const enableData = await enableResponse.json();
      console.log("📌 Réponse API Enable 2FA:", enableData);
  
      if (!enableResponse.ok) {
        throw new Error(enableData.message || "Échec de l'activation du 2FA");
      }
  
      // ✅ Étape 2 : Vérifier le 2FA et récupérer le token
      const verifyResponse = await fetch("http://localhost:4000/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: verificationCode }),
      });
  
      const verifyData = await verifyResponse.json();
      console.log("📌 Réponse API Vérification 2FA:", verifyData);
  
      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Vérification du code 2FA échouée");
      }
  
      alert("✅ 2FA vérifié avec succès !");
      
      if (verifyData.token) {
        console.log("✅ Token reçu du backend :", verifyData.token);
        localStorage.setItem("token", verifyData.token);
        navigate("/dash");
      } else {
        console.error("❌ Erreur : Le serveur a répondu, mais pas de token !");
      }
      
    } catch (error) {
      console.error("❌ Erreur lors de la vérification 2FA :", error);
      setError(error.message);
    }
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
                      <img alt="logo" className="img-fluid" src="/images/logo/1.png" />
                    </span>
                  </div>
                  <div className="signup-bg-img">
                    <img alt="2FA" className="img-fluid" src="/images/login/01.png" />
                  </div>
                </div>
              </div>

              <div className="col-lg-6 form-contentbox">
                <div className="form-container">
                  <form className="app-form rounded-control" onSubmit={handleVerifyCode}>
                    <div className="row">
                      <div className="col-12 text-center text-lg-start mb-5">
                        <h2 className="text-primary-dark f-w-600">Enter Your 2FA Code</h2>
                        <p>Scan the QR code with your Google Authenticator app.</p>
                      </div>

                      {error && <div className="alert alert-danger">{error}</div>}

                      <div className="col-12 mb-3">
                        <img src={qrCode} alt="QR Code" className="img-fluid" />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label" htmlFor="verificationCode">Verification Code</label>
                        <input
                          className="form-control"
                          id="verificationCode"
                          placeholder="Enter the code"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <button className="btn btn-light-primary w-100" type="submit">Verify Code</button>
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

export default TwoFactorAuth;

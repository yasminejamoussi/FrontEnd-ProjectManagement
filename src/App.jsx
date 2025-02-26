import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; 
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp.jsx";
import Header from "./components/Layout/Header.jsx";
import ApiPage from "./components/Pages/UserList.jsx";
import EmailSend from "./components/Pages/EmailSend.jsx";
import CodeVerification from "./components/Pages/CodeVerif.jsx";
import PasswordReset from "./components/Pages/PasswordReset.jsx";
import UpdateUser from "./components/Pages/UpdateUser.jsx";
import LandingPage from "./components/Pages/LandingPage.jsx";
import Profile from "./components/Pages/Profile.jsx";
import UserProfileForm from "./components/Pages/UserProfileForm.jsx";
import { useState } from "react";

// Wrapper pour Google OAuth
const GoogleWrapper = () => (
  <GoogleOAuthProvider clientId="153025115557-h7inq3asri2bcbk1pvpd26hafkikje3o.apps.googleusercontent.com">
    <SignUp />
  </GoogleOAuthProvider>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<GoogleWrapper />} />
        <Route path="/header" element={<Header />} />
        <Route path="/users" element={<ApiPage />} />
        <Route path="/updatee-user/:id" element={<UpdateUser />} />
        <Route path="/emailsend" element={<EmailSend/>} />
        <Route path="/codeverif" element={<CodeVerification/>} />
        <Route path="/pswdreset" element={<PasswordReset />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;

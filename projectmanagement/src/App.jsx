import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; 
import { HelmetProvider } from "react-helmet-async";  
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
import TwoFactorAuth from "./components/Auth/TwoFactorAuth.jsx";
import Sidebar from "./components/Layout/Sidebar.jsx";
import RoleManagement from "./components/Pages/RoleManagement.jsx";
import ProjectsDashboard from "./components/Pages/ProjectsDashboard.jsx";
import ProjectDetails from "./components/Pages/ProjectDetails.jsx";
import KanbanBoard from "./components/Pages/KanbanBoard.jsx";
import Dashboardd from "./components/Pages/Dashboard2.jsx";
import Report from "./components/Pages/Report.jsx";
import TeamPage from "./components/Pages/TeamPage.jsx";
import TasksPage from "./components/Pages/TasksPage.jsx";
import ActivityLogs from "./components/Pages/ActivityLogs.jsx";
import NotificationsPage from "./components/Pages/NotificationsPage.jsx";

const GoogleWrapper = () => (
  <GoogleOAuthProvider clientId="153025115557-h7inq3asri2bcbk1pvpd26hafkikje3o.apps.googleusercontent.com">
    <SignUp />
  </GoogleOAuthProvider>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<GoogleWrapper />} />
          <Route path="/header" element={<Header />} />
          <Route path="/users" element={<ApiPage />} />
          <Route path="/updatee-user/:id" element={<UpdateUser />} />
          <Route path="/emailsend" element={<EmailSend />} />
          <Route path="/codeverif" element={<CodeVerification />} />
          <Route path="/pswdreset" element={<PasswordReset />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify-2fa" element={<TwoFactorAuth />} />
          <Route path="/side" element={<Sidebar />} />
          <Route path="/roles" element={<RoleManagement />} />
          <Route path="/projects" element={<ProjectsDashboard />} />
          <Route path="/project-details/:id" element={<ProjectDetails />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/kanban/:projectId?" element={<KanbanBoard />} />
          <Route path="/dashboard" element={<Dashboardd/>} />
          <Route path="/report" element={<Report/>} />
          <Route path="/team" element={<TeamPage/>} />
          <Route path="/tasksusers" element={<TasksPage/>} />
          <Route path="/activitylogs" element={<ActivityLogs/>} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </Router>
    </HelmetProvider>  
  );
}

export default App;

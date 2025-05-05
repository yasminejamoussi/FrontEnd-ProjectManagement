import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../Layout/Header";
import Sidebar from "../Layout/Sidebar";
import "../../assets/css/Team.css";
import DefaultAvatar from "../../assets/images/avtar/user.jpg";
import TaskMasterBadge from "../../assets/images/badges/coordinateur.png";
import SprinterBadge from "../../assets/images/badges/sprinter.png";
import HeroBadge from "../../assets/images/badges/hero.png";
import StarBadge from "../../assets/images/badges/star.png";
import PillarBadge from "../../assets/images/badges/manager.png";

const TeamPage = () => {
    const [activeTab, setActiveTab] = useState("1");
    const [projects, setProjects] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [bestUser, setBestUser] = useState(null);
    const [bestProjectManager, setBestProjectManager] = useState(null);
    const [bestUsersPerProject, setBestUsersPerProject] = useState([]);
    const [weekStart, setWeekStart] = useState(null);
    const [weekEnd, setWeekEnd] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const badgeDescriptions = {
        "Task Master": "Assigned the highest number of tasks in this project.",
        Sprinter: "Completed the highest number of tasks in this project.",
        "Deadline Hero": "Completed all assigned tasks before or on their due dates.",
        "Star Collaborator": "Contributed to tasks assigned to multiple team members.",
        "Project Pillar": "Project Manager of the project.",
        "Best Weekly Performer": "Highest score for tasks completed this week.",
    };

    const badgeImages = {
        "Task Master": TaskMasterBadge,
        Sprinter: SprinterBadge,
        "Deadline Hero": HeroBadge,
        "Star Collaborator": StarBadge,
        "Project Pillar": PillarBadge,
        "Best Weekly Performer": StarBadge,
    };

    const skillColors = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-secondary", "bg-dark"];

    const getSkillColor = (index) => skillColors[index % skillColors.length];

    const getDateFromWeek = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = firstDayOfYear.getDay() === 0 ? -6 : 1 - firstDayOfYear.getDay();
        const firstMonday = new Date(year, 0, 1 + daysOffset);
        const diff = Math.floor((date - firstMonday) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diff / 7) + 1;
        const targetMonday = new Date(firstMonday);
        targetMonday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
        return targetMonday;
    };

    const getCurrentWeek = () => {
        const today = new Date();
        const year = today.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = firstDayOfYear.getDay() === 0 ? -6 : 1 - firstDayOfYear.getDay();
        const firstMonday = new Date(year, 0, 1 + daysOffset);
        const diff = Math.floor((today - firstMonday) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diff / 7) + 1;
        const formattedWeek = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
        return formattedWeek;
    };

    useEffect(() => {
        setSelectedWeek(new Date());
        setWeekStart(getCurrentWeek());
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role || decoded.role?.name || "User");
                setUserId(decoded.id || decoded._id);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (window.bootstrap && window.bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach((tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl));
        }
    }, [projects, bestUser, bestUsersPerProject, bestProjectManager]);

    const fetchBestPerformers = async (weekDate) => {
        const startDate = getDateFromWeek(weekDate);
        if (!startDate) {
            console.error("Invalid week date.");
            return;
        }

        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setUTCHours(23, 59, 59, 999);

        try {
            const perProjectResponse = await axios.get("http://localhost:4000/api/auth/users/best-weekly-per-project", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                params: { weekStart: startDate.toISOString(), userId, role: userRole },
            });
            setBestUsersPerProject(perProjectResponse.data.bestUsersPerProject);
            setWeekStart(perProjectResponse.data.weekStart);
            setWeekEnd(perProjectResponse.data.weekEnd);

            if (userRole === "Admin" || userRole === "Project Manager" || userRole === "Team Leader") {
                let bestUserData = null;
                if (userRole === "Admin") {
                    const globalResponse = await axios.get("http://localhost:4000/api/auth/users/best-weekly", {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        params: { weekStart: startDate.toISOString(), role: userRole },
                    });
                    bestUserData = globalResponse.data.bestUser;
                } else if (userRole === "Project Manager" || userRole === "Team Leader") {
                    const projectIds = projects
                        .filter(
                            (project) =>
                                project.projectManager?._id?.toString() === userId ||
                                project.teamMembers?.some((member) => member?._id?.toString() === userId)
                        )
                        .map((project) => project._id.toString());

                    const relevantBestUsers = perProjectResponse.data.bestUsersPerProject.filter((bp) =>
                        projectIds.includes(bp.projectId)
                    );

                    if (relevantBestUsers.length > 0) {
                        bestUserData = relevantBestUsers.reduce((best, current) => {
                            return (best.bestUser?.score || 0) > (current.bestUser?.score || 0) ? best : current;
                        }).bestUser;
                    }
                }

                if (bestUserData) {
                    bestUserData.badges = ["Best Weekly Performer", "Star Collaborator"];
                }
                setBestUser(bestUserData);
            } else {
                setBestUser(null);
            }
        } catch (error) {
            console.error("Error fetching best users:", error.response?.data || error.message);
            setErrorMessage("Failed to fetch best performers. Please try again later.");
        }
    };

    const fetchBestProjectManager = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/projects/best-project-manager", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setBestProjectManager(response.data.bestProjectManager);
            setErrorMessage(null); // Clear any previous errors
        } catch (error) {
            console.error("Detailed error fetching best project manager:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.response?.config?.url,
                config: error.response?.config
            });
            setErrorMessage("Failed to fetch best project manager. Please try again later.");
        }
    };

    useEffect(() => {
        if (userRole && userId && selectedWeek) {
            fetchBestPerformers(selectedWeek);
            if (userRole === "Admin") {
                fetchBestProjectManager();
            }
        }
    }, [userRole, userId, selectedWeek, projects]);

    const handleWeekSelect = async () => {
        if (!selectedWeek) {
            alert("Please select a week to continue.");
            return;
        }

        await fetchBestPerformers(selectedWeek);
        if (userRole === "Admin") {
            await fetchBestProjectManager();
        }
        setShowModal(false);
    };

    useEffect(() => {
        const fetchProjectsAndCounts = async () => {
            try {
                const projectResponse = await axios.get("http://localhost:4000/api/projects", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                let filteredProjects = projectResponse.data;
                if (userRole === "Admin") {
                    filteredProjects = projectResponse.data;
                } else if (userRole === "Project Manager" || userRole === "Team Leader") {
                    filteredProjects = projectResponse.data.filter(
                        (project) =>
                            project.projectManager?._id?.toString() === userId ||
                            project.teamMembers?.some((member) => member?._id?.toString() === userId)
                    );
                } else if (userRole === "Team Member") {
                    filteredProjects = projectResponse.data.filter((project) =>
                        project.teamMembers?.some((member) => member?._id?.toString() === userId)
                    );
                } else {
                    filteredProjects = projectResponse.data.filter(
                        (project) =>
                            project.projectManager?._id?.toString() === userId ||
                            project.teamMembers?.some((member) => member?._id?.toString() === userId)
                    );
                }

                const enrichedProjects = await Promise.all(
                    filteredProjects.map(async (project) => {
                        let enrichedManager = project.projectManager;
                        if (enrichedManager) {
                            const managerProjects = await axios.get("http://localhost:4000/api/projects", {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                params: { projectManager: enrichedManager._id, teamMembers: enrichedManager._id },
                            });
                            enrichedManager = { ...enrichedManager, managedProjects: managerProjects.data };
                        }

                        const enrichedTeamMembers = await Promise.all(
                            (project.teamMembers || []).map(async (member) => {
                                const memberProjectsCount = filteredProjects.filter(
                                    (p) =>
                                        p.projectManager?._id.toString() === member._id.toString() ||
                                        p.teamMembers?.some((m) => m._id.toString() === member._id.toString())
                                ).length;

                                const memberProjects = await axios.get("http://localhost:4000/api/projects", {
                                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                    params: { projectManager: member._id, teamMembers: member._id },
                                });

                                return { ...member, managedProjects: memberProjects.data, projectCount: memberProjectsCount };
                            })
                        );

                        return { ...project, projectManager: enrichedManager, teamMembers: enrichedTeamMembers };
                    })
                );

                setProjects(enrichedProjects);
            } catch (error) {
                console.error("Error fetching projects:", error.response?.data || error.message);
                setErrorMessage("Failed to fetch projects. Please try again later.");
            }
        };

        if (userRole && userId) {
            fetchProjectsAndCounts();
        }
    }, [userRole, userId]);

    const teamData = projects
        .filter((project) => project.projectManager && project.teamMembers)
        .map((project) => {
            const memberTaskCounts = {};
            const memberCompletedCounts = {};
            const memberCollabCounts = {};
            const memberDeadlineHeroEligible = {};
            const currentDate = new Date();

            (project.tasks || []).forEach((task) => {
                const assignedTo = task.assignedTo || [];
                if (Array.isArray(assignedTo) && assignedTo.length > 0) {
                    assignedTo.forEach((userId) => {
                        const id = userId.toString();
                        memberTaskCounts[id] = (memberTaskCounts[id] || 0) + 1;
                        if (["Done", "Tested"].includes(task.status)) {
                            memberCompletedCounts[id] = (memberCompletedCounts[id] || 0) + 1;
                        }
                        if (assignedTo.length > 1) {
                            memberCollabCounts[id] = (memberCollabCounts[id] || 0) + 1;
                        }
                        if (!memberDeadlineHeroEligible[id]) {
                            memberDeadlineHeroEligible[id] = true;
                        }
                        if (!["Done", "Tested"].includes(task.status)) {
                            memberDeadlineHeroEligible[id] = false;
                        } else if (task.dueDate) {
                            const dueDate = new Date(task.dueDate);
                            if (dueDate < currentDate) {
                                memberDeadlineHeroEligible[id] = false;
                            }
                        }
                    });
                }
            });

            const maxTasks = Math.max(...Object.values(memberTaskCounts), 0);
            const taskMasterIds = Object.keys(memberTaskCounts).filter(
                (id) => memberTaskCounts[id] === maxTasks && maxTasks > 0
            );

            const maxCompletedTasks = Math.max(...Object.values(memberCompletedCounts), 0);
            const sprinterIds = Object.keys(memberCompletedCounts).filter(
                (id) => memberCompletedCounts[id] === maxCompletedTasks && maxCompletedTasks > 0
            );

            const deadlineHeroIds = Object.keys(memberTaskCounts).filter(
                (id) => memberDeadlineHeroEligible[id] && memberTaskCounts[id] > 0
            );

            const maxCollabTasks = Math.max(...Object.values(memberCollabCounts), 0);
            const collabStarIds = Object.keys(memberCollabCounts).filter(
                (id) => memberCollabCounts[id] === maxCollabTasks && maxCollabTasks > 0
            );

            const projectPillarId = project.projectManager?._id.toString();

            const members = [
                project.projectManager && {
                    id: project.projectManager._id.toString(),
                    name: `${project.projectManager.firstname || ""} ${project.projectManager.lastname || ""}`,
                    role: "Project Manager",
                    skills: project.projectManager.skills || [],
                    projects: Array.isArray(project.projectManager.managedProjects)
                        ? project.projectManager.managedProjects.length
                        : 0,
                    tasks:
                        project.tasks?.filter((task) =>
                            task.assignedTo?.some((userId) => userId.toString() === project.projectManager._id.toString())
                        ).length || 0,
                    position: "Project Manager",
                    avatar: project.projectManager.profileImage || DefaultAvatar,
                    badges: [
                        taskMasterIds.includes(project.projectManager._id.toString()) ? "Task Master" : null,
                        sprinterIds.includes(project.projectManager._id.toString()) ? "Sprinter" : null,
                        deadlineHeroIds.includes(project.projectManager._id.toString()) ? "Deadline Hero" : null,
                        collabStarIds.includes(project.projectManager._id.toString()) ? "Star Collaborator" : null,
                        projectPillarId === project.projectManager._id.toString() ? "Project Pillar" : null,
                        bestUsersPerProject.some(
                            (bp) => bp.projectId === project._id.toString() && bp.bestUser?.userId === project.projectManager._id.toString()
                        ) ? "Best Weekly Performer" : null,
                        bestUser && bestUser.userId.toString() === project.projectManager._id.toString() ? "Star Collaborator" : null,
                    ].filter(Boolean),
                },
                ...(project.teamMembers || []).map((member) => ({
                    id: member._id.toString(),
                    name: `${member.firstname || ""} ${member.lastname || ""}`,
                    role: member.role?.name || "Unknown Role",
                    skills: member.skills || [],
                    projects:
                        member.projectCount || (Array.isArray(member.managedProjects) ? member.managedProjects.length : 0),
                    tasks:
                        project.tasks?.filter((task) =>
                            task.assignedTo?.some((userId) => userId.toString() === member._id.toString())
                        ).length || 0,
                    position: member.role?.name || "Unknown Role",
                    avatar: member.profileImage || DefaultAvatar,
                    badges: [
                        taskMasterIds.includes(member._id.toString()) ? "Task Master" : null,
                        sprinterIds.includes(member._id.toString()) ? "Sprinter" : null,
                        deadlineHeroIds.includes(member._id.toString()) ? "Deadline Hero" : null,
                        collabStarIds.includes(member._id.toString()) ? "Star Collaborator" : null,
                        bestUsersPerProject.some(
                            (bp) => bp.projectId === project._id.toString() && bp.bestUser?.userId === member._id.toString()
                        ) ? "Best Weekly Performer" : null,
                        bestUser && bestUser.userId.toString() === member._id.toString() ? "Star Collaborator" : null,
                    ].filter(Boolean),
                })),
            ].filter(Boolean);

            return { id: project._id, name: project.name || "Unnamed Project", members };
        });

    const handleTabClick = (tab) => setActiveTab(tab);

    return (
        <div className="app-wrapper">
            <Header />
            <Sidebar />
            <div className="app-content">
                <main>
                    <div className="container-fluid">
                        <div className="row m-1">
                            <div className="col-12">
                                <h4 className="main-title">Team</h4>
                                <ul className="app-line-breadcrumbs mb-3">
                                    <li>
                                        <a href="#" className="f-s-14 f-w-500">
                                            <span>
                                                <i className="ph-duotone ph-stack f-s-16"></i> Applications
                                            </span>
                                        </a>
                                    </li>
                                    <li className="active">
                                        <a href="#" className="f-s-14 f-w-500">
                                            Team
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-12">
                                <button
                                    className="btn btn-primary d-flex align-items-center"
                                    data-bs-toggle="modal"
                                    data-bs-target="#weekSelectionModal"
                                    onClick={() => setShowModal(true)}
                                >
                                    <i className="ph-duotone ph-calendar me-2"></i>
                                    Select Week to View Best Performers
                                </button>
                            </div>
                        </div>

                        <div
                            className="modal fade"
                            id="weekSelectionModal"
                            tabIndex="-1"
                            aria-labelledby="weekSelectionModalLabel"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="weekSelectionModalLabel">
                                            Select Week for Best Performers
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                            onClick={() => setShowModal(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Select Week:</label>
                                            <DatePicker
                                                selected={selectedWeek}
                                                onChange={(date) => setSelectedWeek(date)}
                                                dateFormat="YYYY-'W'ww"
                                                showWeekNumbers
                                                className="form-control"
                                                placeholderText="Select a week"
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleWeekSelect}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="alert alert-danger">
                                        {errorMessage}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(userRole === "Admin" || userRole === "Project Manager" || userRole === "Team Leader") && (
                            bestUser ? (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="best-user-card card shadow-sm">
                                            <div className="card-body d-flex align-items-center">
                                                <div className="best-user-image me-3 position-relative">
                                                    <img
                                                        src={bestUser.profileImage || DefaultAvatar}
                                                        alt={`${bestUser.firstname} ${bestUser.lastname}`}
                                                        className="img-fluid rounded-circle"
                                                        style={{ width: "80px", height: "80px" }}
                                                    />
                                                    <div className="badges position-absolute" style={{ bottom: "0", right: "0" }}>
                                                        {bestUser.badges.map((badge, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={badgeImages[badge]}
                                                                alt={badge}
                                                                className="best-performer-badge"
                                                                style={{ width: "30px", height: "30px", marginLeft: "-10px" }}
                                                                data-bs-toggle="tooltip"
                                                                data-bs-placement="top"
                                                                title={badgeDescriptions[badge]}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="card-title mb-1 d-flex align-items-center">
                                                        <i className="ph-duotone ph-trophy f-s-20 me-2 text-warning"></i>
                                                        Best Performer Across {userRole === "Admin" ? "All Projects" : "Your Projects"}
                                                    </h5>
                                                    <p className="mb-1">
                                                        <strong>
                                                            {bestUser.firstname} {bestUser.lastname}
                                                        </strong>{" "}
                                                        ({bestUser.role})
                                                    </p>
                                                    <p className="mb-1">Score: {bestUser.score.toFixed(2)}</p>
                                                    <p className="mb-1">Tasks Completed: {bestUser.taskCount}</p>
                                                    <p className="mb-1 d-flex align-items-center">
                                                        <i
                                                            className="ph-duotone ph-clock f-s-16 me-2 text-danger"
                                                            data-bs-toggle="tooltip"
                                                            data-bs-placement="top"
                                                            title="Number of tasks overdue, impacting the score by -2 per task"
                                                        ></i>
                                                        Overdue Tasks: {bestUser.overdueTasks || 0}
                                                    </p>
                                                    <p className="mb-1 d-flex align-items-center">
                                                        <i
                                                            className="ph-duotone ph-star f-s-16 me-2 text-success"
                                                            data-bs-toggle="tooltip"
                                                            data-bs-placement="top"
                                                            title="New tasks assigned this week, adding +1 to the score per task"
                                                        ></i>
                                                        New Tasks Assigned: {bestUser.newlyAssignedTasks || 0}
                                                    </p>
                                                    <p className="text-muted">
                                                        Week: {weekStart} to {weekEnd}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : weekStart ? (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="best-user-card card shadow-sm">
                                            <div className="card-body">
                                                <p className="text-muted">No best performer across {userRole === "Admin" ? "all projects" : "your projects"} for this week.</p>
                                                <p className="text-muted">
                                                    Week: {weekStart} to {weekEnd}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="best-user-card card shadow-sm">
                                            <div className="card-body">
                                                <p className="text-muted">Loading best performer across {userRole === "Admin" ? "all projects" : "your projects"}...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {userRole === "Admin" && (
                            bestProjectManager ? (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="best-user-card card shadow-sm">
                                            <div className="card-body d-flex align-items-center">
                                                <div className="best-user-image me-3 position-relative">
                                                    <img
                                                        src={bestProjectManager.profileImage || DefaultAvatar}
                                                        alt={`${bestProjectManager.firstname} ${bestProjectManager.lastname}`}
                                                        className="img-fluid rounded-circle"
                                                        style={{ width: "80px", height: "80px" }}
                                                    />
                                                    <div className="badges position-absolute" style={{ bottom: "0", right: "0" }}>
                                                        <img
                                                            src={PillarBadge}
                                                            alt="Project Pillar"
                                                            className="best-performer-badge"
                                                            style={{ width: "30px", height: "30px", marginLeft: "-10px" }}
                                                            data-bs-toggle="tooltip"
                                                            data-bs-placement="top"
                                                            title="Top Project Manager"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="card-title mb-1 d-flex align-items-center">
                                                        <i className="ph-duotone ph-crown f-s-20 me-2 text-warning"></i>
                                                        Best Project Manager Across All Projects
                                                    </h5>
                                                    <p className="mb-1">
                                                        <strong>
                                                            {bestProjectManager.firstname} {bestProjectManager.lastname}
                                                        </strong>{" "}
                                                        (Project Manager)
                                                    </p>
                                                    <p className="mb-1">Managed Projects: {bestProjectManager.managedProjectsCount}</p>
                                                    <p className="mb-1">Risk Rate: {bestProjectManager.atRiskPercentage}%</p>
                                                    <p className="mb-1">Completion Rate: {bestProjectManager.completionRate}%</p>
                                                    <p className="mb-1">Score: {bestProjectManager.score}</p>
                                                    <p className="text-muted">
                                                        Week: {weekStart} to {weekEnd}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : weekStart ? (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="best-user-card card shadow-sm">
                                            <div className="card-body">
                                                <p className="text-muted">No best project manager across all projects for this week.</p>
                                                <p className="text-muted">
                                                    Week: {weekStart} to {weekEnd}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="best-user-card card shadow-sm">
                                            <div className="card-body">
                                                <p className="text-muted">Loading best project manager across all projects...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        <div className="row">
                            <div className="col-12">
                                <div className="tab-wrapper">
                                    <ul className="tabs">
                                        {teamData.length > 0 ? (
                                            teamData.map((project, index) => (
                                                <li
                                                    key={project.id}
                                                    className={`tab-link ${activeTab === String(index + 1) ? "active" : ""}`}
                                                    onClick={() => handleTabClick(String(index + 1))}
                                                >
                                                    <i className="ph-duotone ph-projector-screen f-s-18 me-2"></i> {project.name}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="tab-link">No projects available</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="content-wrapper mt-3">
                                    {teamData.length > 0 ? (
                                        teamData.map((project, index) => {
                                            const bestUserForProject = bestUsersPerProject.find(
                                                (bp) => bp.projectId === project.id.toString()
                                            )?.bestUser;

                                            return (
                                                <div
                                                    key={project.id}
                                                    className={`tabs-content ${activeTab === String(index + 1) ? "active" : ""}`}
                                                    id={`tab-${index + 1}`}
                                                >
                                                    <div className="card">
                                                        <div className="card-body">
                                                            {bestUserForProject ? (
                                                                <div className="row mb-4">
                                                                    <div className="col-12">
                                                                        <div className="best-user-card card shadow-sm">
                                                                            <div className="card-body d-flex align-items-center">
                                                                                <div className="best-user-image me-3 position-relative">
                                                                                    <img
                                                                                        src={bestUserForProject.profileImage || DefaultAvatar}
                                                                                        alt={`${bestUserForProject.firstname} ${bestUserForProject.lastname}`}
                                                                                        className="img-fluid rounded-circle"
                                                                                        style={{ width: "80px", height: "80px" }}
                                                                                    />
                                                                                    <div className="badges position-absolute" style={{ bottom: "0", right: "0" }}>
                                                                                        {bestUserForProject.badges.map((badge, idx) => (
                                                                                            <img
                                                                                                key={idx}
                                                                                                src={badgeImages[badge]}
                                                                                                alt={badge}
                                                                                                className="best-performer-badge"
                                                                                                style={{ width: "30px", height: "30px", marginLeft: "-10px" }}
                                                                                                data-bs-toggle="tooltip"
                                                                                                data-bs-placement="top"
                                                                                                title={badgeDescriptions[badge]}
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <h5 className="card-title mb-1 d-flex align-items-center">
                                                                                        <i className="ph-duotone ph-trophy f-s-20 me-2 text-warning"></i>
                                                                                        Best Performer for {project.name}
                                                                                    </h5>
                                                                                    <p className="mb-1">
                                                                                        <strong>
                                                                                            {bestUserForProject.firstname} {bestUserForProject.lastname}
                                                                                        </strong>{" "}
                                                                                        ({bestUserForProject.role})
                                                                                    </p>
                                                                                    <p className="mb-1">Score: {bestUserForProject.score.toFixed(2)}</p>
                                                                                    <p className="mb-1">Tasks Completed: {bestUserForProject.taskCount}</p>
                                                                                    <p className="mb-1 d-flex align-items-center">
                                                                                        <i
                                                                                            className="ph-duotone ph-clock f-s-16 me-2 text-danger"
                                                                                            data-bs-toggle="tooltip"
                                                                                            data-bs-placement="top"
                                                                                            title="Number of tasks overdue, impacting the score by -2 per task"
                                                                                        ></i>
                                                                                        Overdue Tasks: {bestUserForProject.overdueTasks || 0}
                                                                                    </p>
                                                                                    <p className="mb-1 d-flex align-items-center">
                                                                                        <i
                                                                                            className="ph-duotone ph-star f-s-16 me-2 text-success"
                                                                                            data-bs-toggle="tooltip"
                                                                                            data-bs-placement="top"
                                                                                            title="New tasks assigned this week, adding +1 to the score per task"
                                                                                        ></i>
                                                                                        New Tasks Assigned: {bestUserForProject.newlyAssignedTasks || 0}
                                                                                    </p>
                                                                                    <p className="text-muted">
                                                                                        Week: {weekStart} to {weekEnd}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : weekStart ? (
                                                                <div className="row mb-4">
                                                                    <div className="col-12">
                                                                        <div className="best-user-card card shadow-sm">
                                                                            <div className="card-body">
                                                                                <p className="text-muted">No best performer for {project.name} this week.</p>
                                                                                <p className="text-muted">
                                                                                    Week: {weekStart} to {weekEnd}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="row mb-4">
                                                                    <div className="col-12">
                                                                        <div className="best-user-card card shadow-sm">
                                                                            <div className="card-body">
                                                                                <p className="text-muted">Loading best performer for {project.name}...</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="row">
                                                                {project.members.length > 0 ? (
                                                                    project.members.map((member) => (
                                                                        <div className="col-md-6 col-xl-4" key={member.id}>
                                                                            <div className="card team-box-card hover-effect">
                                                                                <div className="team-container">
                                                                                    <div className="team-pic">
                                                                                        <span className="h-80 w-80 d-flex-center b-r-50">
                                                                                            <img
                                                                                                src={member.avatar}
                                                                                                alt={member.name}
                                                                                                className="img-fluid b-r-50"
                                                                                            />
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="team-content">
                                                                                    <div className="mb-3 mt-3">
                                                                                        <h5>{member.name}</h5>
                                                                                        {member.badges.length > 0 ? (
                                                                                            <div className="badges">
                                                                                                {member.badges.map((badge, idx) => (
                                                                                                    <img
                                                                                                        key={idx}
                                                                                                        src={badgeImages[badge]}
                                                                                                        alt={badge}
                                                                                                        className={`badge-image ${
                                                                                                            badge === "Best Weekly Performer" ? "best-user-badge" : ""
                                                                                                        }`}
                                                                                                        data-bs-toggle="tooltip"
                                                                                                        data-bs-placement="top"
                                                                                                        title={badgeDescriptions[badge]}
                                                                                                    />
                                                                                                ))}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <p className="text-muted">No badges</p>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="team-details">
                                                                                        <div className="team-contentbox projects">
                                                                                            <p className="text-black-bold">Projects</p>
                                                                                            <p className="text-center">{member.projects}</p>
                                                                                        </div>
                                                                                        <div className="team-contentbox tasks">
                                                                                            <p className="text-black-bold">Tasks</p>
                                                                                            <p className="text-center">{member.tasks}</p>
                                                                                        </div>
                                                                                        <div className="team-contentbox role">
                                                                                            <p className="text-black-bold">Role</p>
                                                                                            <p className="text-center">{member.position}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="skills-section mt-3">
                                                                                        <p className="text-black-bold text-center mb-2">Skills</p>
                                                                                        <div className="d-flex flex-wrap justify-content-center gap-2">
                                                                                            {member.skills && member.skills.length > 0 ? (
                                                                                                member.skills.map((skill, idx) => (
                                                                                                    <span
                                                                                                        key={idx}
                                                                                                        className={`skill-badge ${getSkillColor(idx)} text-white px-3 py-1 rounded-pill`}
                                                                                                        data-bs-toggle="tooltip"
                                                                                                        data-bs-placement="top"
                                                                                                        title={`Expertise in ${skill}`}
                                                                                                    >
                                                                                                        {skill}
                                                                                                    </span>
                                                                                                ))
                                                                                            ) : (
                                                                                                <span className="skill-badge bg-secondary text-white px-3 py-1 rounded-pill">
                                                                                                    No skills
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-muted">No members assigned to this project.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="card">
                                            <div className="card-body">
                                                <p className="text-muted">No projects available for your role.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeamPage;
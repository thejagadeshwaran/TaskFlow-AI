import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // =========================
    // NOTIFICATION STATE
    // =========================

    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // =========================
    // PROJECT FORM
    // =========================

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        teamId: "",
        priority: "medium",
        startDate: "",
        deadline: "",
    });

    // =========================
    // FETCH PROJECTS
    // =========================

    const fetchProjects = async () => {
        try {
            setLoading(true);

            const response = await api.get("/projects");

            console.log(
                "PROJECT RESPONSE:",
                response.data
            );

            setProjects(
                response.data.projects || []
            );

        } catch (error) {
            console.error(
                "PROJECT FETCH ERROR:",
                error.response?.data ||
                error.message
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH TEAMS
    // =========================

    const fetchTeams = async () => {
        try {
            setTeamsLoading(true);

            const response = await api.get("/teams");

            console.log(
                "TEAM RESPONSE:",
                response.data
            );

            setTeams(
                response.data.teams || []
            );

        } catch (error) {
            console.error(
                "TEAM FETCH ERROR:",
                error.response?.data ||
                error.message
            );

        } finally {
            setTeamsLoading(false);
        }
    };

    // =========================
    // FETCH UNREAD NOTIFICATIONS
    // =========================

    const fetchUnreadNotifications = async () => {
        try {
            const response =
                await api.get("/notifications");

            console.log(
                "NOTIFICATION RESPONSE:",
                response.data
            );

            const unreadCount =
                response.data.unreadCount || 0;

            setUnreadNotifications(
                unreadCount
            );

        } catch (error) {
            console.error(
                "NOTIFICATION FETCH ERROR:",
                error.response?.data ||
                error.message
            );

            setUnreadNotifications(0);
        }
    };

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {

        fetchProjects();
        fetchTeams();
        fetchUnreadNotifications();

        const notificationInterval =
            setInterval(() => {

                fetchUnreadNotifications();

            }, 10000);

        return () => {
            clearInterval(
                notificationInterval
            );
        };

    }, []);

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================
    // CREATE PROJECT
    // =========================

    const handleCreateProject = async (e) => {

        e.preventDefault();

        if (!formData.teamId) {
            alert("Please select a team");
            return;
        }

        try {

            const projectData = {
                name: formData.name,
                description: formData.description,
                teamId: formData.teamId,
                priority: formData.priority,
                startDate: formData.startDate,
                deadline: formData.deadline,
            };

            console.log(
                "PROJECT DATA SENT:",
                projectData
            );

            const response =
                await api.post(
                    "/projects",
                    projectData
                );

            console.log(
                "PROJECT CREATED:",
                response.data
            );

            alert(
                "Project created successfully! 🎉"
            );

            setShowForm(false);

            setFormData({
                name: "",
                description: "",
                teamId: "",
                priority: "medium",
                startDate: "",
                deadline: "",
            });

            await fetchProjects();

        } catch (error) {

            console.error(
                "CREATE PROJECT ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to create project"
            );
        }
    };

    // =========================
    // NOTIFICATIONS
    // =========================

    const handleNotifications = () => {
        navigate("/notifications");
    };

    // =========================
    // ACTIVITY
    // =========================

    const handleActivity = (projectId) => {

        navigate(
            `/activity/${projectId}`
        );
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // =========================
    // STATISTICS
    // =========================

    const totalProjects =
        projects.length;

    const totalTasks =
        projects.reduce(
            (total, project) =>
                total +
                (project.tasks?.length || 0),
            0
        );

    // =========================
    // PAGE
    // =========================

    return (

        <div className="dashboard-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="dashboard-sidebar">

                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="logo-icon">
                        🚀
                    </div>

                    <div>
                        <h2>
                            TaskFlow AI
                        </h2>

                        <span>
                            Project Management
                        </span>
                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <button
                        className="sidebar-item active"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span>🏠</span>
                        Dashboard
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/teams")
                        }
                    >
                        <span>👥</span>
                        Teams
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/my-tasks")
                        }
                    >
                        <span>✅</span>
                        My Tasks
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/kanban")
                        }
                    >
                        <span>📌</span>
                        Kanban Board
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/analytics")
                        }
                    >
                        <span>📊</span>
                        Analytics
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={
                            handleNotifications
                        }
                    >
                        <span>🔔</span>

                        Notifications

                        {unreadNotifications > 0 && (
                            <span className="sidebar-notification-badge">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/ai-assistant")
                        }
                    >
                        <span>🤖</span>
                        AI Assistant
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <span>👤</span>
                        Profile
                    </button>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-item logout-item"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="dashboard-main">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Welcome to TaskFlow AI 👋
                        </p>

                    </div>


                    <div className="dashboard-header-actions">

                        {/* NOTIFICATION */}

                        <button
                            className="notification-button"
                            onClick={
                                handleNotifications
                            }
                            title="Notifications"
                        >

                            🔔

                            {unreadNotifications > 0 && (
                                <span className="notification-badge">
                                    {unreadNotifications}
                                </span>
                            )}

                        </button>


                        {/* CREATE PROJECT */}

                        <button
                            className="create-project-btn"
                            onClick={() =>
                                setShowForm(true)
                            }
                        >
                            + Create Project
                        </button>

                    </div>

                </div>


                {/* =========================
                    STATISTICS
                ========================= */}

                <div className="stats-container">

                    <div className="stat-card">

                        <h3>
                            Total Projects
                        </h3>

                        <p>
                            {totalProjects}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Total Tasks
                        </h3>

                        <p>
                            {totalTasks}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            In Progress
                        </h3>

                        <p>
                            0
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Completed
                        </h3>

                        <p>
                            0
                        </p>

                    </div>

                </div>


                {/* =========================
                    PROJECTS
                ========================= */}

                <div className="projects-section">

                    <div className="projects-header">

                        <h2>
                            My Projects
                        </h2>

                        <button
                            className="create-project-btn"
                            onClick={() =>
                                setShowForm(true)
                            }
                        >
                            + Create Project
                        </button>

                    </div>


                    {loading ? (

                        <p>
                            Loading projects...
                        </p>

                    ) : projects.length === 0 ? (

                        <div className="empty-projects">

                            <p>
                                No projects found.
                            </p>

                            <button
                                className="create-project-btn"
                                onClick={() =>
                                    setShowForm(true)
                                }
                            >
                                + Create Your First Project
                            </button>

                        </div>

                    ) : (

                        <div className="projects-grid">

                            {projects.map(
                                (project) => (

                                    <div
                                        className="project-card"
                                        key={project._id}
                                    >

                                        <h3>
                                            {project.name}
                                        </h3>

                                        <p>
                                            {
                                                project.description ||
                                                "No description"
                                            }
                                        </p>


                                        <div className="project-info">

                                            <span>
                                                Status:{" "}
                                                {
                                                    project.status ||
                                                    "planning"
                                                }
                                            </span>

                                            <span>
                                                Priority:{" "}
                                                {
                                                    project.priority ||
                                                    "medium"
                                                }
                                            </span>

                                        </div>


                                        {/* ACTIVITY */}

                                        <button
                                            className="activity-btn"
                                            onClick={() =>
                                                handleActivity(
                                                    project._id
                                                )
                                            }
                                        >
                                            📋 Activity
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    CREATE PROJECT MODAL
                ================================================= */}

                {showForm && (

                    <div className="modal-overlay">

                        <div className="project-modal">

                            {/* MODAL HEADER */}

                            <div className="modal-header">

                                <h2>
                                    Create New Project
                                </h2>

                                <button
                                    className="close-btn"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    ✕
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleCreateProject
                                }
                            >

                                {/* PROJECT NAME */}

                                <div className="form-group">

                                    <label>
                                        Project Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter project name"
                                        required
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter project description"
                                        rows="4"
                                    />

                                </div>


                                {/* TEAM */}

                                <div className="form-group">

                                    <label>
                                        Team *
                                    </label>

                                    <select
                                        name="teamId"
                                        value={
                                            formData.teamId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            {teamsLoading
                                                ? "Loading teams..."
                                                : "Select a team"}
                                        </option>


                                        {teams.map(
                                            (team) => (

                                                <option
                                                    key={
                                                        team._id
                                                    }
                                                    value={
                                                        team._id
                                                    }
                                                >
                                                    {team.name}
                                                </option>

                                            )
                                        )}

                                    </select>


                                    {!teamsLoading &&
                                        teams.length ===
                                        0 && (

                                            <small>
                                                No teams found.
                                                Create a team first.
                                            </small>

                                        )}

                                </div>


                                {/* DATES */}

                                <div className="form-row">

                                    <div className="form-group">

                                        <label>
                                            Start Date
                                        </label>

                                        <input
                                            type="date"
                                            name="startDate"
                                            value={
                                                formData.startDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Deadline
                                        </label>

                                        <input
                                            type="date"
                                            name="deadline"
                                            value={
                                                formData.deadline
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                </div>


                                {/* PRIORITY */}

                                <div className="form-group">

                                    <label>
                                        Priority
                                    </label>

                                    <select
                                        name="priority"
                                        value={
                                            formData.priority
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="low">
                                            Low
                                        </option>

                                        <option value="medium">
                                            Medium
                                        </option>

                                        <option value="high">
                                            High
                                        </option>

                                        <option value="critical">
                                            Critical
                                        </option>

                                    </select>

                                </div>


                                {/* BUTTONS */}

                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() =>
                                            setShowForm(false)
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={
                                            teamsLoading ||
                                            teams.length === 0
                                        }
                                    >
                                        Create Project
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default Dashboard;
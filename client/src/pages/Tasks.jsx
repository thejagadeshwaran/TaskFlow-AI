import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import "./Tasks.css";

const SOCKET_URL = "http://localhost:5000";

function Tasks() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");

    const [tasks, setTasks] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        dueDate: "",
        tags: ""
    });

    // ==========================================
    // GET PROJECTS
    // ==========================================

    const fetchProjects = async () => {
        try {
            const response =
                await api.get("/projects");

            const projectList =
                response.data.projects ||
                response.data.data ||
                [];

            setProjects(projectList);

            if (projectList.length > 0) {

                setProjectId(
                    projectList[0]._id
                );

                setFormData((previous) => ({
                    ...previous,
                    projectId:
                        projectList[0]._id
                }));
            }

        } catch (error) {

            console.error(
                "Failed to fetch projects:",
                error.response?.data ||
                error.message
            );
        }
    };

    // ==========================================
    // GET TASKS
    // ==========================================

    const fetchTasks = async () => {

        if (!projectId) {
            return;
        }

        try {

            const params =
                new URLSearchParams();

            if (search) {
                params.append(
                    "search",
                    search
                );
            }

            if (status) {
                params.append(
                    "status",
                    status
                );
            }

            if (priority) {
                params.append(
                    "priority",
                    priority
                );
            }

            params.append(
                "page",
                page
            );

            params.append(
                "limit",
                10
            );

            const response =
                await api.get(
                    `/tasks/project/${projectId}?${params.toString()}`
                );

            setTasks(
                response.data.tasks || []
            );

            setPagination(
                response.data.pagination || {}
            );

        } catch (error) {

            console.error(
                "Failed to fetch tasks:",
                error.response?.data ||
                error.message
            );
        }
    };

    // ==========================================
    // SOCKET.IO REAL-TIME TASKS
    // ==========================================

    useEffect(() => {

        if (!projectId) {
            return;
        }

        console.log(
            "🔌 Connecting to Socket.IO for project:",
            projectId
        );

        const socket =
            io(SOCKET_URL, {
                transports: ["websocket"]
            });

        // ======================================
        // SOCKET CONNECTED
        // ======================================

        socket.on("connect", () => {

            console.log(
                "🔌 Socket connected:",
                socket.id
            );

            // Join project room
            socket.emit(
                "join_project",
                projectId
            );

            console.log(
                `📁 Joined project room: project_${projectId}`
            );
        });

        // ======================================
        // TASK CREATED
        // ======================================

        socket.on(
            "task_created",
            (newTask) => {

                console.log(
                    "🆕 REAL-TIME TASK CREATED:",
                    newTask
                );

                if (
                    newTask?.project?._id &&
                    newTask.project._id !==
                        projectId
                ) {
                    return;
                }

                // If the task belongs to the
                // current project, refresh.
                fetchTasks();
            }
        );

        // ======================================
        // TASK UPDATED
        // ======================================

        socket.on(
            "task_updated",
            (updatedTask) => {

                console.log(
                    "🔄 REAL-TIME TASK UPDATED:",
                    updatedTask
                );

                if (
                    updatedTask?.project?._id &&
                    updatedTask.project._id !==
                        projectId
                ) {
                    return;
                }

                fetchTasks();
            }
        );

        // ======================================
        // TASK DELETED
        // ======================================

        socket.on(
            "task_deleted",
            (deletedTask) => {

                console.log(
                    "🗑️ REAL-TIME TASK DELETED:",
                    deletedTask
                );

                if (
                    deletedTask?.projectId &&
                    deletedTask.projectId !==
                        projectId
                ) {
                    return;
                }

                fetchTasks();
            }
        );

        // ======================================
        // SOCKET ERROR
        // ======================================

        socket.on(
            "connect_error",
            (error) => {

                console.error(
                    "❌ Task Socket connection error:",
                    error.message
                );
            }
        );

        // ======================================
        // DISCONNECT
        // ======================================

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    "🔌 Task Socket disconnected:",
                    reason
                );
            }
        );

        // ======================================
        // CLEANUP
        // ======================================

        return () => {

            console.log(
                `📤 Leaving project room: project_${projectId}`
            );

            socket.emit(
                "leave_project",
                projectId
            );

            socket.disconnect();
        };

    }, [projectId]);

    // ==========================================
    // CREATE TASK
    // ==========================================

    const handleCreateTask = async (e) => {

        e.preventDefault();

        if (!formData.title.trim()) {
            alert(
                "Task title is required"
            );

            return;
        }

        if (!formData.projectId) {
            alert(
                "Please select a project"
            );

            return;
        }

        try {

            setCreating(true);

            const taskData = {
                title:
                    formData.title,

                description:
                    formData.description,

                projectId:
                    formData.projectId,

                priority:
                    formData.priority,

                dueDate:
                    formData.dueDate ||
                    undefined,

                tags:
                    formData.tags
                        ? formData.tags
                              .split(",")
                              .map(
                                  (tag) =>
                                      tag.trim()
                              )
                              .filter(Boolean)
                        : []
            };

            const response =
                await api.post(
                    "/tasks",
                    taskData
                );

            console.log(
                "TASK CREATED:",
                response.data
            );

            alert(
                "Task created successfully!"
            );

            setShowForm(false);

            setFormData({
                title: "",
                description: "",
                projectId:
                    projectId,
                priority: "medium",
                dueDate: "",
                tags: ""
            });

            setPage(1);

            await fetchTasks();

        } catch (error) {

            console.error(
                "Create task error:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to create task"
            );

        } finally {

            setCreating(false);
        }
    };

    // ==========================================
    // LOAD PROJECTS
    // ==========================================

    useEffect(() => {
        fetchProjects();
    }, []);

    // ==========================================
    // LOAD TASKS
    // ==========================================

    useEffect(() => {

        if (projectId) {
            fetchTasks();
        }

    }, [
        projectId,
        search,
        status,
        priority,
        page
    ]);

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="tasks-page">

            {/* HEADER */}

            <div className="tasks-header">

                <div>

                    <h1>
                        Tasks
                    </h1>

                    <p>
                        Manage tasks for your projects
                    </p>

                </div>

                <button
                    className="create-task-btn"
                    onClick={() => {

                        setFormData(
                            (previous) => ({
                                ...previous,
                                projectId:
                                    projectId
                            })
                        );

                        setShowForm(true);
                    }}
                    disabled={
                        !projects.length
                    }
                >
                    + Create Task
                </button>

            </div>

            {/* PROJECT SELECTOR */}

            <div className="project-selector">

                <label>
                    Project
                </label>

                <select
                    value={projectId}
                    onChange={(e) => {

                        const selectedProject =
                            e.target.value;

                        setProjectId(
                            selectedProject
                        );

                        setFormData(
                            (previous) => ({
                                ...previous,
                                projectId:
                                    selectedProject
                            })
                        );

                        setPage(1);
                    }}
                >

                    <option value="">
                        Select Project
                    </option>

                    {projects.map(
                        (project) => (

                            <option
                                key={
                                    project._id
                                }
                                value={
                                    project._id
                                }
                            >
                                {project.name}
                            </option>
                        )
                    )}

                </select>

            </div>

            {/* FILTERS */}

            <div className="filters">

                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => {

                        setSearch(
                            e.target.value
                        );

                        setPage(1);
                    }}
                />

                <select
                    value={status}
                    onChange={(e) => {

                        setStatus(
                            e.target.value
                        );

                        setPage(1);
                    }}
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="todo">
                        Todo
                    </option>

                    <option value="in_progress">
                        In Progress
                    </option>

                    <option value="review">
                        Review
                    </option>

                    <option value="completed">
                        Completed
                    </option>

                </select>

                <select
                    value={priority}
                    onChange={(e) => {

                        setPriority(
                            e.target.value
                        );

                        setPage(1);
                    }}
                >

                    <option value="">
                        All Priority
                    </option>

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

            {/* TASK LIST */}

            <div className="task-list">

                {!projectId ? (

                    <p>
                        Please select a project.
                    </p>

                ) : tasks.length === 0 ? (

                    <p>
                        No tasks found.
                    </p>

                ) : (

                    tasks.map(
                        (task) => (

                            <div
                                key={
                                    task._id
                                }
                                className="task-card"
                            >

                                <h3>
                                    {task.title}
                                </h3>

                                <p>
                                    {task.description}
                                </p>

                                <p>
                                    Status:{" "}
                                    {task.status}
                                </p>

                                <p>
                                    Priority:{" "}
                                    {task.priority}
                                </p>

                                {task.dueDate && (
                                    <p>
                                        Due:{" "}
                                        {new Date(
                                            task.dueDate
                                        ).toLocaleDateString()}
                                    </p>
                                )}

                            </div>
                        )
                    )
                )}

            </div>

            {/* PAGINATION */}

            <div className="pagination">

                <button
                    disabled={
                        !pagination.hasPreviousPage
                    }
                    onClick={() =>
                        setPage(
                            page - 1
                        )
                    }
                >
                    ← Previous
                </button>

                <span>
                    Page{" "}
                    {
                        pagination.currentPage ||
                        page
                    }
                    {" "}of{" "}
                    {
                        pagination.totalPages ||
                        1
                    }
                </span>

                <button
                    disabled={
                        !pagination.hasNextPage
                    }
                    onClick={() =>
                        setPage(
                            page + 1
                        )
                    }
                >
                    Next →
                </button>

            </div>

            {/* CREATE TASK MODAL */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="task-modal">

                        <div className="modal-header">

                            <h2>
                                Create Task
                            </h2>

                            <button
                                className="close-btn"
                                onClick={() =>
                                    setShowForm(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleCreateTask
                            }
                        >

                            {/* TITLE */}

                            <div className="form-group">

                                <label>
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    value={
                                        formData.title
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title:
                                                e.target.value
                                        })
                                    }
                                    placeholder="Enter task title"
                                    required
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={
                                        formData.description
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description:
                                                e.target.value
                                        })
                                    }
                                    placeholder="Enter task description"
                                />

                            </div>

                            {/* PROJECT */}

                            <div className="form-group">

                                <label>
                                    Project
                                </label>

                                <select
                                    value={
                                        formData.projectId
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            projectId:
                                                e.target.value
                                        })
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Project
                                    </option>

                                    {projects.map(
                                        (project) => (

                                            <option
                                                key={
                                                    project._id
                                                }
                                                value={
                                                    project._id
                                                }
                                            >
                                                {
                                                    project.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* PRIORITY */}

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    value={
                                        formData.priority
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            priority:
                                                e.target.value
                                        })
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

                            {/* DUE DATE */}

                            <div className="form-group">

                                <label>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        formData.dueDate
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dueDate:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>

                            {/* TAGS */}

                            <div className="form-group">

                                <label>
                                    Tags
                                </label>

                                <input
                                    type="text"
                                    value={
                                        formData.tags
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tags:
                                                e.target.value
                                        })
                                    }
                                    placeholder="React, Frontend, Learning"
                                />

                                <small>
                                    Separate tags with commas
                                </small>

                            </div>

                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowForm(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Tasks;
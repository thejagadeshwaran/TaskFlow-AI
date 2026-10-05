import { useEffect, useState } from "react";

import api from "../services/api";

import socket, {
    connectSocket
} from "../services/socket";

import "./KanbanBoard.css";


function KanbanBoard() {

    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);


    // =========================
    // GET PROJECTS
    // =========================

    const fetchProjects = async () => {

        try {

            const response = await api.get("/projects");

            const projectList =
                response.data.projects ||
                response.data.data ||
                [];

            setProjects(projectList);

            if (projectList.length > 0) {
                setProjectId(projectList[0]._id);
            }

        } catch (error) {

            console.error(
                "Failed to fetch projects:",
                error.response?.data ||
                error.message
            );

            setLoading(false);
        }
    };


    // =========================
    // GET TASKS
    // =========================

    const fetchTasks = async () => {

        if (!projectId) {
            return;
        }

        try {

            setLoading(true);

            const response = await api.get(
                `/tasks/project/${projectId}`
            );

            setTasks(
                response.data.tasks || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch tasks:",
                error.response?.data ||
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================
    // LOAD PROJECTS
    // =========================

    useEffect(() => {

        fetchProjects();

    }, []);


    // =========================
    // LOAD TASKS
    // =========================

    useEffect(() => {

        if (projectId) {
            fetchTasks();
        }

    }, [projectId]);


    // =========================
    // SOCKET REAL-TIME UPDATES
    // =========================

    useEffect(() => {

        if (!projectId) {
            return;
        }


        // Connect Socket.IO
        connectSocket();


        // Join project room
        socket.emit(
            "join_project",
            projectId
        );


        // =========================
        // TASK UPDATED
        // =========================

        const handleTaskUpdated = (
            updatedTask
        ) => {

            console.log(
                "🔄 Real-time task updated:",
                updatedTask
            );

            setTasks((previousTasks) =>
                previousTasks.map(
                    (task) =>
                        task._id === updatedTask._id
                            ? updatedTask
                            : task
                )
            );

        };


        // =========================
        // TASK CREATED
        // =========================

        const handleTaskCreated = (
            newTask
        ) => {

            console.log(
                "🆕 Real-time task created:",
                newTask
            );


            const newTaskProjectId =
                typeof newTask.project === "object"
                    ? newTask.project?._id
                    : newTask.project;


            if (
                newTaskProjectId === projectId
            ) {

                setTasks((previousTasks) => {

                    // Prevent duplicate task
                    const alreadyExists =
                        previousTasks.some(
                            (task) =>
                                task._id ===
                                newTask._id
                        );

                    if (alreadyExists) {
                        return previousTasks;
                    }

                    return [
                        ...previousTasks,
                        newTask
                    ];

                });

            }

        };


        // =========================
        // TASK DELETED
        // =========================

        const handleTaskDeleted = (
            deletedTask
        ) => {

            console.log(
                "🗑️ Real-time task deleted:",
                deletedTask
            );


            setTasks((previousTasks) =>
                previousTasks.filter(
                    (task) =>
                        task._id !==
                        deletedTask.taskId
                )
            );

        };


        // =========================
        // SOCKET EVENTS
        // =========================

        socket.on(
            "task_updated",
            handleTaskUpdated
        );

        socket.on(
            "task_created",
            handleTaskCreated
        );

        socket.on(
            "task_deleted",
            handleTaskDeleted
        );


        // =========================
        // CLEANUP
        // =========================

        return () => {

            socket.off(
                "task_updated",
                handleTaskUpdated
            );

            socket.off(
                "task_created",
                handleTaskCreated
            );

            socket.off(
                "task_deleted",
                handleTaskDeleted
            );


            socket.emit(
                "leave_project",
                projectId
            );

        };

    }, [projectId]);


    // =========================
    // UPDATE TASK STATUS
    // =========================

    const updateTaskStatus = async (
        taskId,
        newStatus
    ) => {

        try {

            await api.put(
                `/tasks/${taskId}`,
                {
                    status: newStatus
                }
            );

            // Refresh tasks
            await fetchTasks();

        } catch (error) {

            console.error(
                "Failed to update task:",
                error.response?.data ||
                error.message
            );

        }

    };


    // =========================
    // KANBAN COLUMNS
    // =========================

    const columns = [

        {
            id: "todo",
            title: "Todo"
        },

        {
            id: "in_progress",
            title: "In Progress"
        },

        {
            id: "review",
            title: "Review"
        },

        {
            id: "completed",
            title: "Completed"
        }

    ];


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="kanban-page">

                <h1>
                    Kanban Board
                </h1>

                <p>
                    Loading tasks...
                </p>

            </div>

        );

    }


    // =========================
    // UI
    // =========================

    return (

        <div className="kanban-page">


            {/* HEADER */}

            <div className="kanban-header">

                <div>

                    <h1>
                        Kanban Board
                    </h1>

                    <p>
                        Manage your tasks by status
                    </p>

                </div>

            </div>


            {/* PROJECT SELECTOR */}

            <div className="kanban-project-selector">

                <label>
                    Project
                </label>

                <select
                    value={projectId}
                    onChange={(e) =>
                        setProjectId(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        Select Project
                    </option>


                    {projects.map(
                        (project) => (

                            <option
                                key={project._id}
                                value={project._id}
                            >
                                {project.name}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* KANBAN BOARD */}

            <div className="kanban-board">


                {columns.map(
                    (column) => {

                        const columnTasks =
                            tasks.filter(
                                (task) =>
                                    task.status ===
                                    column.id
                            );


                        return (

                            <div
                                key={column.id}
                                className="kanban-column"
                            >


                                {/* COLUMN HEADER */}

                                <div className="column-header">

                                    <h2>
                                        {column.title}
                                    </h2>

                                    <span>
                                        {
                                            columnTasks.length
                                        }
                                    </span>

                                </div>


                                {/* TASKS */}

                                <div className="kanban-task-list">


                                    {columnTasks.map(
                                        (task) => (

                                            <div
                                                key={
                                                    task._id
                                                }
                                                className="kanban-task-card"
                                            >


                                                <h3>
                                                    {
                                                        task.title
                                                    }
                                                </h3>


                                                {task.description && (

                                                    <p>
                                                        {
                                                            task.description
                                                        }
                                                    </p>

                                                )}


                                                <div className="task-priority">

                                                    Priority:{" "}

                                                    <strong>
                                                        {
                                                            task.priority
                                                        }
                                                    </strong>

                                                </div>


                                                {task.dueDate && (

                                                    <div className="task-due-date">

                                                        Due:{" "}

                                                        {new Date(
                                                            task.dueDate
                                                        ).toLocaleDateString()}

                                                    </div>

                                                )}


                                                {/* ACTIONS */}

                                                <div className="task-actions">


                                                    {task.status !==
                                                        "todo" && (

                                                        <button
                                                            onClick={() =>
                                                                updateTaskStatus(
                                                                    task._id,
                                                                    "todo"
                                                                )
                                                            }
                                                        >
                                                            Todo
                                                        </button>

                                                    )}


                                                    {task.status !==
                                                        "in_progress" && (

                                                        <button
                                                            onClick={() =>
                                                                updateTaskStatus(
                                                                    task._id,
                                                                    "in_progress"
                                                                )
                                                            }
                                                        >
                                                            Start
                                                        </button>

                                                    )}


                                                    {task.status !==
                                                        "review" && (

                                                        <button
                                                            onClick={() =>
                                                                updateTaskStatus(
                                                                    task._id,
                                                                    "review"
                                                                )
                                                            }
                                                        >
                                                            Review
                                                        </button>

                                                    )}


                                                    {task.status !==
                                                        "completed" && (

                                                        <button
                                                            onClick={() =>
                                                                updateTaskStatus(
                                                                    task._id,
                                                                    "completed"
                                                                )
                                                            }
                                                        >
                                                            Complete
                                                        </button>

                                                    )}

                                                </div>


                                            </div>

                                        )
                                    )}


                                    {columnTasks.length ===
                                        0 && (

                                        <div className="empty-column">

                                            No tasks

                                        </div>

                                    )}

                                </div>

                            </div>

                        );

                    }
                )}

            </div>

        </div>

    );

}


export default KanbanBoard;
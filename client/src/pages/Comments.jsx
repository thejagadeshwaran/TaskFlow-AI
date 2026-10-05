import { useEffect, useState } from "react";

import api from "../services/api";

import socket, {
    connectSocket
} from "../services/socket";

import "./Comments.css";


function Comments() {

    // Your working Task ID
    const taskId = "6abb75fa476871de14e681b4";


    const [comments, setComments] = useState([]);

    const [content, setContent] = useState("");

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");


    // =========================
    // GET COMMENTS
    // =========================

    const fetchComments = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                `/comments/task/${taskId}`
            );


            setComments(
                response.data.comments || []
            );


        } catch (error) {

            console.error(
                "Failed to fetch comments:",
                error.response?.data ||
                error.message
            );


            setError(
                error.response?.data?.message ||
                "Failed to load comments"
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================
    // LOAD COMMENTS
    // =========================

    useEffect(() => {

        fetchComments();

    }, []);


    // =========================
    // SOCKET REAL-TIME COMMENTS
    // =========================

    useEffect(() => {

        // Connect Socket.IO
        connectSocket();


        console.log(
            "🔌 Connecting to comment Socket.IO..."
        );


        // =========================
        // JOIN PROJECT ROOM
        // =========================
        //
        // IMPORTANT:
        // Comments are connected to a TASK.
        // We need the task's PROJECT ID.
        //
        // The current Comments page only has
        // taskId, so first get the task.
        //

        const joinProjectRoom = async () => {

            try {

                const response = await api.get(
                    `/tasks/${taskId}`
                );


                const task =
                    response.data.task ||
                    response.data;


                const projectId =
                    typeof task.project === "object"
                        ? task.project?._id
                        : task.project;


                if (!projectId) {

                    console.error(
                        "❌ Project ID not found for task"
                    );

                    return;

                }


                console.log(
                    "📁 Joining project room:",
                    projectId
                );


                socket.emit(
                    "join_project",
                    projectId
                );


                // Save project ID for cleanup
                socket.__commentsProjectId =
                    projectId;


            } catch (error) {

                console.error(
                    "❌ Failed to get task project:",
                    error.response?.data ||
                    error.message
                );

            }

        };


        joinProjectRoom();


        // =========================
        // NEW COMMENT
        // =========================

        const handleCommentCreated = (
            newComment
        ) => {

            console.log(
                "💬 Real-time comment received:",
                newComment
            );


            // Make sure this comment belongs
            // to the current task

            const newCommentTaskId =
                typeof newComment.task === "object"
                    ? newComment.task?._id
                    : newComment.task;


            if (
                newCommentTaskId !== taskId
            ) {

                return;

            }


            setComments((previousComments) => {

                // Prevent duplicate comments
                const alreadyExists =
                    previousComments.some(
                        (comment) =>
                            comment._id ===
                            newComment._id
                    );


                if (alreadyExists) {

                    return previousComments;

                }


                return [
                    ...previousComments,
                    newComment
                ];

            });

        };


        // =========================
        // SOCKET LISTENER
        // =========================

        socket.on(
            "comment_created",
            handleCommentCreated
        );


        // =========================
        // CLEANUP
        // =========================

        return () => {

            socket.off(
                "comment_created",
                handleCommentCreated
            );


            const projectId =
                socket.__commentsProjectId;


            if (projectId) {

                socket.emit(
                    "leave_project",
                    projectId
                );

            }

        };

    }, []);


    // =========================
    // ADD COMMENT
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!content.trim()) {

            return;

        }


        try {

            setSubmitting(true);

            setError("");


            const response = await api.post(
                `/comments/task/${taskId}`,
                {
                    content: content.trim()
                }
            );


            const createdComment =
                response.data.comment;


            // Add immediately for current user
            setComments((previousComments) => {

                const alreadyExists =
                    previousComments.some(
                        (comment) =>
                            comment._id ===
                            createdComment._id
                    );


                if (alreadyExists) {

                    return previousComments;

                }


                return [
                    ...previousComments,
                    createdComment
                ];

            });


            setContent("");


        } catch (error) {

            console.error(
                "Failed to add comment:",
                error.response?.data ||
                error.message
            );


            setError(
                error.response?.data?.message ||
                "Failed to add comment"
            );


        } finally {

            setSubmitting(false);

        }

    };


    // =========================
    // UI
    // =========================

    return (

        <div className="comments-page">

            <div className="comments-container">


                {/* HEADER */}

                <div className="comments-header">

                    <h1>
                        Comments
                    </h1>

                    <p>
                        Discuss this task with your team
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="comment-error">

                        {error}

                    </div>

                )}


                {/* ADD COMMENT */}

                <form
                    className="comment-form"
                    onSubmit={handleSubmit}
                >

                    <textarea
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) =>
                            setContent(e.target.value)
                        }
                        rows="4"
                    />


                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !content.trim()
                        }
                    >

                        {submitting
                            ? "Adding..."
                            : "Add Comment"}

                    </button>

                </form>


                {/* COMMENTS */}

                <div className="comments-list">

                    <h2>

                        Comments ({comments.length})

                    </h2>


                    {loading ? (

                        <p className="comments-message">

                            Loading comments...

                        </p>

                    ) : comments.length === 0 ? (

                        <p className="comments-message">

                            No comments yet.

                        </p>

                    ) : (

                        comments.map(
                            (comment) => (

                                <div
                                    key={comment._id}
                                    className="comment-card"
                                >


                                    {/* AVATAR */}

                                    <div className="comment-avatar">

                                        {comment.user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "U"}

                                    </div>


                                    {/* CONTENT */}

                                    <div className="comment-content">


                                        <div className="comment-top">

                                            <strong>

                                                {comment.user?.name ||
                                                    "Unknown User"}

                                            </strong>


                                            <span>

                                                {comment.createdAt
                                                    ? new Date(
                                                        comment.createdAt
                                                    ).toLocaleString()
                                                    : ""}

                                            </span>

                                        </div>


                                        <p>

                                            {comment.content}

                                        </p>


                                    </div>


                                </div>

                            )
                        )

                    )}

                </div>


            </div>

        </div>

    );

}


export default Comments;
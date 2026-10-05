let io = null;


// =========================
// SET SOCKET.IO
// =========================

const setIO = (socketIO) => {

    io = socketIO;

};


// =========================
// GET SOCKET.IO
// =========================

const getIO = () => {

    return io;

};


// =========================
// EMIT TO PROJECT
// =========================

const emitToProject = (
    projectId,
    event,
    data
) => {

    if (!io) {

        console.log(
            "⚠️ Socket.IO is not initialized"
        );

        return;

    }


    if (!projectId) {

        console.log(
            "⚠️ Project ID is missing"
        );

        return;

    }


    const room =
        `project_${projectId}`;


    io.to(room).emit(
        event,
        data
    );


    console.log(
        `📡 Socket event sent: ${event} → ${room}`
    );

};


// =========================
// EXPORTS
// =========================

module.exports = {

    setIO,

    getIO,

    emitToProject

};
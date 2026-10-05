const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store user information in request
        req.user = decoded;

        next();

    } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
    });
}
};

module.exports = {
    protect
};
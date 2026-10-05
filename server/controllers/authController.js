const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {

    try {

        console.log("=================================");
        console.log("📝 REGISTER API CALLED");
        console.log("=================================");

        const {
            name,
            email,
            password
        } = req.body;


        console.log("Register email:", email);


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required"

            });

        }


        // ==========================================
        // CHECK PASSWORD LENGTH
        // ==========================================

        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters"

            });

        }


        // ==========================================
        // CHECK EXISTING USER
        // ==========================================

        console.log(
            "🔎 Checking existing user..."
        );

        const existingUser =
            await User.findOne({
                email: email.trim().toLowerCase()
            });


        console.log(
            "Existing user:",
            !!existingUser
        );


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "User already exists"

            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        console.log(
            "🔐 Hashing password..."
        );

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==========================================
        // CREATE USER
        // ==========================================

        console.log(
            "👤 Creating user..."
        );

        const user =
            await User.create({

                name: name.trim(),

                email:
                    email.trim().toLowerCase(),

                password:
                    hashedPassword

            });


        console.log(
            "✅ USER CREATED:",
            user._id.toString()
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "User registered successfully",

            user: {

                _id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "❌ Registration error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {

    try {

        console.log("");
        console.log("=================================");
        console.log("🔐 LOGIN API CALLED");
        console.log("=================================");


        // ==========================================
        // REQUEST BODY
        // ==========================================

        console.log(
            "Request body received:",
            {
                email: req.body?.email,
                passwordReceived:
                    !!req.body?.password
            }
        );


        const {
            email,
            password
        } = req.body;


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (
            !email ||
            !password
        ) {

            console.log(
                "❌ Email or password missing"
            );

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // ==========================================
        // NORMALIZE EMAIL
        // ==========================================

        const normalizedEmail =
            email.trim().toLowerCase();


        console.log(
            "📧 Searching user:",
            normalizedEmail
        );


        // ==========================================
        // FIND USER
        // ==========================================

        console.log(
            "🔎 Running User.findOne..."
        );

        const user =
            await User.findOne({

                email:
                    normalizedEmail

            });


        console.log(
            "👤 User search completed:",
            !!user
        );


        // ==========================================
        // USER NOT FOUND
        // ==========================================

        if (!user) {

            console.log(
                "❌ USER NOT FOUND"
            );

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        console.log(
            "User ID:",
            user._id.toString()
        );

        console.log(
            "User name:",
            user.name
        );

        console.log(
            "User role:",
            user.role
        );

        console.log(
            "Password hash exists:",
            !!user.password
        );


        // ==========================================
        // COMPARE PASSWORD
        // ==========================================

        console.log(
            "🔐 Comparing password..."
        );

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );


        console.log(
            "🔑 Password valid:",
            isPasswordValid
        );


        // ==========================================
        // INVALID PASSWORD
        // ==========================================

        if (!isPasswordValid) {

            console.log(
                "❌ INVALID PASSWORD"
            );

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // ==========================================
        // CHECK JWT SECRET
        // ==========================================

        console.log(
            "🔍 Checking JWT_SECRET..."
        );


        if (!process.env.JWT_SECRET) {

            console.error(
                "❌ JWT_SECRET IS MISSING"
            );

            return res.status(500).json({

                success: false,

                message:
                    "JWT configuration is missing"

            });

        }


        console.log(
            "✅ JWT_SECRET exists"
        );


        // ==========================================
        // GENERATE JWT
        // ==========================================

        console.log(
            "🔑 Generating JWT..."
        );


        const token =
            jwt.sign(

                {
                    userId:
                        user._id.toString(),

                    role:
                        user.role

                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN ||
                        "7d"
                }

            );


        console.log(
            "✅ JWT GENERATED"
        );


        // ==========================================
        // LOGIN RESPONSE
        // ==========================================

        console.log(
            "📤 Sending login response..."
        );


        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                _id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error("");
        console.error(
            "================================="
        );

        console.error(
            "❌ LOGIN ERROR"
        );

        console.error(
            "================================="
        );

        console.error(
            error
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Stack:",
            error.stack
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    registerUser,

    loginUser

};
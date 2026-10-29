// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");

// const verifyToken = async (req, res, next) => {
//    try {
//        const authHeader = req.headers.authorization;
//        if (!authHeader || !authHeader.startsWith("Bearer ")) {
//            return res.status(401).json({
//                success: false,
//                message: "Access denied. Please login first."
//            });
//        }
//        const token = authHeader.split(" ")[1];
//        const decoded = jwt.verify( token, process.env.JWT_SECRET );
//        const user = await User.findById(decoded.id).select("-password").lean()

//        if (!user) {
//            return res.status(401).json({
//                success: false,
//                message: "User no longer exists."
//            });
//        }
//        req.user = user;
//        next();

//    } catch (error) {
//        return res.status(401).json({
//            success: false,
//            message: "Invalid or expired token."
//        });
//    }
// }

// module.exports = verifyToken;


const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const extractToken = (req) => {
    // 1. Cookie (browser frontend)
    if (req.cookies?.token) return req.cookies.token;

    // 2. Authorization: Bearer <token> (Postman, mobile)
    const header = req.headers.authorization;
    if (typeof header === "string" && header.startsWith("Bearer ")) {
        return header.slice(7).trim();
    }
    return null;
};

const verifyToken = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please sign in."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure the user still exists (deleted accounts can't use old tokens)
        const user = await User.findById(decoded.id).select("_id name email role");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Session expired. Please sign in again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        console.error("verifyToken error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = verifyToken;
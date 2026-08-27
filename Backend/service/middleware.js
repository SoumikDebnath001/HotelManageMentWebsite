const SuperAdminController = require('../controllers/superadmin/auth/superadminController');
const HotelAdminController = require('../controllers/admin/auth/adminController');
const EmployeeController = require('../controllers/employee/auth/employeeController');
const UserController = require('../controllers/user/auth/userController');

// Public paths that do not require authentication token
const publicPaths = [
    "/admin/login",
    "/admin/register",
    "/superadmin/register",
    "/superadmin/login",
    "/superadmin/verifyOtp",
    "/employee/login",
    "/employee/forgotPassword",
    "/employee/verifyOtp",
    "/user/register",
    "/user/login",
    "/user/forgotPassword",
    "/user/verifyOtp",
];

// Main Authentication Middleware
const authMiddleware = async (req, res, next) => {
    // Check if current URL is in public paths list
    if (publicPaths.some((path) => req.url.startsWith(path))) {
        return next();
    }

    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({
            status: false,
            credentials: false,
            error: "No credentials sent! Authorization header missing.",
        });
    }

    try {
        let userData = null;
        let userType = req.headers.usertype || "User";

        if (userType === "SuperAdmin") {
            userData = await SuperAdminController.getTokenData(authorization);
        } else if (userType === "Admin") {
            userData = await HotelAdminController.getTokenData(authorization);
        } else if (userType === "Employee") {
            userData = await EmployeeController.getTokenData(authorization);
        } else if (userType === "User") {
            userData = await UserController.getTokenData(authorization);
        }

        if (userData && userData != null) {
            if (typeof userData.toObject === 'function') {
                userData = userData.toObject();
            }
            delete userData.password;
            delete userData.token;
            req.user = userData;
            req.userType = userType;
            req.token = authorization;
            return next();
        } else {
            return res.status(401).json({
                status: false,
                credentials: false,
                error: "Credentials invalid or expired",
            });
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({
            status: false,
            message: "Authentication server error",
            error: error.message,
        });
    }
};

// Role-based Authorization Middlewares
const requireSuperAdmin = (req, res, next) => {
    if (req.userType !== "SuperAdmin") {
        return res.status(403).json({
            status: false,
            message: "Only super admin can access this resource",
        });
    }
    // Historical context compatibility for platform management
    req.userType = "Admin";
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.userType !== "Admin") {
        return res.status(403).json({
            status: false,
            message: "Only hotel admin can access this resource",
        });
    }
    next();
};

const requireManager = (req, res, next) => {
    if (req.userType !== "Employee" || req.user.role !== "manager" || !req.user.hotelId) {
        return res.status(403).json({
            status: false,
            message: "Only an assigned manager can access this resource",
        });
    }
    req.query.hotelId = req.user.hotelId;
    next();
};

const requireEmployee = (req, res, next) => {
    if (req.userType !== "Employee") {
        return res.status(403).json({
            status: false,
            message: "Only employee can access this resource",
        });
    }
    next();
};

const requireUser = (req, res, next) => {
    if (req.userType !== "User") {
        return res.status(403).json({
            status: false,
            message: "Only end user can access this resource",
        });
    }
    next();
};

module.exports = {
    middleware: authMiddleware,
    authMiddleware,
    requireSuperAdmin,
    requireAdmin,
    requireManager,
    requireEmployee,
    requireUser,
};

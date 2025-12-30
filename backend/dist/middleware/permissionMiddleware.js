"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const checkPermission = (permission) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        // The 'Admin' role has all permissions implicitly
        const isAdmin = user.roles.some((role) => role.name === 'Admin');
        if (isAdmin) {
            return next();
        }
        // Get all unique permissions from all roles the user has
        const userPermissions = new Set();
        user.roles.forEach((role) => {
            role.permissions.forEach((perm) => {
                userPermissions.add(perm.name);
            });
        });
        if (userPermissions.has(permission)) {
            next(); // User has the required permission
        }
        else {
            res.status(403).json({ message: `Forbidden: You do not have the '${permission}' permission.` });
        }
    };
};
exports.checkPermission = checkPermission;

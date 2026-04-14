import jwt from "jsonwebtoken";
import User from "../models/userModels.js";
import { AppError } from "./errorMiddleware.js";


export const protect = async (req, res, next) => {
  try {
    
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt; 
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to continue.", 401));
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
   
    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return next(new AppError("The account belonging to this token no longer exists.", 401));
    }

    if (currentUser.passwordChangedAt) {
      const changedAt = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedAt) {
        return next(new AppError("Password was recently changed. Please log in again.", 401));
      }
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error); 
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This route is restricted to: ${roles.join(", ")}.`,
          403
        )
      );
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) return next(); 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select("-password");
    if (currentUser) req.user = currentUser;

    next();
  } catch {
    next(); 
  }
};

export const verifyOwnership = (resourceUserField = "patient") => {
  return (req, res, next) => {
    const resource = req.resource; 
    if (!resource) {
      return next(new AppError("Resource not found", 404));
    }

    const isOwner =
      resource[resourceUserField]?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return next(new AppError("You do not have permission to access this resource.", 403));
    }

    next();
  };
};
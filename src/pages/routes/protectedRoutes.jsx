// Routes/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // adjust the path if needed

const ProtectedRoute = ({ children }) => {
  const { authUser, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  return authUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
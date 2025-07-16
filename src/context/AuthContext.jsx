// AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setAuthUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authUser?.token) {
      axios.defaults.headers.common["Authorization"] = authUser.token;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authUser]);

  const login = (userData) => {
    setAuthUser(userData);
    axios.defaults.headers.common["Authorization"] = userData.token;
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("OrgId", userData.user.organizationId)
  };

  const logout = () => {
    setAuthUser(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ authUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

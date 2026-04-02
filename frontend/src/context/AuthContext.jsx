import { createContext, useState, useContext, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await API.get("/auth/me");

      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false); // ✅ IMPORTANT
    }
  };

  const login = async (email, password) => {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    setUser(res.data.user);

    return res.data.user;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {}

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loading,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

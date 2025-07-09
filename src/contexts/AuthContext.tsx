"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = () => {
    const token = Cookies.get("auth_token");
    const userData = Cookies.get("user_data");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("✅ User loaded from cookies:", {
          userId: parsedUser.id,
          email: parsedUser.email,
          role: parsedUser.role,
        });
      } catch (error) {
        console.error("Error parsing user data from cookies:", error);
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  const login = (token: string, userData: User) => {
    try {
      // Set cookies with 7 days expiration and secure options
      Cookies.set("auth_token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      Cookies.set("user_data", JSON.stringify(userData), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      setUser(userData);
      console.log("✅ User logged in and data saved to cookies:", {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
      });
    } catch (error) {
      console.error("❌ Error saving user data to cookies:", error);
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_data");
    setUser(null);
    console.log("✅ User logged out and cookies cleared");
  };

  useEffect(() => {
    loadUser();

    // Listen for storage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "user_data") {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

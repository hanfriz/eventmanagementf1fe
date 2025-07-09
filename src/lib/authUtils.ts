import { User } from "@/types";

// Auth utilities for managing authentication state updates

/**
 * Dispatch auth update event to notify all components using useAuth hook
 * Call this after any authentication state changes (login, logout, etc.)
 */
export const notifyAuthUpdate = () => {
  if (typeof window !== "undefined") {
    console.log("Dispatching auth-update event");
    window.dispatchEvent(new Event("auth-update"));
  }
};

/**
 * Login helper - saves auth data and notifies components
 */
export const setAuthData = (token: string, user: User) => {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("user_data", JSON.stringify(user));
  notifyAuthUpdate();
};

/**
 * Logout helper - clears auth data and notifies components
 */
export const clearAuthData = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_data");
  notifyAuthUpdate();
};

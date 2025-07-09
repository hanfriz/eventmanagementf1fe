import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export const useRoleProtection = (
  allowedRoles: string[],
  redirectTo: string = "/auth/login"
) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not authenticated, redirect to login
        toast.error("Please login to access this page");
        router.push(redirectTo);
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect to events page with error
        toast.error("You don't have permission to access this page");
        router.push("/events");
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  return { isAuthorized, isLoading, user };
};

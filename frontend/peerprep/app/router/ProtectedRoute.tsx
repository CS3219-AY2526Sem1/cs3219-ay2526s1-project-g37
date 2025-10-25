import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "~/Context/authContext";

export type AccessType = "USER" | "ADMIN";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userLoggedIn } = useAuth();
  const [isAdmin] = useState(true);
  const location = useLocation();

  const adminLinks = ["/questions"].some((path) =>
    location.pathname.startsWith(path)
  );
  const authLinks = ["/user", "/collab"].some((path) =>
    location.pathname.startsWith(path)
  );

  // If route requires auth and user isn't logged in, redirect to root/login
  if ((authLinks || adminLinks) && !userLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (adminLinks && !isAdmin) {
    return <Navigate to="/user" replace state={{ from: location }} />;
  }

  return children;
}

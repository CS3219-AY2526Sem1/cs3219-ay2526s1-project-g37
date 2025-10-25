import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "~/Context/AuthContext";
import { useCollabService } from "~/Services/CollabService";

export type AccessType = "USER" | "ADMIN";

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * ProtectedRoute component to guard routes based on authentication and authorization
 * @param children - Child components to render if access is granted
 * @returns JSX.Element - Either the children or a redirect to appropriate route
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userLoggedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(true);
  const location = useLocation();

  // Check if route requires admin access or authentication
  const adminLinks = ["/questions"].some((path) =>
    location.pathname.startsWith(path)
  );
  const authLinks = ["/user", "/collab"].some((path) =>
    location.pathname.startsWith(path)
  );

  // If route requires auth and user isn't logged in, redirect to root/login
  if ((authLinks && !userLoggedIn) || (adminLinks && !userLoggedIn)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (adminLinks && !isAdmin) {
    return <Navigate to="/user" replace state={{ from: location }} />;
  }

  return children;
}

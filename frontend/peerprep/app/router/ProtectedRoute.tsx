import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "~/Context/AuthContext";
import { useCollabService } from "~/Services/CollabService";

export type AccessType = "USER" | "ADMIN";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userLoggedIn } = useAuth();
  const { getSessionByUser } = useCollabService();
  const [isAdmin, setIsAdmin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams() as { sessionId?: string };

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

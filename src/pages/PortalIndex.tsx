import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Portal Index - Entry point for /portal route
 * Redirects to the existing client login page
 */
export default function PortalIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to client login
    navigate("/client/login", { replace: true });
  }, [navigate]);

  return null;
}

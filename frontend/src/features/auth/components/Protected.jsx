import { Navigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

const Protected = ({ children }) => {
  const { initializing, user } = useAuth();

  if (initializing) {
    return (
      <div className="app-splash" role="status" aria-live="polite">
        <div className="app-splash__inner">
          <span className="app-splash__ring" aria-hidden="true" />
          <p>Opening the listening room…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;

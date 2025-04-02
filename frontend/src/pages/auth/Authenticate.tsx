import { Navigate } from "react-router-dom";

const Authenticate = ({ children: children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default Authenticate;

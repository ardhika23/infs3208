import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children, fallback }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : (fallback ?? <div>Please login</div>);
}
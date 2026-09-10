import ProtectedRoute from "@/src/components/ProtectedRoute";
import Profile from "@/src/views/Profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}

import { useAuthStore } from '../../store/authStore';

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome, {user?.firstName} — your daily tasks and activities
        </p>
      </div>
    </div>
  );
}

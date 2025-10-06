import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function CharityDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome, Charity Admin!</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        You are logged in as: {user?.email}
      </p>
       <p className="text-sm text-muted-foreground">(Role: {user?.role})</p>
      <Button onClick={logout} className="mt-6">
        Logout
      </Button>
    </div>
  );
}

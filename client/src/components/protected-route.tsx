
import { useQuery } from "@tanstack/react-query";
import Login from "@/pages/login";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cartoon-teal"></div>
      </div>
    );
  }

  if (error || !user) {
    return <Login />;
  }

  return <>{children}</>;
}

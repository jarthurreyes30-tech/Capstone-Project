import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User, LoginCredentials } from '@/services/auth';
import { Loader2 } from 'lucide-react';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials, returnTo?: string | null) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkSession = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          // Fetch current user from backend
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Session check failed:', error);
          // Clear invalid token
          authService.clearToken();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials, returnTo?: string | null) => {
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);

      // --- RBAC REDIRECTION LOGIC ---
      let redirectPath = returnTo || '/';

      if (!returnTo) {
          switch (loggedInUser.role) {
            case 'admin':
              redirectPath = '/admin'; // <-- THIS IS THE FIX
              break;
            case 'charity_admin':
              redirectPath = '/charity';
              break;
            case 'donor':
              redirectPath = '/donor';
              break;
            default:
              redirectPath = '/';
          }
      }
      
      navigate(redirectPath, { replace: true });

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
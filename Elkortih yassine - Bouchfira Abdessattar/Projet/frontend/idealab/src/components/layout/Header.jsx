import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import useAuthStore from "../../hooks/useAuth";
import { LogIn, User, Menu } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-4 hidden md:flex">
          <span className="font-bold text-xl tracking-tight">IdeaLab</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2 md:gap-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                Profile
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

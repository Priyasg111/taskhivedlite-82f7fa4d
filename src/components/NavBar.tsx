
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/assets/logo.png";  // We'll create this asset

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={Logo} 
              alt="TaskHived Logo" 
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold" style={{
              color: '#131313'  // Black from the logo
            }}>
              TaskHived
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Browse Tasks
            </Link>
            <Link
              to="/complete-tasks"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Work on Tasks
            </Link>
            <Link
              to="/post-task"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Post a Task
            </Link>
            <Link
              to="/payments"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Payments
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">
                  {user.name} ({user.experience} hrs experience)
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="h-9 w-9 rounded-full"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" className="hidden md:flex gap-2" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="default" className="hidden md:inline-flex" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;

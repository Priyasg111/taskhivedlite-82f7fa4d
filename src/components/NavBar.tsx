import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/3aa49f16-23d7-478d-af8d-2f51c60873d4.png" 
              alt="TaskHived Logo" 
              className="h-10 w-10"
            />
            <span className="hidden sm:inline-block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-400">
              TaskHived <span className="text-sm text-neutral-500 ml-1">Next</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              Browse Tasks
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
            <Link
              to="/complete-tasks"
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              Work on Tasks
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
            <Link
              to="/post-task"
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              Post a Task
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
            <Link
              to="/payments"
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              Payments
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-primary/20 hover:bg-primary/10">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full">
                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium">{user.name.charAt(0)}</span>
                </div>
                <span className="text-sm">
                  {user.name} <span className="text-muted-foreground text-xs">({user.experience} hrs)</span>
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" className="hover:bg-primary/5" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="default" className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9 rounded-full"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden py-3 px-4 border-t border-border/50 bg-background/98 backdrop-blur-lg">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className="text-sm font-medium p-2 rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tasks
            </Link>
            <Link
              to="/complete-tasks"
              className="text-sm font-medium p-2 rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Work on Tasks
            </Link>
            <Link
              to="/post-task"
              className="text-sm font-medium p-2 rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Post a Task
            </Link>
            <Link
              to="/payments"
              className="text-sm font-medium p-2 rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Payments
            </Link>
            {!user && (
              <div className="flex gap-3 pt-2 border-t border-border/30">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                </Button>
                <Button variant="default" className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-400" asChild>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;

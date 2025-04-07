
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, DollarSign, FileCheck, Inbox } from "lucide-react";

const NavBar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-teal text-transparent bg-clip-text">
              TaskHub
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
          <Button variant="ghost" className="hidden md:flex gap-2">
            Connect Wallet
          </Button>
          <Button variant="default" className="hidden md:inline-flex">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

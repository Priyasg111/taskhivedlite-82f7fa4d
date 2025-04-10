
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  experience: number; // Hours of work experience
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateExperience: (hours: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would be an API call
    // For demo purposes, we'll use localStorage
    setIsLoading(true);
    
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const storedUserJSON = localStorage.getItem("user");
        if (storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          if (storedUser.email === email) {
            storedUser.isAuthenticated = true;
            setUser(storedUser);
            localStorage.setItem("user", JSON.stringify(storedUser));
            setIsLoading(false);
            resolve();
          } else {
            setIsLoading(false);
            reject(new Error("Invalid email or password"));
          }
        } else {
          setIsLoading(false);
          reject(new Error("No account found with this email"));
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    // In a real app, this would be an API call
    setIsLoading(true);
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: "user-" + Date.now(),
          name,
          email,
          experience: 0, // New users start with 0 hours
          isAuthenticated: true,
        };
        
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const updateExperience = (hours: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        experience: user.experience + hours
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateExperience }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

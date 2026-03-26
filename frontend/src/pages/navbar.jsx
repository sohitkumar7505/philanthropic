import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-linear-to-r from-green-800 to-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-green-800 font-bold text-sm">⛳</span>
              </div>
              <span className="font-bold text-xl">Pholothenpric Golf</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-yellow-300 transition-colors">
              Home
            </Link>
            <Link to="/lottery" className="hover:text-yellow-300 transition-colors">
              Play Golf Lottery
            </Link>
            <Link to="/charities" className="hover:text-yellow-300 transition-colors">
              Charities
            </Link>
            <Link to="/results" className="hover:text-yellow-300 transition-colors">
              Results
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/subscription" className="hover:text-yellow-300 transition-colors">
                  Subscribe
                </Link>
                <Link to="/dashboard" className="hover:text-yellow-300 transition-colors">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-yellow-300 transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-yellow-300 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-400 text-green-800 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
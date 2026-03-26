import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch latest draw
    API.get("/draw/latest").then((res) => setLatestDraw(res.data)).catch(() => {});

    // Fetch charities
    API.get("/charities").then((res) => setCharities(res.data.charities.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-green-800 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Golf Lottery: Play & Support Charities
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Choose your lucky golf scores and play our exciting lottery. Every ticket supports amazing charities while you enjoy the game of golf.
          </p>
          <div className="flex justify-center space-x-4">
            {user ? (
              <Link
                to="/lottery"
                className="bg-yellow-400 text-green-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
              >
                Play Golf Lottery ⛳
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-yellow-400 text-green-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⛳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Scores</h3>
              <p className="text-gray-600">Pick 5 lucky golf scores between 1-45 for your chance to win.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏌️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Draws</h3>
              <p className="text-gray-600">Your scores automatically enter weekly draws for prizes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Charities</h3>
              <p className="text-gray-600">Part of every ticket goes to charitable causes you care about.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Results */}
      {latestDraw && (
        <section className="py-16 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Latest Draw Results
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Winning Golf Scores</h3>
              <div className="flex justify-center space-x-2 mb-4">
                {latestDraw.numbers.map((num, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-green-800"
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="text-gray-600">
                Draw Date: {new Date(latestDraw.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Winners: {latestDraw.winners.length}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Charities */}
      {charities.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Supported Charities
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {charities.map((charity) => (
                <div key={charity._id} className="bg-green-50 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">{charity.name}</h3>
                  <p className="text-gray-600 mb-4">{charity.description}</p>
                  <div className="text-2xl font-bold text-green-600">
                    ${charity.totalDonations.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Total Donations</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/charities"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                View All Charities
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* User Dashboard Section */}
      {user && (
        <section className="py-16 bg-linear-to-r from-green-800 to-emerald-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Welcome back, {user.name}!</h2>
            <p className="text-xl mb-8">Ready to check your golf lottery numbers and see if you've won?</p>
            <Link
              to="/dashboard"
              className="bg-yellow-400 text-green-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
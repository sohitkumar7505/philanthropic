import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Lottery() {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Check subscription status first
    API.get("/subscription/status")
      .then((res) => {
        if (!res.data.isSubscribed) {
          navigate("/subscription");
          return;
        }

        // Fetch existing scores
        API.get("/scores")
          .then((res) => {
            const sortedScores = (res.data.scores || []).sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
            setScores(sortedScores);
          })
          .catch((err) => {
            if (err?.response?.status === 401 || err?.response?.status === 403) {
              localStorage.removeItem("user");
              navigate("/login");
              return;
            }
            console.warn("Could not load scores", err.message);
            setScores([]);
          });
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          navigate("/subscription");
        }
      });
  }, [navigate]);

  const validateScore = (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 45) {
      setError("Score must be between 1 and 45 (Stableford format)");
      return false;
    }
    setError("");
    return true;
  };

  const validateDate = (date) => {
    if (!date) {
      setError("Please select a date for your score");
      return false;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate > today) {
      setError("Date cannot be in the future");
      return false;
    }
    setError("");
    return true;
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateScore(scoreInput)) return;
    if (!validateDate(dateInput)) return;

    setLoading(true);
    try {
      const response = await API.post("/scores/add", {
        value: parseInt(scoreInput),
        date: dateInput,
      });

      // Update scores list
      const sortedScores = (response.data.scores || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setScores(sortedScores);

      // Reset form
      setScoreInput("");
      setDateInput("");
      setSuccess(
        `Score added successfully! You have ${response.data.totalScores}/5 scores.`
      );

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add score. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm("Delete this score?")) return;

    try {
      await API.delete(`/scores/${scoreId}`);
      setScores(scores.filter(s => s._id !== scoreId));
      setSuccess("Score deleted successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      setError("Failed to delete score");
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⛳ Enter Your Golf Scores
          </h1>
          <p className="text-xl text-gray-600">
            Add your last 5 golf scores (Stableford format: 1-45)
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your latest 5 scores are retained for the lottery
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Score Input Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Add a Score</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  ✓ {success}
                </div>
              )}

              <form onSubmit={handleAddScore} className="space-y-4">
                {/* Score Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Golf Score
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      placeholder="Enter score (1-45)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-center font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Stableford format (1-45)</p>
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score Date
                  </label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    max={getTodayDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">When you scored this</p>
                </div>

                {/* Score Preview */}
                {scoreInput && (
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {scoreInput}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {dateInput ? new Date(dateInput + "T00:00").toLocaleDateString() : "No date selected"}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !scoreInput || !dateInput}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    loading || !scoreInput || !dateInput
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {loading ? "Adding..." : "Add Score"}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 How it works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Add one score at a time</li>
                  <li>✓ Include the date of the score</li>
                  <li>✓ Your latest 5 scores are kept</li>
                  <li>✓ Oldest score auto-removed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Scores Display */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Your Scores</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {scores.length}/5
                </span>
              </div>

              {scores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⛳</div>
                  <p className="text-gray-600 text-lg">No scores yet</p>
                  <p className="text-gray-500">Add your first golf score to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scores.map((score, index) => (
                    <div
                      key={score._id}
                      className="flex items-center justify-between bg-linear-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                          {score.value}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Score: {score.value}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(score.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {index === 0 && (
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                            Latest
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteScore(score._id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>📋 Note:</strong> Only your latest 5 scores are kept. When you add the 6th score,
                  the oldest one will automatically be removed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View Dashboard
          </button>
          <button
            onClick={() => navigate("/results")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}
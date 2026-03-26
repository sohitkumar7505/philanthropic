import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [filterStatus, setFilterStatus] = useState("all");
  const [adminData, setAdminData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [draws, setDraws] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);
  const [drawType, setDrawType] = useState("random");
  const [simulationResult, setSimulationResult] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user._id) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users
        const usersRes = await API.get("/admin/users");
        setUsers(usersRes.data.users || []);

        // Fetch reports
        const reportsRes = await API.get("/admin/reports");
        setReports(reportsRes.data);

        // Fetch draw history
        const drawsRes = await API.get("/draw/history");
        setDraws(drawsRes.data.draws || []);

        // Fetch latest draw
        try {
          const latestRes = await API.get("/draw/latest");
          setLatestDraw(latestRes.data);
        } catch (err) {
          // No draw yet
        }

        setAdminData(user);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        if (error.response?.status === 403) {
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handlePromoteToAdmin = async (userId) => {
    if (!window.confirm("Promote this user to admin?")) return;
    
    try {
      setActionLoading(userId);
      await API.post("/admin/promote", { userId });
      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data.users || []);
      alert("User promoted to admin successfully!");
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemoteFromAdmin = async (userId) => {
    if (!window.confirm("Demote this admin to regular user?")) return;
    
    try {
      setActionLoading(userId);
      await API.post("/admin/demote", { userId });
      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data.users || []);
      alert("User demoted successfully!");
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateDraw = async () => {
    try {
      setActionLoading("simulate");
      const res = await API.post("/draw/simulate", { type: drawType });
      setSimulationResult(res.data);
      setShowSimulation(true);
    } catch (error) {
      alert(`Simulation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunDraw = async () => {
    if (!window.confirm(`Run ${drawType} draw? This will execute the lottery draw.`)) return;
    
    try {
      setActionLoading("run-draw");
      const res = await API.post("/draw/run", { type: drawType });
      alert("Draw executed successfully!");
      // Refresh draws
      const drawsRes = await API.get("/draw/history");
      setDraws(drawsRes.data.draws || []);
      const latestRes = await API.get("/draw/latest");
      setLatestDraw(latestRes.data);
    } catch (error) {
      alert(`Draw failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(null);
      setShowSimulation(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterStatus === "active") {
      return u.subscriptionStatus === "active";
    } else if (filterStatus === "inactive") {
      return u.subscriptionStatus === "inactive";
    }
    return true;
  });

  const activeSubscribersCount = users.filter(
    (u) => u.subscriptionStatus === "active"
  ).length;

  const monthlySubscribers = users.filter(
    (u) => u.subscriptionPlan === "monthly"
  ).length;

  const yearlySubscribers = users.filter(
    (u) => u.subscriptionPlan === "yearly"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {adminData?.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Total Users</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-semibold text-gray-900">
                {users.length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">
              Active Subscribers
            </div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-semibold text-green-600">
                {activeSubscribersCount}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">
              Monthly Plans
            </div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-semibold text-blue-600">
                {monthlySubscribers}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">
              Yearly Plans
            </div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-semibold text-purple-600">
                {yearlySubscribers}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">
              Total Draws
            </div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-semibold text-indigo-600">
                {draws.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {["users", "draws", "subscription"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab === "users" && "Users Management"}
                  {tab === "draws" && "🎰 Lottery Draws"}
                  {tab === "subscription" && "Admin Subscription"}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        filterStatus === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All ({users.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus("active")}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        filterStatus === "active"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Active ({activeSubscribersCount})
                    </button>
                    <button
                      onClick={() => setFilterStatus("inactive")}
                      className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        filterStatus === "inactive"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Inactive ({users.length - activeSubscribersCount})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Charity %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {user.role || "user"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.subscriptionStatus === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {user.subscriptionStatus || "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.subscriptionPlan ? (
                                <span className="capitalize">
                                  {user.subscriptionPlan}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.charityPercentage || 0}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.role === "admin" ? (
                                <button
                                  onClick={() => handleDemoteFromAdmin(user._id)}
                                  disabled={actionLoading === user._id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {actionLoading === user._id ? "..." : "Demote"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePromoteToAdmin(user._id)}
                                  disabled={actionLoading === user._id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  {actionLoading === user._id ? "..." : "Promote"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin Subscription Tab */}
            {activeTab === "subscription" && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Admin Subscription Management
                </h3>
                <p className="text-gray-600 mb-6">
                  As an admin, you can manage subscription settings and access premium features.
                </p>

                {adminData?.subscriptionStatus === "active" ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900">
                          ✅ Active Subscription
                        </h4>
                        <p className="text-green-700 mt-2">
                          Plan: <span className="capitalize font-semibold">{adminData?.subscriptionPlan}</span>
                        </p>
                        <p className="text-green-700">
                          Charity Donation: {adminData?.charityPercentage || 10}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-yellow-900">
                          ⚠️ No Active Subscription
                        </h4>
                        <p className="text-yellow-700 mt-2">
                          Subscribe to access admin premium features and lottery.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">
                    Subscription Plans
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monthly Plan */}
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">
                        Monthly Plan
                      </h5>
                      <p className="text-3xl font-bold text-blue-600 mb-2">
                        ₹1,200
                      </p>
                      <p className="text-sm text-gray-600 mb-4">Per month</p>
                      <ul className="space-y-2 mb-4 text-sm text-gray-700">
                        <li>✓ Access to lottery</li>
                        <li>✓ Unlimited plays</li>
                        <li>✓ Results tracking</li>
                        <li>✓ Charity donations</li>
                      </ul>
                      <button
                        onClick={() => navigate("/subscription")}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Subscribe Monthly
                      </button>
                    </div>

                    {/* Yearly Plan */}
                    <div className="bg-white border-2 border-green-500 rounded-lg p-4 relative">
                      <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
                        BEST VALUE
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">
                        Yearly Plan
                      </h5>
                      <p className="text-3xl font-bold text-green-600 mb-2">
                        ₹12,000
                      </p>
                      <p className="text-sm text-gray-600 mb-2">Per year</p>
                      <p className="text-sm font-semibold text-green-600 mb-4">
                        Save ₹2,400 annually
                      </p>
                      <ul className="space-y-2 mb-4 text-sm text-gray-700">
                        <li>✓ All monthly features</li>
                        <li>✓ Priority support</li>
                        <li>✓ Exclusive admin tools</li>
                        <li>✓ 30% charity boost</li>
                      </ul>
                      <button
                        onClick={() => navigate("/subscription")}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Subscribe Yearly
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Draws Tab */}
            {activeTab === "draws" && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  🎰 Lottery Draw Management
                </h3>

                {/* Draw Control Panel */}
                <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 mb-8 border border-indigo-200">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-4">
                    Execute a New Draw
                  </h4>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Draw Method
                      </label>
                      <select
                        value={drawType}
                        onChange={(e) => setDrawType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="random">🎲 Random</option>
                        <option value="algorithm">📊 Algorithm</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1">
                        {drawType === "random"
                          ? "Generates random winning numbers"
                          : "Uses frequency analysis of submitted scores"}
                      </p>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleSimulateDraw}
                        disabled={actionLoading === "simulate"}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {actionLoading === "simulate" ? "Simulating..." : "🔍 Simulate Draw"}
                      </button>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleRunDraw}
                        disabled={actionLoading === "run-draw"}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {actionLoading === "run-draw" ? "Running..." : "▶️ Execute Draw"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulation Results */}
                {showSimulation && simulationResult && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">
                      📋 Draw Simulation Results
                    </h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Winning Numbers:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {simulationResult.numbers?.map((num, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Prize Pool:</strong>
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{simulationResult.prizePool?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {simulationResult.summary && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Matching Summary:</strong>
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-xs text-gray-600">5 Matches</p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {simulationResult.summary.matches?.[5] || 0}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-xs text-gray-600">4 Matches</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {simulationResult.summary.matches?.[4] || 0}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-xs text-gray-600">3 Matches</p>
                            <p className="text-2xl font-bold text-green-600">
                              {simulationResult.summary.matches?.[3] || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Latest Draw */}
                {latestDraw && (
                  <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-indigo-500">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      ⭐ Latest Draw
                    </h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Winning Numbers:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {latestDraw.numbers?.map((num, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Draw Details:</strong>
                        </p>
                        <p className="text-sm">
                          Method:{" "}
                          <span className="font-semibold capitalize">
                            {latestDraw.type}
                          </span>
                        </p>
                        <p className="text-sm">
                          Date:{" "}
                          <span className="font-semibold">
                            {new Date(latestDraw.drawDate).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm">
                          Prize Pool:{" "}
                          <span className="font-bold text-green-600">
                            ₹{latestDraw.prizePool?.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>

                    {latestDraw.tierPools && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold mb-3">
                          Tier Prize Distribution:
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                            <p className="text-xs text-indigo-700">
                              <strong>5 Matches</strong>
                            </p>
                            <p className="text-lg font-bold text-indigo-600">
                              ₹{latestDraw.tierPools.five?.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-xs text-blue-700">
                              <strong>4 Matches</strong>
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              ₹{latestDraw.tierPools.four?.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-xs text-green-700">
                              <strong>3 Matches</strong>
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              ₹{latestDraw.tierPools.three?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Draw History */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    📚 Draw History
                  </h4>

                  {draws.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      No draws have been executed yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Numbers
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Prize Pool
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Winners
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {draws.map((draw) => (
                            <tr key={draw._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(draw.drawDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-1">
                                  {draw.numbers?.map((num, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-gray-200 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                                    >
                                      {num}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="capitalize font-medium">
                                  {draw.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                ₹{draw.prizePool?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                  {draw.winners?.length || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
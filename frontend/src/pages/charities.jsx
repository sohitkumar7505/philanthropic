import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    API.get("/charities")
      .then((res) => setCharities(res.data.charities))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCharities = charities.filter(charity =>
    charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Charities We Support
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every golf lottery ticket you buy helps support these amazing charities.
            Together, we're making a real difference in communities while enjoying the game of golf.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search charities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Charities Grid */}
        {filteredCharities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharities.map((charity) => (
              <div key={charity._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Charity Image Placeholder */}
                <div className="h-48 bg-linear-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                  <span className="text-6xl text-white">⛳</span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {charity.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {charity.description || "Supporting communities and making a positive impact through charitable work."}
                  </p>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Donations</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${charity.totalDonations.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No charities found
            </h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No charities available at the moment."}
            </p>
          </div>
        )}

        {/* Impact Section */}
        <div className="mt-16 bg-linear-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Your Impact Matters</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            When you play our lottery, you're not just chasing dreams – you're supporting causes that change lives.
            Every ticket brings us closer to a better world.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">10%</div>
              <div className="text-sm">Of every ticket goes to charity</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100+</div>
              <div className="text-sm">Charities supported worldwide</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$1M+</div>
              <div className="text-sm">Raised for charitable causes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Results() {
  const [latestDraw, setLatestDraw] = useState(null);
  const [drawHistory, setDrawHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          API.get("/draw/latest"),
          API.get("/draw/history")
        ]);

        setLatestDraw(latestRes.data);
        setDrawHistory(historyRes.data);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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
            Golf Lottery Results
          </h1>
          <p className="text-xl text-gray-600">
            Check the latest winning golf scores and past draw results
          </p>
        </div>

        {/* Latest Draw */}
        {latestDraw && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Latest Draw Results
              </h2>
              <p className="text-gray-600">
                {new Date(latestDraw.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Winning Numbers */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                {latestDraw.numbers.map((num, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-2xl font-bold text-blue-800">{num}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Winners */}
            <div className="border-t pt-8">
              <h3 className="text-2xl font-semibold text-center mb-6">
                Winners ({latestDraw.winners.length})
              </h3>

              {latestDraw.winners.length > 0 ? (
                <div className="grid gap-4">
                  {latestDraw.winners.map((winner, index) => (
                    <div key={index} className="bg-linear-to-r from-green-50 to-blue-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {winner.user.name || winner.user.email}
                          </p>
                          <p className="text-gray-600">
                            Matched {winner.matchCount} numbers
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${winner.prize.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Prize</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No winners this draw. Better luck next time!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Draw History */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Recent Draws
          </h2>

          {drawHistory.length > 0 ? (
            <div className="space-y-6">
              {drawHistory.map((draw) => (
                <div key={draw._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {new Date(draw.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h3>
                      <p className="text-gray-600">
                        {draw.winners.length} winner{draw.winners.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {draw.numbers.map((num, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          <span className="text-sm font-bold text-gray-700">{num}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {draw.winners.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Top prize: ${Math.max(...draw.winners.map(w => w.prize)).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No draw history yet
              </h3>
              <p className="text-gray-600">
                Check back after the first draw results are published.
              </p>
            </div>
          )}
        </div>

        {/* Prize Information */}
        <div className="mt-12 bg-linear-to-r from-blue-600 to-purple-700 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">Prize Structure</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">3️⃣</div>
              <div className="text-xl font-semibold mb-1">Match 3</div>
              <div className="text-2xl font-bold">$200</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4️⃣</div>
              <div className="text-xl font-semibold mb-1">Match 4</div>
              <div className="text-2xl font-bold">$500</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5️⃣</div>
              <div className="text-xl font-semibold mb-1">Match 5</div>
              <div className="text-2xl font-bold">$1,000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const Subscription = () => {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedCharity, setSelectedCharity] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: { name: "Monthly Plan", price: 1200 },
    yearly: { name: "Yearly Plan", price: 12000 },
  };

  useEffect(() => {
    API.get("/charities")
      .then((res) => setCharities(res.data.charities || []))
      .catch(() => {});
  }, []);

  // 🔥 Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      // 🔥 Create order from backend
      const { data } = await API.post("/payment/create-order", {
        amount: plans[selectedPlan].price,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // from .env
        amount: data.amount,
        currency: "INR",
        name: "Golf Lottery",
        description: plans[selectedPlan].name,
        order_id: data.orderId,

        handler: async function (response) {
          // 🔥 Verify payment on backend
          await API.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: selectedPlan,
            charityId: selectedCharity,
            charityPercentage,
          });

          alert("Payment Successful 🎉");
          navigate("/dashboard");
        },

        theme: {
          color: "#16a34a",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Choose Your Plan
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plans */}
          <div className="bg-white p-6 rounded-lg shadow">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`p-4 border rounded-lg mb-3 cursor-pointer ${
                  selectedPlan === key ? "border-green-500" : ""
                }`}
              >
                <h3>{plan.name}</h3>
                <p>₹{plan.price}</p>
              </div>
            ))}
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <select
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
              className="w-full border p-2"
            >
              <option value="">Select Charity</option>
              {charities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              {loading
                ? "Processing..."
                : `Pay ₹${plans[selectedPlan].price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
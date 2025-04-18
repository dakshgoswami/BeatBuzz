import "./Price-Card.css";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { useUser } from "@clerk/clerk-react";
// import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import useUserFetchStore from "../../stores/fetchUserStore";
import { axiosInstance } from "../../lib/axios";
// import { useAuth } from "@clerk/clerk-react"
// console.log(useAuth);
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  planId: number;
  planName: string;
  planPrice: number;
  planDuration: string;
  planFeatures: string[];
}

// interface Order {
//   id: string;
//   amount: number;
//   currency: string;
//   receipt: string;
// }

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PriceCardProps {
  plan: Plan;
  user?: any; // Define a proper user type if available
  setLoginForm?: (state: boolean) => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ plan }) => {
  const { planId, planName, planPrice, planDuration, planFeatures } = plan;
  const navigate = useNavigate();
  // const { user } = useUser();
  // const { getToken } = useAuth();
  const token = localStorage.getItem("token");
  const { currentUser } = useUserFetchStore();
  const userId = currentUser?._id;
  const initPay = (orderId: string, sendingData: any) => {
    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded.");
      toast.error("Payment service unavailable. Please try again.");
      return;
    }
    const options = {
      key: "rzp_test_kzKSGGpfvtbVhi",
      amount: planPrice,
      currency: "INR",
      name: "BeatBuzz Music",
      description: "Premium Membership",
      order_id: orderId,
      handler: async function (response: RazorpayResponse) {
        console.log(response);

        const { plan } = sendingData;
        if (!token) {
          toast.error("Authentication token is missing.");
          return;
        }
        const { data } = await axiosInstance.post(
          `/users/verifypayment`,
          { response, plan: plan },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(data);
        if (data.success) {
          navigate("/");
          toast.success("Payment Successful!");
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  const razorPayment = async (planId: number, userId: any) => {
    console.log("Sending payment request with:", { planId, userId: userId });
    try {
      if (!currentUser._id || !userId) {
        console.error("User is not authenticated.");
        toast.error("User is not authenticated.");
        return;
      }

      // const token = await getToken();
      if (!token) {
        toast.error("Authentication token is missing.");
        return;
      }

      const { data } = await axiosInstance.post(
        `/users/payment`,
        { planId, userId: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment response:", data);
      const sendingData = data;
      if (data.success) {
        initPay(data.order.id, sendingData);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Payment initialization failed."
      );
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col items-center bg-gray-800 shadow-xl rounded-lg p-6 w-full max-sm:w-[320px] max-sm:h-[350px] max-h-[500px] md:w-[300px] text-white transition-transform transform hover:scale-105">
        {/* Plan Header */}
        <div className="w-full bg-green-500 text-center py-4 max-sm:py-2 rounded-md">
          <h3 className="text-xl max-sm:text-base font-semibold">{planName}</h3>
        </div>

        {/* Plan Price */}
        <div className="mt-4 text-center">
          <h1 className="text-4xl max-sm:text-3xl font-bold text-green-400">₹{planPrice}</h1>
          <p className="text-sm text-gray-300">{planDuration}</p>
        </div>

        {/* Features List */}
        <ul className="scrollbar mt-6 space-y-2 text-sm max-sm:text-xs text-gray-200 h-[150px] max-h-[150px] overflow-y-auto">
          {planFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-green-400">✓</span> {feature}
            </li>
          ))}
        </ul>

        {/* Buy Plan Button */}
        <button
          onClick={() => razorPayment(planId, userId)}
          // disabled={!currentUser._id}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 max-sm:text-sm rounded-lg mt-6 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Plan
        </button>
      </div>
    </>
  );
};

export default PriceCard;

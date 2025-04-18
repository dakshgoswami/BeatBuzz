import PriceCard from "./Price-Card";
import { useNavigate } from "react-router-dom";
const Premium = () => {
  const navigate = useNavigate();
  const plans = [
    {
      planId: 101,
      planName: "Basic",
      planPrice: 150,
      planDuration: "per month",
      planFeatures: ["Access to all songs", "Access to all albums", "No ads"],
    },
    {
      planId: 102,
      planName: "Premium",
      planPrice: 250,
      planDuration: "per month",
      planFeatures: [
        "Access to all songs",
        "Access to all albums",
        "Create Own playlists",
        "Download songs",
        "Maximum 2 Members",
        "No ads",
      ],
    },
    {
      planId: 103,
      planName: "Pro",
      planPrice: 350,
      planDuration: "per month",
      planFeatures: [
        "Access to all songs",
        "Access to all albums",
        "Create Own playlists",
        "Download songs",
        "Access to all podcasts",
        "Maximum 4 Members",
        "No ads",
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-zinc-900 flex flex-col items-center py-12 px-6">
      <h1 className="text-white text-3xl font-bold mb-8">Choose Your Plan</h1>
      <div className="w-full max-w-6xl flex flex-wrap justify-center gap-6">
        {plans.map((plan) => (
          <PriceCard key={plan.planId} plan={plan} />
        ))}
      </div>
      <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg mt-6" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Premium;

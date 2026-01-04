import { useEffect, useState } from "react";

interface RideComparisonProps {
  olaData: any;
  rapidoData: any;
  prompt?: string;
  pushSystem?: any;
  setOlaOtpPopup?: any;
}

const RIDE_CANONICAL_MAP = [
  {
    label: "Bike",
    ola: "Bike",
    rapido: "Bike",
  },
  {
    label: "Auto",
    ola: "Auto",
    rapido: "Auto",
  },
  {
    label: "Economy Cab",
    ola: "Mini",
    rapido: "Cab Economy",
  },
  {
    label: "Sedan",
    ola: "Prime Sedan",
    rapido: "Cab Sedan",
  },
  {
    label: "SUV / XL",
    ola: "Prime SUV",
    rapido: "Cab XL",
  },
  {
    label: "Premium",
    ola: null,
    rapido: "Cab Premium",
  },
];

const RideSkeleton = () => {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 rounded-lg bg-gray-900/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-700" />
            <div className="h-4 w-24 bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
};

const RIDE_ICON_MAP: Record<string, string> = {
  Bike: "/logo/bike.png",
  Auto: "/logo/auto.png",
  "Economy Cab": "/logo/Car.png",
  Sedan: "/logo/sedan.png",
  "SUV / XL": "/logo/suv.png",
  Premium: "/logo/Car.png",
};

function RideRow({ ride, pickup, drop, onOlaBook }: any) {
  const [unavailablePopup, setUnavailablePopup] = useState<boolean>(false);
  const [rapidoLoader, setRapidoLoader] = useState<boolean>(false);

  function handleUnavailablePopup() {
    setRapidoLoader(true);

    setTimeout(() => {
      setRapidoLoader(false);
      setUnavailablePopup(true);
    }, 1500);
  }

  return (
    <div className="flex items-center justify-between bg-gray-900/40 border border-gray-700/30 rounded-2xl px-6 py-4">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Ride Icon */}
        <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
          <img
            src={RIDE_ICON_MAP[ride.label]}
            alt={ride.label}
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Ride Info */}
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white">{ride.label}</span>
          <span className="text-sm text-gray-400">
            {pickup} → {drop}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-2 w-80">
        {/* OLA */}
        <div className="flex justify-between items-center bg-blue-300/10 rounded-lg px-3 py-2">
          <div>
            <div className="text-xs text-gray-400">Ola</div>
            <div className="text-white font-medium">{ride.ola.price}</div>
          </div>
          <button
            disabled={!ride.ola.available}
            onClick={onOlaBook}
            className={`text-sm px-3 py-1 rounded-md ${
              ride.ola.available
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-600 cursor-not-allowed text-white"
            }`}
          >
            Book
          </button>
        </div>

        {/* RAPIDO */}
        <div className="flex justify-between items-center bg-blue-300/10 rounded-lg px-3 py-2 ">
          <div>
            <div className="text-xs text-gray-400">Rapido</div>
            <div className="text-gray-400">{ride.rapido.price}</div>
          </div>

          <button
            onClick={handleUnavailablePopup}
            disabled={rapidoLoader}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md 
               flex items-center justify-center"
          >
            {rapidoLoader ? (
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Book"
            )}
          </button>
        </div>
      </div>
      {unavailablePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-800 
                    bg-gradient-to-b from-gray-900 to-black p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-3 text-center">
              <h2 className="text-lg font-semibold text-white">
                Booking Unavailable
              </h2>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-400 text-center leading-relaxed">
              Currently facing some issue while booking from{" "}
              <span className="text-white font-medium">Rapido</span>.
              <br />
              Please try again later.
            </p>

            {/* Action */}
            <button
              onClick={() => setUnavailablePopup(false)}
              className="mt-5 w-full rounded-xl py-2.5 font-medium text-white 
                   bg-red-600 hover:bg-red-500 transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RideComparison({
  olaData: initialOlaData,
  rapidoData,
  prompt,
  pushSystem,
  setOlaOtpPopup,
}: RideComparisonProps) {
  const [olaRideName, setOlaRideName] = useState<string>("");
  const [rapidoRideName, setRapidoRideName] = useState<string>("");
  const [olaData, setOlaData] = useState<any>(initialOlaData);
  const [isRefreshingOla, setIsRefreshingOla] = useState<boolean>(false);

  useEffect(() => {
    if (olaData?.ride_name) {
      setOlaRideName(olaData.ride_name);
    }
  }, [olaData?.ride_name]);

  const isOlaLoading = !olaData || !olaData?.rides;
  const isRapidoLoading = !rapidoData || !rapidoData?.rides;

  const renderStatus = (status: string) => {
    switch (status) {
      case "otp_sent":
        return <span className="text-yellow-400">OTP Sent</span>;
      case "success":
        return <span className="text-green-400">Available</span>;
      case "rides_ready":
        return <span className="text-green-400">Available</span>;
      default:
        return <span className="text-gray-400">{status || "Checking..."}</span>;
    }
  };

  const refreshOlaData = async () => {
    if (!prompt) {
      pushSystem?.("No prompt available to refresh Ola data");
      return;
    }

    setIsRefreshingOla(true);

    try {
      const config = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      };

      const response = await fetch(
        "https://api.khwaaish.com/api/ola/location-login",
        config
      );

      const data = await response.json();
      setOlaData(data);

      pushSystem?.("Ola data refreshed successfully");
    } catch (error) {
      pushSystem?.("Failed to refresh Ola data");
      console.error("Error refreshing Ola data:", error);
    } finally {
      setIsRefreshingOla(false);
    }
  };

  async function OlaBook() {
    if (!olaRideName) {
      pushSystem?.("Please select an Ola ride before booking");
      return;
    }

    if (!olaData?.session_id) {
      pushSystem?.("Ola session not ready yet");
      return;
    }
    console.log("Ola Book Function Called");
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: olaData?.session_id,
        ride_name: olaRideName,
        prompt: prompt,
      }),
    };

    const response = await fetch(
      "https://api.khwaaish.com/api/ola/book",
      config
    );
    const data = await response.json();
    console.log(data);
    if (data.status === "booking_initiated") {
      pushSystem("Your Ola Ride is Booked Successfully");
    } else {
      pushSystem("Something went wrong in the Book endpoint");
    }
  }

  const combinedRides = (olaData?.rides || []).map((olaRide: any) => {
    const rapidoRide =
      rapidoData?.rides?.find((r: any) => r.name === olaRide.name) || null;

    return {
      rideName: olaRide.name,
      ola: {
        price: olaRide.price,
        available: true,
      },
      rapido: {
        price: rapidoRide?.price_range || "-",
        available: false, // explicitly unavailable
      },
    };
  });

  const olaRideMap = Object.fromEntries(
    (olaData?.rides || []).map((r: any) => [r.name, r])
  );

  const rapidoRideMap = Object.fromEntries(
    (rapidoData?.rides || []).map((r: any) => [r.name, r])
  );

  const comparisonRides = RIDE_CANONICAL_MAP.map((ride) => {
    const olaRide = ride.ola ? olaRideMap[ride.ola] : null;
    const rapidoRide = ride.rapido ? rapidoRideMap[ride.rapido] : null;

    return {
      label: ride.label,

      ola: {
        name: ride.ola,
        price: olaRide?.price || "-",
        available: Boolean(olaRide && olaRide.price),
      },

      rapido: {
        name: ride.rapido,
        price: rapidoRide?.price_range || "-",
        available: Boolean(rapidoRide),
      },
    };
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Ride Comparison Results
        </h3>
        <div className="text-sm text-gray-400">
          Showing Ride options from{" "}
          <span className="text-white">
            {olaData?.pickup_location || rapidoData?.pickup_location}
          </span>{" "}
          to{" "}
          <span className="text-white">
            {olaData?.destination_location || rapidoData?.drop_location}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {comparisonRides.map((ride, index) => (
          <RideRow
            key={index}
            ride={ride}
            pickup={olaData?.pickup_location}
            drop={olaData?.destination_location}
            onOlaBook={() => {
              if (!ride.ola.available || !ride.ola.name) return;

              setOlaRideName(ride.ola.name);
              OlaBook();
            }}
          />
        ))}
      </div>
    </div>
  );
}

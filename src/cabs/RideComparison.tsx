import { useState } from "react";

interface RideComparisonProps {
  olaData: any;
  rapidoData: any;
  prompt?: string;
  pushSystem?: any;
}

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

export default function RideComparison({
  olaData: initialOlaData,
  rapidoData,
  prompt,
  pushSystem,
}: RideComparisonProps) {
  const [olaRideName, setOlaRideName] = useState<string>("");
  const [rapidoRideName, setRapidoRideName] = useState<string>("");
  const [olaData, setOlaData] = useState<any>(initialOlaData);
  const [isRefreshingOla, setIsRefreshingOla] = useState<boolean>(false);

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

      {/* Comparison Grid - 2 or 3 columns based on data */}
      <div className={`grid gap-4 ${"grid-cols-1 md:grid-cols-2"} w-4/5`}>
        {/* OLA Card */}
        <div className="flex flex-col justify-between border border--700/30 rounded-2xl p-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Ola Rides
                  </h4>
                  <div className="text-xs text-gray-400">
                    {olaData?.phone_number}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {renderStatus(olaData?.status)}
                <button
                  onClick={refreshOlaData}
                  disabled={isRefreshingOla}
                  className="bg-red-500 text-white p-1 rounded text-sm "
                >
                  {isRefreshingOla ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* All Available Rides */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                All Available Rides:
              </div>
              <div className="space-y-2">
                {isOlaLoading || isRefreshingOla ? (
                  <RideSkeleton />
                ) : (
                  olaData.rides.map((ride: any, index: number) => (
                    <label
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                        olaRideName === ride.name
                          ? "bg-blue-900/30 border border-blue-700/50"
                          : "bg-gray-900/30 hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="radio"
                            name="ola-ride"
                            value={ride.name}
                            checked={olaRideName === ride.name}
                            onChange={(e) => setOlaRideName(e.target.value)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              olaRideName === ride.name
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-600"
                            }`}
                          >
                            {olaRideName === ride.name && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`font-medium ${
                            olaRideName === ride.name
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {ride.name}
                        </span>
                      </div>
                      <span
                        className={`font-medium ${
                          olaRideName === ride.name
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {ride.price || "-"}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => OlaBook()}
            className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>
              {olaData?.status === "otp_sent"
                ? "Verify OTP & Book"
                : "Book Ola Ride"}
            </span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* RAPIDO Card */}
        <div className="flex flex-col justify-between border border--700/30 rounded-2xl p-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Rapido Rides
                  </h4>
                  <div className="text-xs text-gray-400">
                    {rapidoData?.phone_number}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {renderStatus(rapidoData?.status)}
                <button className="bg-red-500 text-white p-1 rounded text-sm ">
                  Refresh
                </button>
              </div>
            </div>

            {/* All Available Rides */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                All Available Rides:
              </div>
              <div className="space-y-2">
                {isRapidoLoading ? (
                  <RideSkeleton />
                ) : rapidoData?.rides?.length ? (
                  rapidoData?.rides?.map((ride: any, index: number) => (
                    <label
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                        rapidoRideName === ride.name
                          ? "bg-blue-900/30 border border-blue-700/50"
                          : "bg-gray-900/30 hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="radio"
                            name="rapido-ride"
                            value={ride.name}
                            checked={rapidoRideName === ride.name}
                            onChange={(e) => setRapidoRideName(e.target.value)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              rapidoRideName === ride.name
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-600"
                            }`}
                          >
                            {rapidoRideName === ride.name && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`font-medium ${
                            rapidoRideName === ride.name
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {ride.name}
                        </span>
                      </div>
                      <span
                        className={`font-medium ${
                          rapidoRideName === ride.name
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {ride.price_range || "-"}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">
                    No Rapido rides available
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            disabled
            className={`w-full mt-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors ${
              rapidoRideName
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <span>
              {rapidoRideName ? "Service Unavailable" : "Book Rapido Ride"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

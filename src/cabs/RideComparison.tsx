// RideComparison.tsx - Updated for your API data
interface RideComparisonProps {
  olaData: any;
  rapidoData: any;
  uberData?: any; // Optional since you don't have Uber data yet
}

export default function RideComparison({
  olaData,
  rapidoData,
  uberData,
}: RideComparisonProps) {
  // Extract bike-specific info from Ola
  const getOlaBikeInfo = () => {
    if (!olaData?.rides) return null;
    const bikeRide = olaData.rides.find((ride: any) => ride.name === "Bike");
    return {
      price: bikeRide?.price || "Price not available",
      status: olaData.status,
      pickup: olaData.pickup_location,
      destination: olaData.destination_location,
    };
  };

  // Extract bike-specific info from Rapido
  const getRapidoBikeInfo = () => {
    if (!rapidoData?.rides) return null;
    const bikeRide = rapidoData.rides.find((ride: any) => ride.name === "Bike");
    return {
      price: bikeRide?.price_range || "Price not available",
      status: rapidoData.status,
      pickup: rapidoData.pickup_location,
      destination: rapidoData.drop_location,
    };
  };

  // Status display helper
  const renderStatus = (status: string) => {
    switch (status) {
      case "otp_sent":
        return <span className="text-yellow-400">OTP Sent</span>;
      case "success":
        return <span className="text-green-400">Available</span>;
      default:
        return <span className="text-gray-400">{status || "Checking..."}</span>;
    }
  };

  const olaBike = getOlaBikeInfo();
  const rapidoBike = getRapidoBikeInfo();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          🚗 Ride Comparison Results
        </h3>
        <div className="text-sm text-gray-400">
          Showing bike options from{" "}
          <span className="text-white">
            {olaBike?.pickup || rapidoBike?.pickup}
          </span>{" "}
          to{" "}
          <span className="text-white">
            {olaBike?.destination || rapidoBike?.destination}
          </span>
        </div>
      </div>

      {/* Comparison Grid - 2 or 3 columns based on data */}
      <div
        className={`grid gap-4 ${
          uberData ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {/* OLA Card */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-white">O</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Ola Bike</h4>
                <div className="text-xs text-gray-400">
                  {olaData?.phone_number}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {renderStatus(olaData?.status)}
              <div className="text-xs text-gray-400 mt-1">
                Session ID: {olaData?.session_id?.substring(0, 8)}...
              </div>
            </div>
          </div>

          {/* Bike Price Section */}
          <div className="mb-4 p-3 bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">Bike Price</div>
                <div className="text-2xl font-bold text-white">
                  {olaBike?.price || "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Ride Type</div>
                <div className="text-white font-medium">
                  {olaData?.ride_name || "Bike"}
                </div>
              </div>
            </div>
          </div>

          {/* All Available Rides */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">
              All Available Rides:
            </div>
            <div className="space-y-2">
              {olaData?.rides?.map((ride: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-900/30 rounded"
                >
                  <span
                    className={`${
                      ride.name === "Bike"
                        ? "text-blue-300 font-medium"
                        : "text-gray-300"
                    }`}
                  >
                    {ride.name}
                  </span>
                  <span className="text-gray-400">{ride.price || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <span>
              {olaData?.status === "otp_sent"
                ? "Verify OTP & Book"
                : "Book Ola Bike"}
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
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-white">R</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">
                  Rapido Bike
                </h4>
                <div className="text-xs text-gray-400">
                  {rapidoData?.phone_number}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {renderStatus(rapidoData?.status)}
              <div className="text-xs text-gray-400 mt-1">Price range</div>
            </div>
          </div>

          {/* Bike Price Section */}
          <div className="mb-4 p-3 bg-orange-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">Bike Price</div>
                <div className="text-2xl font-bold text-white">
                  {rapidoBike?.price || "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Best Value</div>
                <div className="text-green-400 font-medium">₹146 - ₹179</div>
              </div>
            </div>
          </div>

          {/* All Available Rides */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">
              All Available Rides:
            </div>
            <div className="space-y-2">
              {rapidoData?.rides?.map((ride: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-900/30 rounded"
                >
                  <span
                    className={`${
                      ride.name === "Bike"
                        ? "text-orange-300 font-medium"
                        : "text-gray-300"
                    }`}
                  >
                    {ride.name}
                  </span>
                  <span className="text-gray-400">
                    {ride.price_range || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <span>Book Rapido Bike</span>
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

        {/* UBER Card - Placeholder for now */}
        {uberData ? (
          <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-700/30 rounded-2xl p-5">
            {/* Uber content when data is available */}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 border border-dashed border-gray-700/50 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              <span className="font-bold text-gray-400">U</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-400 mb-2">Uber</h4>
            <p className="text-gray-500 text-sm text-center mb-4">
              Service checking...
            </p>
            <div className="animate-pulse text-gray-600">
              Fetching Uber data
            </div>
          </div>
        )}
      </div>

      {/* Summary Bar */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Route:{" "}
                <span className="text-white">Ghatkopar East → Juhu Beach</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Bike available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-300">OTP required</span>
            </div>
            {olaBike?.price && rapidoBike?.price && (
              <div className="text-sm">
                <span className="text-gray-400">Best price: </span>
                <span className="text-green-400 font-medium">
                  {(() => {
                    const olaPrice =
                      parseInt(olaBike.price.replace("₹", "").trim()) ||
                      Infinity;
                    const rapidoPrice =
                      parseInt(
                        rapidoBike.price.split("-")[0].replace("₹", "").trim()
                      ) || Infinity;
                    return olaPrice < rapidoPrice
                      ? `Ola: ₹${olaPrice}`
                      : `Rapido: ${rapidoBike.price.split("-")[0].trim()}`;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

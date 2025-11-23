import { useEffect, useState } from "react";

const FlowerLoader = () => {
  const [currentStage, setCurrentStage] = useState(0);

  const loaderStages = [
    "Thinking...",
    "Processing your request...",
    "Analyzing options...",
    "Working on your khwaaish...",
    "Opening the App...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % loaderStages.length);
    }, 5000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, [loaderStages.length]);

  return (
    <div className="flex justify-start">
      <div className="bg-gray-900/80 text-gray-100 border border-gray-800 max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="flower-loader">
            <img
              src="/images/Circle.png"
              alt="Loading..."
              className="flower-loader-image h-6"
            />
          </div>
          <span className="text-gray-400 text-sm">
            {loaderStages[currentStage]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlowerLoader;

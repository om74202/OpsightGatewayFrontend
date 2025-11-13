

import React, { useEffect, useState } from "react";
import { ThermometerSun, Cpu, HardDrive, MemoryStick, RefreshCw } from "lucide-react";
import axios from "axios";
import { useConfirm } from "../context/ConfirmContext";

export const HealthMonitoring = () => {
  const confirm = useConfirm();
  const [healthData, setHealthData] = useState({
    temperature: "",
    cpu: "",
    memory: "",
    disk: "",
  });
  // const [isLoading, setIsLoading] = useState(true);

  // Fetch health data from API
  const fetchHealthData = () => {
    // setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch health data");
        return res.json();
      })
      .then((data) => {
        setHealthData({
          temperature: data.temperature,
          cpu: data.cpuUsage,
          memory: data.memoryUsage,
          disk: data.diskUsage,
        });
        // setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Temperature",
      icon: <ThermometerSun className="w-6 h-6 text-orange-500" />,
      value: healthData.temperature,
      color: "from-orange-100 to-orange-200",
      threshold: 75,
    },
    {
      title: "CPU Utilization",
      icon: <Cpu className="w-6 h-6 text-blue-600" />,
      value: healthData.cpu,
      color: "from-blue-100 to-blue-200",
      threshold: 75,
    },
    {
      title: "Memory Usage",
      icon: <MemoryStick className="w-6 h-6 text-green-600" />,
      value: healthData.memory,
      color: "from-green-100 to-green-200",
      threshold: 90,
    },
    {
      title: "Disk Usage",
      icon: <HardDrive className="w-6 h-6 text-purple-600" />,
      value: healthData.disk,
      color: "from-purple-100 to-purple-200",
      threshold: 90,
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center h-auto py-8 space-y-8">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-7xl p-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            System Health Monitor
          </h2>
          <button
            onClick={fetchHealthData}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => {
            let numericValue = 0;
  let cardValue = card.value;

  if (card.title === "CPU Utilization") {
    // e.g. "83.5%" → 83.5
    numericValue = parseFloat(String(card.value).replace(/[^\d.]/g, "")) || 0;
  } else if (card.title === "Disk Usage" || card.title === "Memory Usage") {
    // e.g. "6.2GB/8GB" → (6.2/8)*100 = 77.5
    const match = String(card.value).match(/(\d+(?:\.\d+)?)\s*GB\s*\/\s*(\d+(?:\.\d+)?)\s*GB/i);
    if (match) {
      const used = parseFloat(match[1]);
      const total = parseFloat(match[2]);
      numericValue = total > 0 ? (used / total) * 100 : 0;
    }
  } else if (card.title === "Temperature") {
    // e.g. "80 °C" → 80
    numericValue = parseFloat(String(card.value).replace(/[^\d.]/g, "")) || 0;
  }
  console.log(cardValue,numericValue)
            

            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${card.color} p-5 rounded-xl shadow-md border ${
                  numericValue > card.threshold
                    ? "border-red-950 breathing-border"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                    {card.icon} {card.title}
                  </h3>
                </div>
                <p className="text-3xl font-bold mt-3 text-gray-900">
                  {/* {isLoading ? (
                    <span className="animate-pulse text-gray-500">...</span>
                  ) : (
                    card.value
                  )} */}
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Shutdown & Reboot Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={async () => {
              try {
                const ok = await confirm("Are you sure you want to Shutdown the device?");
                if (!ok) return;
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/system/shutdown`);
                alert(res.data.message);
              } catch (err) {
                console.error(err);
                alert("Failed to shutdown system");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Shutdown
          </button>

          <button
            onClick={async () => {
              try {
                const ok = await confirm("Are you sure you want to Reboot the device?");
                if (!ok) return;
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/system/reboot`);
                alert(res.data.message);
              } catch (err) {
                console.error(err);
                alert("Failed to reboot system");
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Reboot
          </button>
        </div>
      </div>
    </div>
  );
};

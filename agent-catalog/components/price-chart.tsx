"use client"

import { useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { Button } from "./ui/button"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale)

const options = {
  responsive: true,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      type: "time" as const,
      time: {
        unit: "day" as const,
      },
      grid: {
        display: false,
      },
    },
    y: {
      position: "right" as const,
      grid: {
        color: "rgba(107, 114, 128, 0.1)",
      },
      ticks: {
        callback: (value: any) => `$${value.toLocaleString()}`,
      },
    },
  },
}

function generateMockData(days: number) {
  const data = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    data.push({
      x: date.toISOString(),
      y: Math.random() * 1000 + 5000, // Random price between $5000 and $6000
    })
  }

  return data
}

const timeFrames = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
]

export function PriceChart({ priceHistory }: { priceHistory: any }) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(timeFrames[2]);

  const filteredData = priceHistory.filter(
    (d: { x: string | number | Date }) => new Date(d.x) >= new Date(Date.now() - selectedTimeFrame.days * 24 * 60 * 60 * 1000)
  );

  const data = {
    datasets: [
      {
        label: "Price",
        data: filteredData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold font-orbitron text-gray-800">
          {priceHistory.length ? `${priceHistory[priceHistory.length - 1].y.toFixed(4)} AIUS` : "Loading..."}
        </div>
        <div className="flex space-x-2">
          {timeFrames.map((tf) => (
            <Button
              key={tf.label}
              variant={selectedTimeFrame === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeFrame(tf)}
              className="font-roboto-mono"
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>
      <Line options={options} data={data} />
    </div>
  );
}

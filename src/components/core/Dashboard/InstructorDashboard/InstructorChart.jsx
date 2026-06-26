import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")

  // ✅ Add null/empty check
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
        <p className="text-lg font-bold text-richblack-5">Visualize</p>
        <p className="mt-4 text-xl font-medium text-richblack-50">
          No course data available
        </p>
      </div>
    )
  }

  const generateRandomColors = (numColors) => {
    const colors = []
    for (let i = 0; i < numColors; i++) {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
      colors.push(color)
    }
    return colors
  }

  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled || 0),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  }

  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated || 0),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
      <p className="text-lg font-bold text-richblack-5">Visualize</p>
      <div className="space-x-4 font-semibold">
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "students"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "income"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Income
        </button>
      </div>
      <div className="relative mx-auto flex h-full w-full min-h-[300px] items-center justify-center">
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>
    </div>
  )
}
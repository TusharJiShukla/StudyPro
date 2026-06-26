import React from "react";

import RenderSteps from "./RenderSteps";

export default function AddCourse() {
  return (
    <div className="text-white">
      <div className="flex gap-x-6">
        {/* LEFT SECTION */}
        <div className="flex-1">
          <h1 className="mb-10 text-3xl font-medium">Add Course</h1>

          <div className="rounded-md bg-richblack-800 p-6">
            <RenderSteps />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className=" h-fit rounded-md border border-richblack-700 bg-richblack-800 p-6 max-w-[400px] "
        >
          <p className="mb-8 text-lg font-semibold">⚡ Course Upload Tips</p>

          <ul
            className="ml-5 list-item  list-disc space-y-4 text-xs text-richblack-5"
          >
            <li>Set the Course Price option or make it free.</li>

            <li>Standard size for the course thumbnail is 1024x576.</li>

            <li>Video section controls the course overview video.</li>

            <li>Course Builder is where you create course lectures.</li>

            <li>Add Topics in the tags section.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const [loading, setLoading] = useState(true);

  const getEnrolledCourses = async () => {
    setLoading(true);
    try {
      const res = await getUserEnrolledCourses(token);
      console.log("Enrolled courses:", res);
      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch enrolled courses.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getEnrolledCourses();
    }
  }, [token]);

  // Add this to see progress updates when component mounts
  useEffect(() => {
    console.log("Current enrolled courses with progress:", enrolledCourses);
  }, [enrolledCourses]);

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-11/12 max-w-maxContent py-8">
      <h1 className="text-3xl font-semibold text-richblack-50">
        Enrolled Courses
      </h1>

      {!enrolledCourses || enrolledCourses.length === 0 ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-8">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500">
            <p className="w-[45%] px-5 py-3 font-medium text-richblack-5">
              Course Name
            </p>
            <p className="w-1/4 px-2 py-3 font-medium text-richblack-5">
              Duration
            </p>
            <p className="flex-1 px-2 py-3 font-medium text-richblack-5">
              Progress
            </p>
          </div>

          {/* Course List */}
          {enrolledCourses.map((course, i, arr) => {
            const progress = course.progressPercentage || 0;
            return (
              <div
                className={`flex items-center border border-richblack-700 ${
                  i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                }`}
                key={course._id || i}
              >
                <div
                  className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3 hover:bg-richblack-700 transition-all"
                  onClick={() => {
                    navigate(
                      `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`,
                    );
                  }}
                >
                  <img
                    src={course.thumbnail}
                    alt="course_img"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex max-w-xs flex-col gap-2">
                    <p className="font-semibold text-richblack-5">
                      {course.courseName}
                    </p>
                    <p className="text-xs text-richblack-300">
                      {course.courseDescription?.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription}
                    </p>
                  </div>
                </div>

                <div className="w-1/4 px-2 py-3 text-richblack-200">
                  {course?.totalDuration || "0s"}
                </div>

                {/* Custom Progress Bar - No external package needed */}
                <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                  <p className="text-sm text-richblack-200">
                    Progress: {progress}%
                  </p>
                  <div className="h-2 w-full rounded-full bg-richblack-700">
                    <div
                      className="h-2 rounded-full bg-yellow-50 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

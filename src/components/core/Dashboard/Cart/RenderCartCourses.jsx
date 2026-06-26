import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useDispatch, useSelector } from "react-redux"

import { removeFromCart } from "../../../../slices/cartSlice"
import RatingStars from "../../../common/RatingStars"  // ✅ Import your own component

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  
  // Calculate average rating for a course
  const getAvgRating = (course) => {
    if (!course?.ratingAndReviews || course.ratingAndReviews.length === 0) {
      return 0
    }
    const sum = course.ratingAndReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0)
    return sum / course.ratingAndReviews.length
  }
  
  return (
    <div className="flex flex-1 flex-col">
      {cart.map((course, indx) => {
        const avgRating = getAvgRating(course)
        
        return (
          <div
            key={course._id}
            className={`flex w-full flex-wrap items-start justify-between gap-6 ${
              indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"
            } ${indx !== 0 && "mt-6"} `}
          >
            <div className="flex flex-1 flex-col gap-4 xl:flex-row">
              <img
                src={course?.thumbnail}
                alt={course?.courseName}
                className="h-[148px] w-[220px] rounded-lg object-cover"
              />
              <div className="flex flex-col space-y-1">
                <p className="text-lg font-medium text-richblack-5">
                  {course?.courseName}
                </p>
                <p className="text-sm text-richblack-300">
                  {course?.category?.name || "General"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-5">{avgRating.toFixed(1)}</span>
                  
                  {/* ✅ Use your own RatingStars component */}
                  <RatingStars Review_Count={avgRating} Star_Size={20} />
                  
                  <span className="text-richblack-400">
                    {course?.ratingAndReviews?.length || 0} Ratings
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={() => dispatch(removeFromCart(course._id))}
                className="flex items-center gap-x-1 rounded-md border border-richblack-600 bg-richblack-700 py-3 px-[12px] text-pink-200"
              >
                <RiDeleteBin6Line />
                <span>Remove</span>
              </button>
              <p className="mb-6 text-3xl font-medium text-yellow-100">
                ₹ {course?.price}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
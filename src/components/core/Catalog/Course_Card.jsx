import React, { useEffect, useState } from 'react'
import RatingStars from '../../common/RatingStars'
import GetAvgRating from '../../../utils/avgRating';
import { Link } from 'react-router-dom';

const Course_Card = ({ course }) => {
  const [avgReviewCount, setAvgReviewCount] = useState(0);

  useEffect(() => {
    const count = GetAvgRating(course?.ratingAndReviews);
    setAvgReviewCount(count);
  }, [course]);

  return (
    <Link to={`/courses/${course?._id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-richblack-800 transition-all duration-200 hover:scale-105 hover:shadow-lg">
        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <img
            src={course?.thumbnail}
            alt={course?.courseName}
            className="h-40 w-full object-cover transition-all duration-200 group-hover:scale-110"
          />
          {/* Price Badge */}
          <div className="absolute bottom-2 right-2 rounded-md bg-richblack-900/90 px-2 py-1 text-sm font-semibold text-yellow-25 backdrop-blur-sm">
            ₹{course?.price}
          </div>
        </div>
        
        {/* Course Info */}
        <div className="p-3">
          <h3 className="line-clamp-1 text-base font-semibold text-richblack-5">
            {course?.courseName}
          </h3>
          <p className="mt-1 text-xs text-richblack-300">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </p>
          
          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            <span className="text-sm font-medium text-yellow-25">
              {avgReviewCount.toFixed(1)}
            </span>
            <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
            <span className="text-xs text-richblack-400">
              ({course?.ratingAndReviews?.length || 0})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Course_Card;
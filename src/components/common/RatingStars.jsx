import React, { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";

const RatingStars = ({ Review_Count, Star_Size }) => {
  const [starCount, setStarCount] = useState({
    full: 0,
    half: 0,
    empty: 0,
  });

  useEffect(() => {
    const rating = Review_Count || 0;
    const wholeStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    setStarCount({
      full: wholeStars,
      half: hasHalfStar ? 1 : 0,
      empty: hasHalfStar ? 4 - wholeStars : 5 - wholeStars,
    });
  }, [Review_Count]);

  return (
    <div className="flex gap-1 text-yellow-100">
      {[...Array(starCount.full)].map((_, i) => (
        <StarIcon key={i} size={Star_Size || 20} />
      ))}

      {[...Array(starCount.half)].map((_, i) => (
        <StarOutline key={i} size={Star_Size || 20} />
      ))}

      {[...Array(starCount.empty)].map((_, i) => (
        <StarOutline key={i} size={Star_Size || 20} />
      ))}
    </div>
  );
}

export default RatingStars;
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import { FreeMode, Pagination, Autoplay } from "swiper/modules";
import Course_Card from "./Course_Card";

const CourseSlider = ({ Courses }) => {
  if (!Courses?.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-richblack-800 p-8">
        <p className="text-center text-lg text-richblack-300">
          No courses found in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        loop={true}
        modules={[FreeMode, Pagination, Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        className="!px-1 py-4"
      >
        {Courses?.map((course) => (
          <SwiperSlide key={course._id}>
            <Course_Card course={course} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CourseSlider;
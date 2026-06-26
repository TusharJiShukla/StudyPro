import React from "react";

import { useSelector } from "react-redux";

import { FaCheck } from "react-icons/fa";

import CourseInformationForm from "./CourseInformation/CourseInformationForm";

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import PublishCourse from "./PublishCourse"

const RenderSteps = () => {

  const { step } = useSelector(
    (state) => state.course
  );

  const steps = [

    {
      id: 1,
      title: "Course Information",
    },

    {
      id: 2,
      title: "Course Builder",
    },

    {
      id: 3,
      title: "Publish",
    },
  ];

  return (
    <div>

      {/* Step Circles */}

      <div className="flex items-center justify-between">

        {steps.map((item) => (

          <React.Fragment key={item.id}>

            <div className="flex flex-col items-center">

              <div
                className={`
                  grid
                  aspect-square
                  w-[34px]
                  place-items-center
                  rounded-full
                  border-[1px]

                  ${
                    step === item.id
                      ? "border-yellow-50 bg-yellow-900 text-yellow-50"

                      : "border-richblack-700 bg-richblack-800 text-richblack-300"
                  }
                `}
              >

                {
                  step > item.id
                    ? <FaCheck />

                    : item.id
                }

              </div>
            </div>

            {/* DASHES */}

            {
              item.id !== steps.length && (

                <div
                  className={`
                    h-[1px]
                    w-full

                    ${
                      step > item.id
                        ? "bg-yellow-50"

                        : "bg-richblack-700"
                    }
                  `}
                ></div>
              )
            }

          </React.Fragment>
        ))}
      </div>

      {/* TITLES */}

      <div className="mt-3 flex justify-between">

        {steps.map((item) => (

          <div
            key={item.id}
            className="w-[130px] text-center text-sm"
          >

            {item.title}

          </div>
        ))}
      </div>

      {/* FORMS */}

      <div className="mt-8">

        {step === 1 && <CourseInformationForm />}

        {step === 2 && <CourseBuilderForm />}

        {step === 3 && <PublishCourse />}

      </div>
    </div>
  );
};

export default RenderSteps;
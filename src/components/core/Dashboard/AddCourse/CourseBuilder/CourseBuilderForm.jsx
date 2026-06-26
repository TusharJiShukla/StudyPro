import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI"
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import NestedView from "./NestedView"

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null)
  const dispatch = useDispatch()

  // ✅ Debug logs
  console.log("Course in Builder:", course)
  console.log("Token in Builder:", token)

  // ✅ Check if course exists
  if (!course) {
    return (
      <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <p className="text-center text-red-500 font-semibold">
          ❌ No course found! Please go back and create a course first.
        </p>
        <button
          onClick={() => dispatch(setStep(1))}
          className="mt-4 rounded-md bg-yellow-50 px-4 py-2 text-black"
        >
          ← Go Back to Step 1
        </button>
      </div>
    )
  }

  // handle form submission
const onSubmit = async (data) => {
  console.log("Form submitted with data:", data)
  
  if (!data.sectionName || data.sectionName.trim() === "") {
    toast.error("Please enter a section name")
    return
  }

  if (!course._id) {
    toast.error("Course ID not found")
    return
  }

  if (!token) {
    toast.error("Authentication failed. Please login again.")
    return
  }

  setLoading(true)
  const loadingToast = toast.loading("Creating section...")

  try {
    let result

    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      )
    } else {
      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token
      )
    }

    console.log("API Result:", result)

    // ✅ Check if result is a valid course object
    if (result && result._id && result.courseContent !== undefined) {
      console.log("✅ Dispatching course to Redux:", result)
      dispatch(setCourse(result))
      setEditSectionName(null)
      setValue("sectionName", "")
      toast.dismiss(loadingToast)
      toast.success(editSectionName ? "Section updated successfully!" : "Section created successfully!")
    } else {
      console.error("❌ Invalid result structure:", result)
      toast.dismiss(loadingToast)
      toast.error("Failed to create section - Invalid response from server")
    }
    
  } catch (error) {
    console.error("Error in onSubmit:", error)
    toast.dismiss(loadingToast)
    toast.error(error?.response?.data?.message || "Something went wrong")
  } finally {
    setLoading(false)
  }
}

  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit()
      return
    }
    setEditSectionName(sectionId)
    setValue("sectionName", sectionName)
  }

  const goToNext = () => {
    if (!course.courseContent || course.courseContent.length === 0) {
      toast.error("Please add atleast one section")
      return
    }
    if (
      course.courseContent.some((section) => !section.subSection || section.subSection.length === 0)
    ) {
      toast.error("Please add atleast one lecture in each section")
      return
    }
    dispatch(setStep(3))
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>
      
      {/* ✅ Show course info for debugging */}
      <div className="text-sm text-richblack-300 bg-richblack-900 p-2 rounded">
        Course: {course.courseName || "Untitled"} (ID: {course._id})
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            Section Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: "Section name is required" })}
            className="form-style w-full"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              {errors.sectionName.message}
            </span>
          )}
        </div>
        <div className="flex items-end gap-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-yellow-50 py-2 px-5 font-semibold text-richblack-900"
          >
            <IoAddCircleOutline size={20} />
            {loading ? "Processing..." : (editSectionName ? "Edit Section Name" : "Create Section")}
          </button>
          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      
      {course.courseContent && course.courseContent.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}
      
      {/* Next Prev Button */}
      <div className="flex justify-end gap-x-3">
        <button
          onClick={goBack}
          className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-2 px-5 font-semibold text-richblack-900"
        >
          Back
        </button>
        <button
          onClick={goToNext}
          disabled={loading}
          className="flex cursor-pointer items-center gap-x-2 rounded-md bg-yellow-50 py-2 px-5 font-semibold text-richblack-900"
        >
          Next <MdNavigateNext />
        </button>
      </div>
    </div>
  )
}
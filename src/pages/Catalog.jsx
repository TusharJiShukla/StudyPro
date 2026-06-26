import React, { useEffect, useState } from "react";
import Footer from "../components/common/Footer";
import { useParams } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { categories } from "../services/apis";
import { getCatalogPageData } from "../services/operations/pageAndComponentData";
import Course_Card from "../components/core/Catalog/Course_Card";
import CourseSlider from "../components/core/Catalog/CourseSlider";
import { useSelector } from "react-redux";
import Error from "./Error";

const Catalog = () => {
  const { loading } = useSelector((state) => state.profile);
  const { catalogName } = useParams();
  const [active, setActive] = useState(1);
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const getCategories = async () => {
      const res = await apiConnector("GET", categories.CATEGORIES_API);
      const category = res?.data?.data?.find(
        (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName,
      );
      if (category) {
        setCategoryId(category._id);
      }
    };
    getCategories();
  }, [catalogName]);

  useEffect(() => {
    const getCategoryDetails = async () => {
      try {
        const res = await getCatalogPageData(categoryId);
        setCatalogPageData(res);
      } catch (error) {
        console.log(error);
      }
    };
    if (categoryId) {
      getCategoryDetails();
    }
  }, [categoryId]);

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!loading && !catalogPageData.success) {
    return <Error />;
  }

  const selectedCategory = catalogPageData?.data?.selectedCategory;
  const mostPopularCourses = selectedCategory?.mostPopularCourses || [];
  const newCourses = selectedCategory?.newCourses || [];
  const differentCategory = catalogPageData?.data?.differentCategory;
  const mostSellingCourses = catalogPageData?.data?.mostSellingCourses || [];

  return (
    <>
      {/* Hero Section */}
      <div className="bg-richblack-800">
        <div className="mx-auto w-11/12 max-w-maxContent px-4 py-12 lg:py-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-richblack-300">Home</span>
              <span className="text-richblack-300">/</span>
              <span className="text-richblack-300">Catalog</span>
              <span className="text-richblack-300">/</span>
              <span className="text-yellow-25 font-medium">
                {selectedCategory?.name}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-richblack-5 lg:text-5xl">
              {selectedCategory?.name}
            </h1>
            <p className="max-w-2xl text-base text-richblack-200 lg:text-lg">
              {selectedCategory?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1 - Most Popular & New */}
      <div className="mx-auto w-11/12 max-w-maxContent px-4 py-12">
        <div className="mb-8">
          <h2 className="section_heading text-2xl font-semibold text-richblack-5 lg:text-3xl">
            Courses to get you started
          </h2>
        </div>
        
        <div className="mb-6 flex gap-1 border-b border-b-richblack-600">
          <button
            className={`px-6 py-3 text-base font-medium transition-all duration-200 ${
              active === 1
                ? "border-b-2 border-b-yellow-25 text-yellow-25"
                : "text-richblack-200 hover:text-richblack-100"
            }`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </button>
          <button
            className={`px-6 py-3 text-base font-medium transition-all duration-200 ${
              active === 2
                ? "border-b-2 border-b-yellow-25 text-yellow-25"
                : "text-richblack-200 hover:text-richblack-100"
            }`}
            onClick={() => setActive(2)}
          >
            New
          </button>
        </div>
        
        <CourseSlider
          Courses={active === 1 ? mostPopularCourses : newCourses}
        />
      </div>

      {/* Section 2 - Top courses in different category */}
      {differentCategory && differentCategory.course?.length > 0 && (
        <div className="mx-auto w-11/12 max-w-maxContent px-4 py-12">
          <div className="mb-8">
            <h2 className="section_heading text-2xl font-semibold text-richblack-5 lg:text-3xl">
              Top courses in {differentCategory?.name}
            </h2>
          </div>
          <CourseSlider Courses={differentCategory?.course || []} />
        </div>
      )}

      {/* Section 3 - Frequently Bought */}
      {mostSellingCourses.length > 0 && (
        <div className="mx-auto w-11/12 max-w-maxContent px-4 py-12">
          <div className="mb-8">
            <h2 className="section_heading text-2xl font-semibold text-richblack-5 lg:text-3xl">
              Frequently Bought
            </h2>
            <p className="mt-2 text-richblack-300">
              Most popular courses loved by our students
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mostSellingCourses.slice(0, 4).map((course) => (
              <Course_Card key={course._id} course={course} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Catalog;
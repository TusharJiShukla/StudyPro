const Category = require("../models/Category");
const Course = require("../models/Course");

// CREATE Category HANDLER FUNCTION
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // CREATE ENTRY IN DB
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    // RETURN RESPONSE
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL Category HANDLER FUNCTION
exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find({});
    res.status(200).json({
      success: true,
      data: allCategorys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// categoryPageDetails

// Helper function
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log("PRINTING CATEGORY ID: ", categoryId);
    
    // 1. Get selected category with its courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "course",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    // ✅ Get All Courses in this category
    const categoryCourses = selectedCategory.course || [];
    
    // ✅ 2. Sort courses for "Most Popular" (by studentsEnrolled count)
    const mostPopularCourses = [...categoryCourses]
      .sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
      .slice(0, 10);
    
    // ✅ 3. Sort courses for "New" (by createdAt date)
    const newCourses = [...categoryCourses]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    // 4. Get courses for other categories (random)
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });
    
    let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      const randomIndex = getRandomInt(categoriesExceptSelected.length);
      differentCategory = await Category.findById(
        categoriesExceptSelected[randomIndex]._id
      )
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: {
            path: "instructor",
            select: "firstName lastName",
          },
        })
        .exec();
    }
    
    // 5. Get top-selling courses across all categories (by studentsEnrolled)
    const allCategories = await Category.find()
      .populate({
        path: "course",
        match: { status: "Published" },
        populate: {
          path: "instructor",
          select: "firstName lastName",
        },
      })
      .exec();
    
    const allCourses = allCategories.flatMap((category) => category.course || []);
    
    // ✅ Sort by studentsEnrolled count for "Frequently Bought"
    const mostSellingCourses = allCourses
      .sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
      .slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: {
        selectedCategory: {
          ...selectedCategory.toObject(),
          mostPopularCourses,
          newCourses,
        },
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
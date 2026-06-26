import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import {toast} from "react-hot-toast";
import { useLocation } from "react-router-dom"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../common/IconBtn"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { apiConnector } from "../../../services/apiconnector";
import { courseEndpoints } from "../../../services/apis";
import ReactMarkdown from "react-markdown";
import { FaRobot, FaClipboardCheck } from "react-icons/fa";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [doubtText, setDoubtText] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  
  // AI Quiz States
  const [activeTab, setActiveTab] = useState("AskAI")
  const [quizConfig, setQuizConfig] = useState({ numQuestions: 5, difficulty: "Medium", quizType: "MCQ" })
  const [quizData, setQuizData] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [userAnswers, setUserAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useEffect(() => {
    ;(async () => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        // console.log("courseSectionData", courseSectionData)
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        // console.log("filteredData", filteredData)
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        // console.log("filteredVideoData", filteredVideoData)
        setVideoData(filteredVideoData[0])
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname])

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    // console.log("no of subsections", noOfSubsections)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      )
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      )
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

const handleLectureCompletion = async () => {
  setLoading(true)
  const res = await markLectureAsComplete(
    { courseId: courseId, subsectionId: subSectionId },
    token
  )
  if (res) {
    dispatch(updateCompletedLectures(subSectionId))
    toast.success("Lecture marked as completed!")
    
    // ✅ Refresh enrolled courses to update progress
    const updatedCourses = await getUserEnrolledCourses(token);
    // You might need to update Redux store here
  } else {
    toast.error("Failed to mark lecture as completed")
  }
  setLoading(false)
}

const handleAskDoubt = async () => {
  if (!doubtText.trim()) return;
  setAiLoading(true);
  try {
    const res = await apiConnector("POST", courseEndpoints.ASK_DOUBT_API, {
      question: doubtText,
      videoTitle: videoData?.title,
      videoDescription: videoData?.description
    }, {
      Authorization: `Bearer ${token}`
    });
    
    if (res.data.success) {
      setAiResponse(res.data.answer);
    } else {
      toast.error("Failed to fetch response from AI");
    }
  } catch (error) {
    console.error(error);
    toast.error("Could not reach AI Assistant");
  }
  setAiLoading(false);
}

const handleGenerateQuiz = async () => {
  setQuizLoading(true);
  setQuizData(null);
  setQuizSubmitted(false);
  setUserAnswers({});
  
  try {
    const res = await apiConnector("POST", courseEndpoints.GENERATE_QUIZ_API, {
      videoTitle: videoData?.title,
      videoDescription: videoData?.description,
      numQuestions: quizConfig.numQuestions,
      difficulty: quizConfig.difficulty,
      quizType: quizConfig.quizType
    }, {
      Authorization: `Bearer ${token}`
    });
    
    if (res.data.success) {
      setQuizData(res.data.quiz);
    } else {
      toast.error("Failed to generate quiz");
    }
  } catch (error) {
    console.error(error);
    toast.error("Could not reach AI Quiz Generator");
  }
  setQuizLoading(false);
}

const handleQuizSubmit = () => {
  let score = 0;
  quizData.forEach((q) => {
    if (userAnswers[q.id] === q.answer) {
      score++;
    }
  });
  setQuizScore(score);
  setQuizSubmitted(true);
}

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <div className="relative">
          <video
            ref={playerRef}
            controls
            playsInline
            className="w-full rounded-md"
            src={videoData?.videoUrl}
            onEnded={() => setVideoEnded(true)}
          />
          {/* Render When Video Ends */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  if (playerRef?.current) {
                    // set the current time of the video to 0
                    playerRef.current.currentTime = 0;
                    playerRef.current.play();
                    setVideoEnded(false)
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />
              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>

      {/* AI Features Tabs */}
      <div className="mt-8 mb-10 md:mb-16 rounded-lg border border-richblack-700 bg-richblack-800 p-4 md:p-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 border-b border-richblack-700 pb-4 mb-6">
          <button
            onClick={() => setActiveTab("AskAI")}
            className={`flex items-center gap-2 text-base md:text-lg font-semibold transition-all ${activeTab === "AskAI" ? "text-yellow-50 border-b-2 border-yellow-50 pb-1" : "text-richblack-300 hover:text-richblack-100"}`}
          >
            <FaRobot className="text-xl" />
            <span>Ask AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab("Quiz")}
            className={`flex items-center gap-2 text-base md:text-lg font-semibold transition-all ${activeTab === "Quiz" ? "text-yellow-50 border-b-2 border-yellow-50 pb-1" : "text-richblack-300 hover:text-richblack-100"}`}
          >
            <FaClipboardCheck className="text-xl" />
            <span>Test Yourself</span>
          </button>
        </div>

        {activeTab === "AskAI" && (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-richblack-300 text-center">Have a doubt about this lecture? Ask our AI assistant!</p>
            <div className="flex flex-col gap-4 w-full">
              <textarea
                className="w-full rounded-md bg-richblack-700 p-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                rows="3"
                placeholder="E.g., Can you explain the second formula in simpler terms?"
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
              />
              <button
                onClick={handleAskDoubt}
                disabled={aiLoading || !doubtText.trim()}
                className="w-fit mx-auto rounded-md bg-yellow-50 px-6 py-2 font-semibold text-richblack-900 transition-all duration-200 hover:scale-95 disabled:opacity-50"
              >
                {aiLoading ? "Asking AI..." : "Ask Doubt"}
              </button>
            </div>

            {aiResponse && (
              <div className="mt-6 w-full rounded-md bg-richblack-900 p-4 border border-richblack-700">
                <h3 className="font-semibold text-yellow-50 mb-2">AI Response:</h3>
                <div className="text-richblack-50 prose prose-invert max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Quiz" && (
          <div className="flex flex-col items-center w-full">
            {!quizData && !quizLoading && (
              <div className="flex flex-col gap-5 items-center w-full">
                <p className="text-richblack-300 text-center">Configure your AI Quiz to test your knowledge.</p>
                <div className="flex flex-wrap justify-center gap-6 items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-richblack-50">Questions</label>
                    <select 
                      className="bg-richblack-700 p-2 rounded-md text-richblack-5"
                      value={quizConfig.numQuestions}
                      onChange={(e) => setQuizConfig({...quizConfig, numQuestions: parseInt(e.target.value)})}
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-richblack-50">Difficulty</label>
                    <select 
                      className="bg-richblack-700 p-2 rounded-md text-richblack-5"
                      value={quizConfig.difficulty}
                      onChange={(e) => setQuizConfig({...quizConfig, difficulty: e.target.value})}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-richblack-50">Type</label>
                    <select 
                      className="bg-richblack-700 p-2 rounded-md text-richblack-5"
                      value={quizConfig.quizType}
                      onChange={(e) => setQuizConfig({...quizConfig, quizType: e.target.value})}
                    >
                      <option value="MCQ">Standard MCQ</option>
                      <option value="True / False">True / False</option>
                      <option value="Code Output">Code Output</option>
                      <option value="Find the Error">Find the Error</option>
                      <option value="Interview Questions">Interview Questions</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  className="w-fit mx-auto mt-2 rounded-md bg-yellow-50 px-6 py-2 font-semibold text-richblack-900 hover:scale-95 transition-all"
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            {quizLoading && (
              <div className="flex justify-center items-center py-10 gap-3">
                <FaRobot className="text-3xl text-yellow-50 animate-bounce" />
                <p className="text-yellow-50 font-semibold animate-pulse text-lg">AI is crafting your quiz...</p>
              </div>
            )}

            {quizData && (
              <div className="flex flex-col gap-8 w-full">
                {quizData.map((q, index) => (
                  <div key={q.id} className="bg-richblack-900 p-5 rounded-md border border-richblack-700">
                    <div className="text-lg font-semibold text-richblack-5 mb-4 prose prose-invert max-w-none">
                      <ReactMarkdown>{`**Q${index + 1}.** ${q.question}`}</ReactMarkdown>
                    </div>
                    <div className="flex flex-col gap-3">
                      {q.options.map((opt, i) => {
                        let btnClass = "border-richblack-600 bg-richblack-800 text-richblack-5";
                        if (userAnswers[q.id] === opt) {
                          btnClass = "border-yellow-50 bg-yellow-50 text-richblack-900";
                        }
                        if (quizSubmitted) {
                          if (opt === q.answer) {
                            btnClass = "border-caribbeangreen-200 bg-caribbeangreen-100 text-richblack-900 font-bold";
                          } else if (userAnswers[q.id] === opt && opt !== q.answer) {
                            btnClass = "border-pink-200 bg-pink-100 text-richblack-900 line-through";
                          } else {
                            btnClass = "border-richblack-700 bg-richblack-800 text-richblack-300 opacity-50";
                          }
                        }
                        return (
                          <button
                            key={i}
                            disabled={quizSubmitted}
                            onClick={() => setUserAnswers({...userAnswers, [q.id]: opt})}
                            className={`text-left w-full p-3 rounded-md border transition-all ${btnClass}`}
                          >
                            <ReactMarkdown>{opt}</ReactMarkdown>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(userAnswers).length !== quizData.length}
                    className="w-full py-3 rounded-md bg-yellow-50 text-richblack-900 font-bold hover:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="flex flex-col items-center p-6 bg-richblack-900 rounded-md border border-richblack-700 gap-4">
                    <h3 className="text-2xl font-bold text-white">Your Score</h3>
                    <p className={`text-4xl font-black ${quizScore === quizData.length ? 'text-caribbeangreen-100' : 'text-yellow-50'}`}>
                      {quizScore} / {quizData.length}
                    </p>
                    <button
                      onClick={() => setQuizData(null)}
                      className="mt-2 text-richblack-300 hover:text-white underline"
                    >
                      Take another quiz
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

export default VideoDetails
// video
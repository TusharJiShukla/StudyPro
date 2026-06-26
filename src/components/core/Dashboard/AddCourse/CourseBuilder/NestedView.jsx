// NestedView.jsx

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RxDropdownMenu } from "react-icons/rx";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { BiDownArrow } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";

import SubSectionModal from "./SubSectionModal";
import ConfirmationModal from "../../../../common/ConfirmationModal";

import {
  deleteSection,
  deleteSubSection,
} from "../../../../../services/operations/courseDetailsAPI";

import { setCourse } from "../../../../../slices/courseSlice";

const NestedView = ({ handleChangeEditSectionName }) => {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);

  const [confirmationModal, setConfirmationModal] = useState(null);

  // delete section
  const handleDeleteSection = async (sectionId) => {
    const result = await deleteSection(
      {
        sectionId,
        courseId: course._id,
      },
      token,
    );

    if (result) {
      dispatch(setCourse(result));
    }

    setConfirmationModal(null);
  };

  // delete subsection
  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection(
      {
        subSectionId,
        sectionId,
      },
      token,
    );

    if (result) {
      dispatch(setCourse(result));
    }

    setConfirmationModal(null);
  };

  return (
    <div>
      <div className="mt-6 rounded-lg bg-richblack-700 p-6 px-8">
        {course?.courseContent?.map((section) => (
          <details key={section._id} open>
            <summary className="flex items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-5">
              {/* left */}
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu />

                <p>{section.sectionName}</p>
              </div>

              {/* right */}
              <div className="flex items-center gap-x-3">
                {/* edit */}
                <button
                  onClick={() =>
                    handleChangeEditSectionName(
                      section._id,
                      section.sectionName,
                    )
                  }
                >
                  <MdEdit />
                </button>

                {/* delete */}
                <button
                  onClick={() => {
                    setConfirmationModal({
                      text1: "Delete this Section",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",

                      btn1Handler: () => handleDeleteSection(section._id),

                      btn2Handler: () => setConfirmationModal(null),
                    });
                  }}
                >
                  <RiDeleteBinLine />
                </button>

                <span>|</span>

                <BiDownArrow className="text-xl text-richblack-300" />
              </div>
            </summary>

            {/* subsections */}
            <div>
              {section.subSection.map((data) => (
                <div
                  key={data._id}
                  onClick={() => setViewSubSection(data)}
                  className="flex items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-4"
                >
                  {/* left */}
                  <div className="flex items-center gap-x-3">
                    <RxDropdownMenu />

                    <p>{data.title}</p>
                  </div>

                  {/* right */}
                  <div 
                  onClick={(e)=>e.stopPropagation()}
                  className="flex items-center gap-x-3">
                    {/* edit */}
                    <button
                      onClick={() =>
                        setEditSubSection({
                          ...data,
                          sectionId: section._id,
                        })
                      }
                    >
                      <MdEdit />
                    </button>

                    {/* delete */}
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          text1: "Delete this Sub Section",
                          text2: "selected lecture will be deleted",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",

                          btn1Handler: () =>
                            handleDeleteSubSection(data._id, section._id),

                          btn2Handler: () => setConfirmationModal(null),
                        });
                      }}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* add lecture */}
            <button
              onClick={() => setAddSubSection(section._id)}
              className="mt-3 flex items-center gap-x-1 text-yellow-50"
            >
              <AiOutlinePlus />

              <p>Add Lecture</p>
            </button>
          </details>
        ))}
      </div>

      {/* add subsection modal */}
      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      ) : viewSubSection ? (
        // view subsection
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        // edit subsection
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : (
        <div></div>
      )}

      {/* confirmation modal */}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default NestedView;

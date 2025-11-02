import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { feedbackSchema } from "../../validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "../../services/feedback.service";
import ButtonLoader from "../../components/shared/loaders/ButtonLoader";

const Feedback = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.feedback.loading);

  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      // Prepend selected category to suggestion text for easier triage without changing backend contract
      suggestion: category ? `[${category}] ${data.suggestion}` : data.suggestion,
    };
    dispatch(createFeedback(payload))
      .unwrap()
      .then(() => {
        reset();
        setRating(0);
        setCategory("");
      })
      .catch((error) => {
        console.error("Error creating feedback:", error);
      });
  };

  return (
    <>
      <Helmet>
        <title>Give Feedback - Metro HR</title>
      </Helmet>
      <section className="h-[90vh] sm:h-screen overflow-hidden bg-gray-50">
        <main className="flex justify-center items-center w-full h-full text-black font-medium">
          <div className="w-[94%] sm:w-[490px] rounded-2xl border border-gray-200  bg-white shadow-2xl">
            <div className="flex flex-col items-center py-8">
              <h1 className="text-[1.3rem] mt-3 font-extrabold flex items-center gap-2">
                <i className="fa-regular fa-comments"></i>
                Give Your Feedback
              </h1>
            </div>

            <form
              id="feedback-form"
              className="flex flex-col items-center gap-2 pb-8"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="w-[85%] relative">
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full bg-[#EFEFEF] text-center text-sm p-[18px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-[500]`}
                  disabled={loading}
                >
                  <option value="">--- Select Category (optional) ---</option>
                  <option value="Work Environment">Work Environment</option>
                  <option value="Compensation & Benefits">Compensation & Benefits</option>
                  <option value="Management & Leadership">Management & Leadership</option>
                  <option value="Career Growth">Career Growth</option>
                  <option value="Training & Development">Training & Development</option>
                  <option value="Policies & Compliance">Policies & Compliance</option>
                  <option value="Facilities & Tools">Facilities & Tools</option>
                  <option value="Work-Life Balance">Work-Life Balance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="w-[85%] relative">
                <select
                  id="select"
                  {...register("rating")}
                  className={`w-full bg-[#EFEFEF] text-center text-sm p-[18px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-[500]
                  ${errors.rating && "border border-red-500"}
                  `}
                  required
                  disabled={loading}
                >
                  <option value="">--- Select Rating ---</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
                {errors.rating && (
                  <p className="text-red-500 text-xs mt-1 ml-3">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              <div className="w-[85%]">
                <input
                  type="text"
                  {...register("suggestion")}
                  placeholder="Any suggestions?"
                  className={`w-full bg-[#EFEFEF] text-sm text-center p-[18px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-[500]
                  ${errors.suggestion && "border border-red-500"}
                  `}
                  // required
                  disabled={loading}
                />
                {errors.suggestion && (
                  <p className="text-red-500 text-xs mt-1 ml-3">
                    {errors.suggestion.message}
                  </p>
                )}
              </div>

              <div className="w-[85%]">
                <textarea
                  {...register("description")}
                  placeholder="Write your feedback..."
                  rows="4"
                  className={`w-full bg-[#EFEFEF] text-sm p-[18px] rounded-lg focus:outline focus:outline-2 focus:outline-gray-700 font-[500]
                  ${errors.description && "border border-red-500"}
                  `}
                  required
                  disabled={loading}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 ml-3">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-[85%] rounded-full bg-blue-600 disabled:bg-blue-500I p-4 text-sm text-white transition hover:bg-blue-700"
              >
                {loading ? (
                  <span className="flex items-center justify-center text-[0.8rem]">
                    <ButtonLoader />
                    Submitting
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          </div>
        </main>
      </section>
    </>
  );
};

export default Feedback;

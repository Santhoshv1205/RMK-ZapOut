import { useState } from "react";

export default function NeedHelp() {
  const [feedback, setFeedback] = useState({
    rating: 0,
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // submit feedback → send to backend (admin can view)
  const handleSubmit = async () => {
    if (!feedback.rating || !feedback.message) {
      alert("Please give rating and feedback");
      return;
    }

    try {
      // CONNECT YOUR BACKEND HERE
      // example API endpoint
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      setSubmitted(true);
      setFeedback({ rating: 0, message: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-[#0f172a] to-[#020617]">

      <h1 className="text-3xl text-cyan-300 font-semibold mb-6">Need Help</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <GlassCard title="Quick Help">
          <AccordionItem
            title="How to apply Gate Pass"
            content="Go to Dashboard → Apply Gate Pass → Fill details → Submit."
          />
          <AccordionItem
            title="How On-Duty works"
            content="Apply OD → Approval → QR generated → Exit allowed."
          />
          <AccordionItem
            title="Approval flow explanation"
            content="Student → Counsellor → HOD → Warden → Exit."
          />
        </GlassCard>

        <GlassCard title="Rules & Policies">
          <AccordionItem
            title="Gate pass limits"
            content="Gate passes are limited per week as per policy."
          />
          <AccordionItem
            title="On-duty eligibility"
            content="Only eligible students with valid reasons can apply."
          />
          <AccordionItem
            title="Late return consequences"
            content="Late returns may lead to warnings or restrictions."
            danger
          />
        </GlassCard>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        <GlassCard title="FAQs">
          <AccordionItem
            title="Why was my request rejected?"
            content="It may violate eligibility, timing, or approval rules."
          />
          <AccordionItem
            title="How long does approval take?"
            content="Usually between 30 minutes to 2 hours."
          />
          <AccordionItem
            title="Can I cancel a request?"
            content="Yes, before final approval."
          />
        </GlassCard>

        {/* Feedback Card */}
        <GlassCard title="Feedback">

          {submitted && (
            <p className="text-green-400 mb-3">
              Feedback submitted successfully ✔
            </p>
          )}

          {/* Star Rating */}
          <div className="flex gap-2 mb-4 text-3xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setFeedback({ ...feedback, rating: star })}
                className={`transition ${
                  star <= feedback.rating
                    ? "text-yellow-400 scale-110"
                    : "text-gray-500 hover:text-yellow-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded outline-none"
            rows="4"
            placeholder="Share your feedback"
            value={feedback.message}
            onChange={(e) =>
              setFeedback({ ...feedback, message: e.target.value })
            }
          />

          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-cyan-600 rounded hover:bg-green-700 transition"
          >
            Submit Feedback
          </button>

        </GlassCard>

      </div>

    </div>
  );
}

function AccordionItem({ title, content, danger }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 border border-white/20 rounded">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 flex justify-between items-center"
      >
        <span className={danger ? "text-red-300" : ""}>{title}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 text-sm opacity-80">
          {content}
        </div>
      )}
    </div>
  );
}

function GlassCard({ title, children }) {
  return (
    <div className="p-5 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
import { useState } from "react";

const DEONeedHelp = () => {
  const [form, setForm] = useState({
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.subject || !form.message) {
      alert("Please fill all fields");
      return;
    }

    console.log("Help Request:", form);

    // later connect API here
    // axios.post("/api/help", form)

    setSubmitted(true);
    setForm({ subject: "", message: "" });
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">Need Help</h1>

      <div className="bg-[#0f172a] rounded-xl shadow-lg p-6 max-w-lg">
        {submitted && (
          <div className="bg-green-600 text-white p-3 rounded mb-4">
            Request submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full p-3 rounded bg-[#1e293b] border border-gray-600 focus:outline-none"
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 rounded bg-[#1e293b] border border-gray-600 focus:outline-none"
              placeholder="Describe your issue"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default DEONeedHelp;
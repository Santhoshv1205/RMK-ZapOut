import { useState } from "react";
import ScanSection from "./ScanSection";
import ApprovedRequestsTable from "./ApprovedRequestsTable";

export default function WatchmanHome() {
  const [requests, setRequests] = useState([]);

  return (
    <>
      {/* HEADER — same style as staff */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          HOD Approved{" "}
          <span className="text-[#53cf57]">Gate Pass Requests</span>
        </h1>

        <p className="text-gray-300 mt-2">
          Scan student ID cards and verify approved gate pass requests.
        </p>
      </div>

      {/* GLASS CARD */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <ScanSection />
        <ApprovedRequestsTable requests={requests} />
      </div>
    </>
  );
}
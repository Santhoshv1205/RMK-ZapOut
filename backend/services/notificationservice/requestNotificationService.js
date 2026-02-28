import { sendWhatsAppMessage } from "../whatsapp/whatsappService.js";
import db from "../../config/db.js";

/* ================= DATE FORMAT ================= */

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ================= TIME FORMAT ================= */

const formatTime = (timeValue) => {
  if (!timeValue) return "-";

  return new Date(`1970-01-01T${timeValue}`).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* ================= MAIN FUNCTION ================= */

export const notifyStageChange = async (requestId, stage, staffId, staffRole) => {
  try {

     const [rows] = await db.query(
      `SELECT 
        u.username AS student_name,
        u.register_number,
        s.father_mobile,
        s.mother_mobile,
        s.guardian_mobile,
        r.request_type,
        r.status,
        cu.username AS counsellor_name,
        hu.username AS hod_name,
        co_user.username AS coordinator_name,
        od.event_type,
        od.event_name,
        od.college,
        od.location,
        od.from_date AS od_from,
        od.to_date AS od_to,
        od.total_days AS od_total_days,
        gp.reason,
        gp.from_date AS gp_from,
        gp.to_date AS gp_to,
        gp.total_days AS gp_total_days,
        gp.time_of_leaving
      FROM requests r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN counsellors cs ON cs.id = s.counsellor_id
      LEFT JOIN users cu ON cs.user_id = cu.id
      LEFT JOIN coordinators co ON co.department_id = s.department_id AND co.year = s.year_of_study
      LEFT JOIN users co_user ON co.user_id = co_user.id
      LEFT JOIN hods h ON s.department_id = h.department_id
      LEFT JOIN users hu ON h.user_id = hu.id
      LEFT JOIN on_duty_details od ON od.request_id = r.id
      LEFT JOIN gate_pass_details gp ON gp.request_id = r.id
      WHERE r.id = ?`,
      [requestId]
    );

    if (!rows.length) return;

    const data = rows[0];

    /* ================= PARENT NUMBER ================= */

    const parentPhone =
      data.guardian_mobile || data.father_mobile || data.mother_mobile;

    if (!parentPhone) {
      console.log("No parent phone available");
      return;
    }
let approverName = null;
    if (staffRole === "COUNSELLOR") {
      approverName = data.counsellor_name;
    } else if (staffRole === "COORDINATOR") {
      // If coordinator is acting as counsellor, use actual coordinator
      approverName = data.coordinator_name;
    }

    // Fallback
    if (!approverName) approverName = "-";
    let detailsBlock = "";
    let message = "";

    /* ================= ON DUTY DETAILS ================= */

    if (data.request_type === "ON_DUTY") {

      const fromDate = formatDate(data.od_from);
      const toDate = formatDate(data.od_to);
      const totalDays = data.od_total_days || 0;

      detailsBlock = `
📄 *Request Type:* ON DUTY

📌 *Event Type:* ${data.event_type || "-"}
📌 *Event Name:* ${data.event_name || "-"}
🏫 *College:* ${data.college || "-"}
📍 *Location:* ${data.location || "-"}

📅 *From Date:* ${fromDate}
📅 *To Date:* ${toDate}
📆 *Total Number of Days:* ${totalDays}`;
    }

    /* ================= GATE PASS DETAILS ================= */

    if (data.request_type === "GATE_PASS") {

      const departureDate = formatDate(data.gp_from);
      const returnDate = formatDate(data.gp_to);
      const totalDays = data.gp_total_days || 0;
      const timeOfLeaving = formatTime(data.time_of_leaving);

      detailsBlock = `
📄 *Request Type:* GATE PASS

📅 *Date of Departure:* ${departureDate}
⏰ *Time of Leaving:* ${timeOfLeaving}
📅 *Expected Date of Return:* ${returnDate}
📆 *Total Number of Days:* ${totalDays}

📝 *Purpose of Outing:* ${data.reason || "-"}`;
    }

    /* ============================================================
       ================= COUNSELLOR APPROVAL ======================
       ============================================================ */

    if (stage === "COUNSELLOR_APPROVED") {

      message =
`🎓 *RMK ZapOut Notification*

This is to inform you that

*${data.student_name}* (${data.register_number})
has been approved by the Counsellor
👤 *Counsellor:* ${approverName}

${detailsBlock}

The request has been forwarded for further approval.

Regards,
RMK Engineering College`;
    }

    /* ============================================================
       ================= HOD FINAL APPROVAL =======================
       ============================================================ */

    if (stage === "HOD_APPROVED") {

      message =
`🎓 *RMK ZapOut - Final Approval*

This is to inform you that

*${data.student_name}* (${data.register_number})
has received final approval from the HOD
👤 *HOD:* ${data.hod_name || "-"}

${detailsBlock}

Thank you for your cooperation.

Regards,
RMK Engineering College`;
    }

    /* ================= SEND MESSAGE ================= */

    if (message) {
      await sendWhatsAppMessage(parentPhone, message);
      console.log("WhatsApp notification sent successfully");
    }

  } catch (err) {
    console.error("Notification error:", err.message);
  }
};
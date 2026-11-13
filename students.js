
/* =========================================
   STUDENT MANAGEMENT AND PROFILE
========================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "madrasah_students";
  let selectedStudent = null;

  const searchInput = document.getElementById("studentSearch");
  const classSelect = document.getElementById("studentClass");
  const studentList = document.getElementById("studentList");
  const studentCount = document.getElementById("studentCount");

  if (!studentList) return;

  function getStudents() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function value(student, keys) {
    for (const key of keys) {
      if (student[key] !== undefined && student[key] !== null &&
          student[key] !== "") {
        return String(student[key]);
      }
    }
    return "";
  }

  function safe(text) {
    return String(text || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function getClass(student) {
    return value(student, ["className", "class", "class_name"]);
  }

  function getID(student) {
    return value(student, ["studentId", "id", "studentID"]);
  }

  function renderStudents() {
    const students = getStudents();
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedClass = classSelect ? classSelect.value : "";

    const filtered = students.filter(student => {
      const fields = [
        value(student, ["name", "studentName"]),
        getID(student),
        value(student, ["roll", "studentRoll"]),
        value(student, ["mobile", "phone"]),
        getClass(student)
      ];

      const matchesSearch = !query ||
        fields.some(item => item.toLowerCase().includes(query));

      const matchesClass = !selectedClass ||
        getClass(student) === selectedClass;

      return matchesSearch && matchesClass;
    });

    studentCount.textContent = "মোট শিক্ষার্থী: " + filtered.length + " জন";

    if (!filtered.length) {
      studentList.innerHTML =
        '<tr><td colspan="8" class="empty">কোনো শিক্ষার্থী পাওয়া যায়নি।</td></tr>';
      return;
    }

    studentList.innerHTML = filtered.map((student, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${safe(getID(student) || "—")}</td>
        <td>${safe(value(student, ["roll", "studentRoll"]) || "—")}</td>
        <td>${safe(value(student, ["name", "studentName"]) || "—")}</td>
        <td>${safe(getClass(student) || "—")}</td>
        <td>${safe(value(student, ["year", "admissionYear"]) || "—")}</td>
        <td>${safe(value(student, ["father", "fatherName"]) || "—")}</td>
        <td>
          ${safe(value(student, ["mobile", "phone"]) || "—")}
          <br>
          <button type="button" onclick="selectStudent('${safe(getID(student))}')">
            নির্বাচন
          </button>
        </td>
      </tr>
    `).join("");
  }

  window.selectStudent = function (id) {
    selectedStudent = getStudents().find(student => getID(student) === id);

    const message = document.getElementById("studentServiceMessage");

    if (selectedStudent) {
      message.textContent =
        "নির্বাচিত শিক্ষার্থী: " +
        value(selectedStudent, ["name", "studentName"]);
      message.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  function requireStudent() {
    if (!selectedStudent) {
      alert("প্রথমে তালিকা থেকে একজন শিক্ষার্থী নির্বাচন করুন।");
      return false;
    }
    return true;
  }

  window.showSelectedProfile = function () {
    if (!requireStudent()) return;

    const s = selectedStudent;
    const output = document.getElementById("studentProfileOutput");

    const rows = [
      ["শিক্ষার্থী আইডি", getID(s)],
      ["নাম", value(s, ["name", "studentName"])],
      ["রোল", value(s, ["roll", "studentRoll"])],
      ["শ্রেণি", getClass(s)],
      ["শিক্ষাবর্ষ", value(s, ["year", "admissionYear"])],
      ["পিতার নাম", value(s, ["father", "fatherName"])],
      ["মাতার নাম", value(s, ["mother", "motherName"])],
      ["জন্ম তারিখ", value(s, ["dob", "birthDate"])],
      ["জন্ম নিবন্ধন", value(s, ["birthReg", "birthRegistration"])],
      ["মোবাইল", value(s, ["mobile", "phone"])],
      ["ঠিকানা", value(s, ["address"])],
      ["ভর্তির তারিখ", value(s, ["admissionDate"])]
    ];

    output.innerHTML = `
      <h2>শিক্ষার্থী প্রোফাইল</h2>
      <table>
        <tbody>
          ${rows.map(row => `
            <tr>
              <th>${safe(row[0])}</th>
              <td>${safe(row[1] || "তথ্য নেই")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    output.style.display = "block";
    output.scrollIntoView({ behavior: "smooth" });
  };

  window.printSelectedIDCard = function () {
    if (!requireStudent()) return;

    const s = selectedStudent;

    const card = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>শিক্ষার্থী আইডি কার্ড</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .card {
            width: 330px;
            border: 2px solid #075e3a;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
          }
          h3 { color: #075e3a; margin: 5px; }
          .line { border-top: 1px solid #d4a017; margin: 10px 0; }
          p { margin: 7px; text-align: left; }
          .footer { text-align: center; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা</h3>
          <small>নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী</small>
          <div class="line"></div>
          <h3>শিক্ষার্থী পরিচয়পত্র</h3>
          <p><b>নাম:</b> ${safe(value(s, ["name", "studentName"]))}</p>
          <p><b>আইডি:</b> ${safe(getID(s))}</p>
          <p><b>রোল:</b> ${safe(value(s, ["roll", "studentRoll"]))}</p>
          <p><b>শ্রেণি:</b> ${safe(getClass(s))}</p>
          <p><b>শিক্ষাবর্ষ:</b> ${safe(value(s, ["year", "admissionYear"]))}</p>
          <p><b>পিতা:</b> ${safe(value(s, ["father", "fatherName"]))}</p>
          <p><b>মোবাইল:</b> ${safe(value(s, ["mobile", "phone"]))}</p>
          <div class="line"></div>
          <div class="footer">প্রতিষ্ঠান কর্তৃপক্ষ</div>
        </div>
        <script>window.onload = function(){ window.print(); };</script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("প্রিন্ট উইন্ডো খুলতে পারেনি। ব্রাউজারের pop-up অনুমতি দিন।");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(card);
    printWindow.document.close();
  };

  window.contactSelectedGuardian = function () {
    if (!requireStudent()) return;

    const phone = value(selectedStudent, [
      "mobile", "phone", "guardianMobile", "guardianPhone"
    ]);

    if (!phone) {
      alert("এই শিক্ষার্থীর অভিভাবকের মোবাইল নম্বর সংরক্ষিত নেই।");
      return;
    }

    if (confirm("এই নম্বরে ফোন করবেন?\n" + phone)) {
      window.location.href = "tel:" + phone.replace(/[^\d+]/g, "");
    }
  };

  window.serviceMessage = function (service) {
    if (!requireStudent()) return;

    alert(
      service + " সেবা নির্বাচিত শিক্ষার্থীর জন্য পরবর্তী ধাপে যুক্ত করা হবে।\n\n" +
      "নাম: " + value(selectedStudent, ["name", "studentName"]) +
      "\nআইডি: " + getID(selectedStudent)
    );
  };

  if (searchInput) {
    searchInput.addEventListener("input", renderStudents);
  }

  if (classSelect) {
    classSelect.addEventListener("change", renderStudents);
  }

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      selectedStudent = null;
      renderStudents();
    }
  });

  window.refreshStudentList = renderStudents;
  renderStudents();

})();

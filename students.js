
/* ==========================================
   STUDENT MANAGEMENT SYSTEM
   Abdullah Hat Islamia Fazil (Degree) Madrasah
========================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "madrasah_students";

  let selectedStudent = null;

  const searchInput = document.getElementById("studentSearch");
  const classSelect = document.getElementById("studentClass");
  const studentList = document.getElementById("studentList");
  const studentCount = document.getElementById("studentCount");

  if (!studentList) return;

  // শিক্ষার্থীর তথ্য সংগ্রহ
  function getStudents() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Student data error:", error);
      return [];
    }
  }

  // একাধিক সম্ভাব্য নাম থেকে তথ্য পড়া
  function getValue(student, keys) {
    for (const key of keys) {
      const value = student[key];

      if (value !== undefined && value !== null && value !== "") {
        return String(value);
      }
    }
    return "";
  }

  function getID(student) {
    return getValue(student, ["studentId", "id", "studentID"]);
  }

  function getName(student) {
    return getValue(student, ["name", "studentName"]);
  }

  function getClass(student) {
    return getValue(student, ["className", "class", "class_name"]);
  }

  function getRoll(student) {
    return getValue(student, ["roll", "studentRoll"]);
  }

  // HTML নিরাপদভাবে প্রদর্শন
  function safe(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  // শিক্ষার্থী তালিকা প্রদর্শন
  function renderStudents() {
    const students = getStudents();

    const query = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    const selectedClass = classSelect
      ? classSelect.value
      : "";

    const filtered = students
      .map((student, originalIndex) => ({
        student,
        originalIndex
      }))
      .filter(item => {
        const student = item.student;

        const searchable = [
          getName(student),
          getID(student),
          getRoll(student),
          getClass(student),
          getValue(student, ["mobile", "phone"]),
          getValue(student, ["father", "fatherName"])
        ];

        const matchesSearch = !query ||
          searchable.some(value => value.toLowerCase().includes(query));

        const matchesClass = !selectedClass ||
          getClass(student) === selectedClass;

        return matchesSearch && matchesClass;
      });

    studentCount.textContent =
      "মোট শিক্ষার্থী: " + filtered.length + " জন";

    if (filtered.length === 0) {
      studentList.innerHTML = `
        <tr>
          <td colspan="9" class="empty">
            ${students.length === 0
              ? "এখনো কোনো শিক্ষার্থীর তথ্য সংরক্ষণ করা হয়নি। ভর্তি পেজ থেকে শিক্ষার্থী যোগ করুন।"
              : "কোনো শিক্ষার্থী পাওয়া যায়নি।"}
          </td>
        </tr>
      `;
      return;
    }

    studentList.innerHTML = filtered.map((item, index) => {
      const student = item.student;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${safe(getID(student) || "—")}</td>
          <td>${safe(getRoll(student) || "—")}</td>
          <td>${safe(getName(student) || "—")}</td>
          <td>${safe(getClass(student) || "—")}</td>
          <td>${safe(getValue(student, ["year", "admissionYear"]) || "—")}</td>
          <td>${safe(getValue(student, ["father", "fatherName"]) || "—")}</td>
          <td>${safe(getValue(student, ["mobile", "phone"]) || "—")}</td>
          <td>
            <button
              type="button"
              class="select-student-btn"
              onclick="selectStudent(${item.originalIndex})">
              নির্বাচন
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // শিক্ষার্থী নির্বাচন
  window.selectStudent = function (index) {
    const students = getStudents();

    if (!Number.isInteger(index) || !students[index]) {
      alert("শিক্ষার্থীর তথ্য পাওয়া যায়নি। তালিকাটি আবার দেখুন।");
      selectedStudent = null;
      return;
    }

    selectedStudent = students[index];

    const message = document.getElementById("studentServiceMessage");

    if (message) {
      message.textContent =
        "নির্বাচিত শিক্ষার্থী: " +
        getName(selectedStudent) +
        " | আইডি: " + getID(selectedStudent);
    }
  };

  // নির্বাচিত শিক্ষার্থী যাচাই
  function requireStudent() {
    if (!selectedStudent) {
      alert("প্রথমে শিক্ষার্থী তালিকা থেকে একজন শিক্ষার্থী নির্বাচন করুন।");
      return false;
    }

    return true;
  }

  // শিক্ষার্থী প্রোফাইল
  window.showSelectedProfile = function () {
    if (!requireStudent()) return;

    const s = selectedStudent;
    const output = document.getElementById("studentProfileOutput");

    if (!output) return;

    const rows = [
      ["শিক্ষার্থী আইডি", getID(s)],
      ["শিক্ষার্থীর নাম", getName(s)],
      ["রোল নম্বর", getRoll(s)],
      ["শ্রেণি", getClass(s)],
      ["শিক্ষাবর্ষ", getValue(s, ["year", "admissionYear"])],
      ["পিতার নাম", getValue(s, ["father", "fatherName"])],
      ["মাতার নাম", getValue(s, ["mother", "motherName"])],
      ["জন্ম তারিখ", getValue(s, ["dob", "birthDate"])],
      ["জন্ম নিবন্ধন", getValue(s, ["birthReg", "birthRegistration"])],
      ["লিঙ্গ", getValue(s, ["gender"])],
      ["ধর্ম", getValue(s, ["religion"])],
      ["রক্তের গ্রুপ", getValue(s, ["blood", "bloodGroup"])],
      ["মোবাইল", getValue(s, ["mobile", "phone"])],
      ["পূর্ববর্তী প্রতিষ্ঠান", getValue(s, ["previousSchool"])],
      ["ভর্তির তারিখ", getValue(s, ["admissionDate"])],
      ["ঠিকানা", getValue(s, ["address"])]
    ];

    output.innerHTML = `
      <h2>শিক্ষার্থী প্রোফাইল</h2>

      <div class="table-wrap">
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
      </div>
    `;

    output.style.display = "block";
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // আইডি কার্ড প্রিন্ট
  window.printSelectedIDCard = function () {
    if (!requireStudent()) return;

    const s = selectedStudent;

    const card = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>শিক্ষার্থী আইডি কার্ড</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }

          .card {
            width: 330px;
            border: 2px solid #075e3a;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
          }

          h3 {
            color: #075e3a;
            margin: 5px;
          }

          .line {
            border-top: 1px solid #d4a017;
            margin: 10px 0;
          }

          p {
            margin: 8px;
            text-align: left;
          }

          .footer {
            text-align: center;
            font-size: 12px;
          }

          @media print {
            body { padding: 0; }
          }
        </style>
      </head>

      <body>
        <div class="card">
          <h3>আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা</h3>
          <small>নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী</small>

          <div class="line"></div>

          <h3>শিক্ষার্থী পরিচয়পত্র</h3>

          <p><b>নাম:</b> ${safe(getName(s))}</p>
          <p><b>আইডি:</b> ${safe(getID(s))}</p>
          <p><b>রোল:</b> ${safe(getRoll(s))}</p>
          <p><b>শ্রেণি:</b> ${safe(getClass(s))}</p>
          <p><b>শিক্ষাবর্ষ:</b> ${safe(getValue(s, ["year", "admissionYear"]))}</p>
          <p><b>পিতা:</b> ${safe(getValue(s, ["father", "fatherName"]))}</p>
          <p><b>মোবাইল:</b> ${safe(getValue(s, ["mobile", "phone"]))}</p>

          <div class="line"></div>

          <div class="footer">প্রতিষ্ঠান কর্তৃপক্ষ</div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("প্রিন্ট উইন্ডো খুলতে পারেনি। ব্রাউজারের Pop-up অনুমতি দিন।");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(card);
    printWindow.document.close();
  };

  // অভিভাবকের সঙ্গে যোগাযোগ
  window.contactSelectedGuardian = function () {
    if (!requireStudent()) return;

    const phone = getValue(selectedStudent, [
      "guardianMobile",
      "guardianPhone",
      "mobile",
      "phone"
    ]);

    if (!phone) {
      alert("এই শিক্ষার্থীর অভিভাবকের মোবাইল নম্বর সংরক্ষিত নেই।");
      return;
    }

    if (confirm("এই নম্বরে ফোন করবেন?\n" + phone)) {
      window.location.href =
        "tel:" + phone.replace(/[^\d+]/g, "");
    }
  };

  // এখনো সংযুক্ত না হওয়া সেবার বার্তা
  window.serviceMessage = function (service) {
    if (!requireStudent()) return;

    alert(
      service + " সেবা পরবর্তী ধাপে সংযুক্ত করা হবে।\n\n" +
      "শিক্ষার্থীর নাম: " + getName(selectedStudent) +
      "\nশিক্ষার্থী আইডি: " + getID(selectedStudent)
    );
  };

  // অনুসন্ধান
  if (searchInput) {
    searchInput.addEventListener("input", renderStudents);
  }

  if (classSelect) {
    classSelect.addEventListener("change", renderStudents);
  }

  // অন্য ট্যাবে তথ্য পরিবর্তন হলে তালিকা আপডেট
  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      selectedStudent = null;
      renderStudents();
    }
  });

  // অন্য স্ক্রিপ্ট থেকেও তালিকা রিফ্রেশ করা যাবে
  window.refreshStudentList = renderStudents;

  renderStudents();

})();

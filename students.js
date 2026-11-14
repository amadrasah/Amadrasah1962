
/* =====================================================
   STUDENT MANAGEMENT MODULE
   Profile | ID Card | Certificate | TC
   Document History | Due | Notification
   Abdullah Hat Islamia Fazil (Degree) Madrasah
===================================================== */

(() => {
  "use strict";

  const STUDENT_KEY = "madrasah_students";
  const DOCUMENT_KEY = "madrasah_student_documents";
  const NOTICE_KEY = "madrasah_notifications";

  const DUE_KEYS = [
    "madrasah_dues",
    "incomeExpenseData",
    "madrasah_income_expense"
  ];

  let studentRecords = [];
  let documentRecords = [];
  let selectedStudentIndex = -1;

  const CLASS_NAMES = {
    nurani1: "নূরানী ১ম জামাত",
    nurani2: "নূরানী ২য় জামাত",
    nurani3: "নূরানী ৩য় জামাত",
    ebtedayi4: "ইবতেদায়ী ৪র্থ শ্রেণি",
    ebtedayi5: "ইবতেদায়ী ৫ম শ্রেণি",
    dakhil6: "দাখিল ৬ষ্ঠ শ্রেণি",
    dakhil7: "দাখিল ৭ম শ্রেণি",
    dakhil8: "দাখিল ৮ম শ্রেণি",
    dakhil9: "দাখিল ৯ম শ্রেণি",
    dakhil10: "দাখিল ১০ম শ্রেণি",
    alim1: "আলিম ১ম বর্ষ",
    alim2: "আলিম ২য় বর্ষ",
    fazil1: "ফাজিল ১ম বর্ষ",
    fazil2: "ফাজিল ২য় বর্ষ",
    fazil3: "ফাজিল ৩য় বর্ষ"
  };

  const INSTITUTION = {
    name: "আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা",
    address: "নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী",
    phone: "01814-716405",
    email: "amadrasah1962@gmail.com"
  };

  /* -----------------------------
     STORAGE
  ----------------------------- */

  function readArray(key) {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || "[]"
      );
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.error("Storage read error:", key, error);
      return [];
    }
  }

  function loadAllData() {
    studentRecords = readArray(STUDENT_KEY);
    documentRecords = readArray(DOCUMENT_KEY);
  }

  function saveStudents() {
    try {
      localStorage.setItem(
        STUDENT_KEY,
        JSON.stringify(studentRecords)
      );
      return true;
    } catch (error) {
      alert("শিক্ষার্থীর তথ্য সংরক্ষণ করা যায়নি।");
      console.error(error);
      return false;
    }
  }

  function saveDocuments() {
    try {
      localStorage.setItem(
        DOCUMENT_KEY,
        JSON.stringify(documentRecords)
      );
      return true;
    } catch (error) {
      alert("সনদ/ছাড়পত্রের রেকর্ড সংরক্ষণ করা যায়নি।");
      console.error(error);
      return false;
    }
  }

  /* -----------------------------
     GENERAL HELPERS
  ----------------------------- */

  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );
  }

  function getName(student) {
    return student.name ||
      student.studentName ||
      student.student_name || "";
  }

  function getStudentId(student) {
    return student.studentId ||
      student.id ||
      student.student_id || "";
  }

  function getFather(student) {
    return student.father ||
      student.fatherName ||
      student.father_name || "";
  }

  function getMother(student) {
    return student.mother ||
      student.motherName ||
      student.mother_name || "";
  }

  function getMobile(student) {
    return student.mobile ||
      student.phone ||
      student.guardianMobile ||
      student.guardianPhone || "";
  }

  function getClassCode(student) {
    return student.class ||
      student.classCode ||
      student.class_code || "";
  }

  function normalizeClassCode(value) {
    const raw = String(value || "").trim().toLowerCase();

    if (!raw) return "";
    if (CLASS_NAMES[raw]) return raw;

    const matched = Object.entries(CLASS_NAMES).find(
      ([code, name]) =>
        name.trim().toLowerCase() === raw
    );

    return matched ? matched[0] : raw;
  }

  function getClassName(student) {
    const code = normalizeClassCode(getClassCode(student));

    return student.className ||
      student.class_name ||
      CLASS_NAMES[code] ||
      getClassCode(student) ||
      "উল্লেখ নেই";
  }

  function getStatus(student) {
    const status = String(
      student.studentStatus ||
      student.admissionStatus ||
      student.status || ""
    ).toLowerCase();

    if (
      student.transferredAt ||
      status.includes("স্থানান্তর") ||
      status.includes("transfer") ||
      status.includes("left")
    ) {
      return "transferred";
    }

    return "current";
  }

  function getStatusText(student) {
    return getStatus(student) === "transferred"
      ? "স্থানান্তরিত"
      : "বর্তমান";
  }

  function getToday() {
    return new Date().toLocaleDateString("bn-BD");
  }

  function makeDocumentId() {
    return "DOC-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  function getSelectedStudent(showAlert = true) {
    if (
      selectedStudentIndex < 0 ||
      selectedStudentIndex >= studentRecords.length
    ) {
      if (showAlert) {
        alert("প্রথমে তালিকা থেকে একজন শিক্ষার্থী নির্বাচন করুন।");
      }
      return null;
    }

    return studentRecords[selectedStudentIndex];
  }

  function setMessage(message) {
    const element = document.getElementById(
      "studentServiceMessage"
    );
    if (element) element.textContent = message;
  }

  /* -----------------------------
     CLASS DROPDOWN
  ----------------------------- */

  function populateClassFilter() {
    const select = document.getElementById("studentClass");
    if (!select) return;

    const oldValue = select.value;

    select.innerHTML =
      '<option value="">সকল শ্রেণি</option>';

    Object.entries(CLASS_NAMES).forEach(([code, name]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      select.appendChild(option);
    });

    if (oldValue) {
      select.value = normalizeClassCode(oldValue);
    }
  }

  /* -----------------------------
     STUDENT TABLE
  ----------------------------- */

  function renderStudentList() {
    loadAllData();

    const tbody = document.getElementById("studentList");
    const count = document.getElementById("studentCount");

    if (!tbody) return;

    const search = (
      document.getElementById("studentSearch")?.value || ""
    ).toLowerCase().trim();

    const classFilter = normalizeClassCode(
      document.getElementById("studentClass")?.value || ""
    );

    const statusFilter =
      document.getElementById("studentStatusFilter")?.value || "all";

    tbody.innerHTML = "";
    let visibleCount = 0;

    studentRecords.forEach((student, index) => {
      const name = getName(student);
      const id = getStudentId(student);
      const roll = student.roll || "";
      const father = getFather(student);
      const mobile = getMobile(student);
      const classCode = normalizeClassCode(getClassCode(student));
      const className = getClassName(student);
      const status = getStatus(student);

      const searchText = [
        name, id, roll, father, mobile,
        className, getClassCode(student),
        student.year || ""
      ].join(" ").toLowerCase();

      if (search && !searchText.includes(search)) return;
      if (classFilter && classFilter !== classCode) return;
      if (statusFilter !== "all" && statusFilter !== status) return;

      visibleCount++;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${visibleCount}</td>
        <td>${escapeHTML(id)}</td>
        <td>${escapeHTML(roll)}</td>
        <td>${escapeHTML(name)}</td>
        <td>${escapeHTML(className)}</td>
        <td>${escapeHTML(student.year || "")}</td>
        <td>${escapeHTML(father)}</td>
        <td>${escapeHTML(mobile)}</td>
        <td class="${status === "transferred" ? "status-left" : "status-current"}">
          ${getStatusText(student)}
        </td>
        <td>
          <button type="button" class="student-select-button">
            নির্বাচন
          </button>
        </td>
      `;

      row.querySelector(".student-select-button")
        .addEventListener("click", () => selectStudent(index));

      tbody.appendChild(row);
    });

    if (count) count.textContent = visibleCount;

    if (!visibleCount) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="empty">
            কোনো শিক্ষার্থী পাওয়া যায়নি।
          </td>
        </tr>
      `;
    }
  }

  /* -----------------------------
     STUDENT PROFILE
  ----------------------------- */

  function selectStudent(index) {
    loadAllData();

    if (!studentRecords[index]) {
      alert("শিক্ষার্থীর তথ্য পাওয়া যায়নি।");
      return;
    }

    selectedStudentIndex = index;

    const student = studentRecords[index];
    const output = document.getElementById("studentProfileOutput");

    if (!output) return;

    output.style.display = "block";

    const fields = [
      ["শিক্ষার্থীর নাম", getName(student)],
      ["শিক্ষার্থী আইডি", getStudentId(student)],
      ["শ্রেণি", getClassName(student)],
      ["রোল", student.roll || ""],
      ["শিক্ষাবর্ষ", student.year || ""],
      ["পিতার নাম", getFather(student)],
      ["মাতার নাম", getMother(student)],
      ["জন্মতারিখ", student.dob || student.dateOfBirth || ""],
      ["জন্মনিবন্ধন", student.birthReg || student.birthRegistration || ""],
      ["মোবাইল", getMobile(student)],
      ["ঠিকানা", student.address || ""],
      ["ভর্তির তারিখ", student.admissionDate || ""],
      ["বর্তমান অবস্থা", getStatusText(student)]
    ];

    output.classList.remove("empty");

    output.innerHTML = `
      <div class="profile-grid">
        ${fields.map(([label, value]) => `
          <div class="profile-item">
            <b>${escapeHTML(label)}:</b><br>
            ${escapeHTML(value || "উল্লেখ নেই")}
          </div>
        `).join("")}
      </div>
    `;

    setMessage("নির্বাচিত শিক্ষার্থী: " + getName(student));
    renderDocumentHistory();
  }

  function showSelectedProfile() {
    const student = getSelectedStudent();
    if (!student) return;

    const output = document.getElementById("studentProfileOutput");
    if (output) {
      output.style.display = "block";
      output.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }

  /* -----------------------------
     DOCUMENT DATA
  ----------------------------- */

  function makeStudentSnapshot(student) {
    return {
      name: getName(student),
      studentId: getStudentId(student),
      father: getFather(student),
      mother: getMother(student),
      className: getClassName(student),
      roll: student.roll || "",
      year: student.year || "",
      dob: student.dob || student.dateOfBirth || "",
      birthReg: student.birthReg || student.birthRegistration || "",
      address: student.address || "",
      mobile: getMobile(student),
      admissionDate: student.admissionDate || ""
    };
  }

  function makeDocumentRecord(type, student, extra) {
    return {
      documentId: makeDocumentId(),
      type,
      typeName: type === "certificate" ? "সনদপত্র" : "ছাড়পত্র",
      studentId: getStudentId(student),
      studentName: getName(student),
      issueDate: extra.issueDate,
      serial: extra.serial,
      snapshot: makeStudentSnapshot(student),
      extra,
      createdAt: new Date().toISOString()
    };
  }

  function isDocumentForStudent(record, student) {
    if (!record || !student) return false;

    const studentId = String(getStudentId(student) || "").trim();
    const recordId = String(record.studentId || "").trim();

    if (studentId && recordId) {
      return studentId === recordId;
    }

    const snapshot = record.snapshot || {};

    return (
      String(record.studentName || snapshot.name || "").trim() ===
        String(getName(student) || "").trim() &&
      String(snapshot.roll || "").trim() ===
        String(student.roll || "").trim() &&
      String(snapshot.year || "").trim() ===
        String(student.year || "").trim()
    );
  }

  /* -----------------------------
     CERTIFICATE
  ----------------------------- */

  function printStudentCertificate() {
    loadAllData();

    const student = getSelectedStudent();
    if (!student) return;

    const issueDate = prompt(
      "সনদ প্রদানের তারিখ লিখুন:",
      getToday()
    );

    if (issueDate === null) return;

    const serial = prompt("সনদ নম্বর লিখুন:", "");
    if (serial === null) return;

    const record = makeDocumentRecord("certificate", student, {
      issueDate: issueDate.trim(),
      serial: serial.trim()
    });

    documentRecords.unshift(record);

    if (!saveDocuments()) {
      documentRecords.shift();
      return;
    }

    renderDocumentHistory();
    printDocumentRecord(record);
  }

  /* -----------------------------
     TRANSFER CERTIFICATE
  ----------------------------- */

  function printStudentTC() {
    loadAllData();

    const student = getSelectedStudent();
    if (!student) return;

    if (getStatus(student) === "transferred") {
      if (!confirm(
        "এই শিক্ষার্থীর ছাড়পত্র আগেই ইস্যু করা হয়েছে।\n" +
        "আপনি কি নতুন ছাড়পত্র তৈরি করতে চান?"
      )) return;
    }

    const issueDate = prompt(
      "ছাড়পত্র প্রদানের তারিখ লিখুন:",
      getToday()
    );
    if (issueDate === null) return;

    const serial = prompt("ছাড়পত্র নম্বর লিখুন:", "");
    if (serial === null) return;

    const reason = prompt(
      "ছাড়পত্র নেওয়ার কারণ লিখুন:",
      "অভিভাবকের আবেদনের পরিপ্রেক্ষিতে"
    );
    if (reason === null) return;

    const conduct = prompt(
      "আচরণ ও চরিত্র সম্পর্কে মন্তব্য লিখুন:",
      "সন্তোষজনক"
    );
    if (conduct === null) return;

    const record = makeDocumentRecord("tc", student, {
      issueDate: issueDate.trim(),
      serial: serial.trim(),
      reason: reason.trim(),
      conduct: conduct.trim()
    });

    documentRecords.unshift(record);

    if (!saveDocuments()) {
      documentRecords.shift();
      return;
    }

    student.studentStatus = "স্থানান্তরিত";
    student.transferredAt = issueDate.trim();
    student.tcNumber = serial.trim();

    if (!saveStudents()) {
      alert(
        "ছাড়পত্রের রেকর্ড সংরক্ষিত হয়েছে, " +
        "কিন্তু শিক্ষার্থীর অবস্থা পরিবর্তন করা যায়নি।"
      );
      renderDocumentHistory();
      return;
    }

    renderStudentList();

    const updatedIndex = studentRecords.findIndex(item =>
      isSameStudent(item, record)
    );

    if (updatedIndex >= 0) {
      selectStudent(updatedIndex);
    }

    renderDocumentHistory();
    printDocumentRecord(record);

    setMessage(
      "ছাড়পত্র ইস্যু হয়েছে। শিক্ষার্থী স্থানান্তরিত হিসেবে চিহ্নিত হয়েছে।"
    );
  }

  function isSameStudent(student, record) {
    const id = String(record.studentId || "").trim();

    if (id) {
      return String(getStudentId(student) || "").trim() === id;
    }

    const snapshot = record.snapshot || {};

    return (
      String(getName(student)).trim() ===
        String(snapshot.name || "").trim() &&
      String(student.roll || "").trim() ===
        String(snapshot.roll || "").trim() &&
      String(student.year || "").trim() ===
        String(snapshot.year || "").trim()
    );
  }

  /* -----------------------------
     DOCUMENT PRINT TEMPLATE
  ----------------------------- */

  function buildDocumentHTML(record) {
    const student = record.snapshot || {};
    const extra = record.extra || {};
    const isTC = record.type === "tc";

    const title = isTC ? "ছাড়পত্র" : "প্রত্যয়নপত্র";

    const bodyText = isTC
      ? `
        এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
        <b>${escapeHTML(student.name)}</b>,
        পিতা: <b>${escapeHTML(student.father || "উল্লেখ নেই")}</b>,
        মাতা: <b>${escapeHTML(student.mother || "উল্লেখ নেই")}</b>,
        অত্র প্রতিষ্ঠানের একজন শিক্ষার্থী ছিল।

        <div class="details">
          শিক্ষার্থীর আইডি: ${escapeHTML(student.studentId)}<br>
          সর্বশেষ অধ্যয়নরত শ্রেণি: ${escapeHTML(student.className)}<br>
          রোল নম্বর: ${escapeHTML(student.roll)}<br>
          শিক্ষাবর্ষ: ${escapeHTML(student.year)}<br>
          জন্মতারিখ: ${escapeHTML(student.dob)}<br>
          আচরণ ও চরিত্র: ${escapeHTML(extra.conduct || "উল্লেখ নেই")}<br>
        </div>

        ছাড়পত্র প্রদানের কারণ:
        <b>${escapeHTML(extra.reason || "উল্লেখ নেই")}</b>।

        প্রতিষ্ঠানের সংরক্ষিত রেকর্ড অনুযায়ী তার তথ্য উল্লেখ করা হলো।
        তার ভবিষ্যৎ জীবনের সর্বাঙ্গীণ উন্নতি ও সাফল্য কামনা করি।
      `
      : `
        এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
        <b>${escapeHTML(student.name)}</b>,
        পিতা: <b>${escapeHTML(student.father || "উল্লেখ নেই")}</b>,
        মাতা: <b>${escapeHTML(student.mother || "উল্লেখ নেই")}</b>,
        এই প্রতিষ্ঠানের একজন শিক্ষার্থী।

        <div class="details">
          শিক্ষার্থীর আইডি: ${escapeHTML(student.studentId)}<br>
          শ্রেণি/জামাত: ${escapeHTML(student.className)}<br>
          রোল নম্বর: ${escapeHTML(student.roll)}<br>
          শিক্ষাবর্ষ: ${escapeHTML(student.year)}<br>
          জন্মতারিখ: ${escapeHTML(student.dob)}<br>
          ঠিকানা: ${escapeHTML(student.address)}<br>
        </div>

        প্রতিষ্ঠানের সংরক্ষিত তথ্য অনুযায়ী উপরোক্ত বিবরণ প্রদান করা হলো।
        আমি তার সর্বাঙ্গীণ সাফল্য ও উজ্জ্বল ভবিষ্যৎ কামনা করি।
      `;

    return `
      <div class="document-header">
        <h1>${escapeHTML(INSTITUTION.name)}</h1>
        <h2>${escapeHTML(INSTITUTION.address)}</h2>
        <p>মোবাইল: ${escapeHTML(INSTITUTION.phone)}</p>
      </div>

      <div class="serial">
        ${isTC ? "ছাড়পত্র" : "সনদ"} নম্বর:
        ${escapeHTML(extra.serial || "................")}
      </div>

      <div class="document-title">
        <span>${title}</span>
      </div>

      <div class="document-body">
        ${bodyText}
      </div>

      <div class="issue-date">
        প্রদানের তারিখ: ${escapeHTML(extra.issueDate || "")}
      </div>

      <div class="signature-row">
        <div class="signature">
          <div class="signature-line"></div>
          প্রস্তুতকারীর স্বাক্ষর
        </div>

        <div class="signature">
          <div class="signature-line"></div>
          যাচাইকারীর স্বাক্ষর
        </div>

        <div class="signature">
          <div class="signature-line"></div>
          অধ্যক্ষের স্বাক্ষর
        </div>
      </div>

      <div class="document-footer">
        ${escapeHTML(INSTITUTION.name)}
      </div>
    `;
  }

  function printDocumentRecord(record) {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert(
        "প্রিন্ট পেজ খোলা যাচ্ছে না। " +
        "ব্রাউজারে পপ-আপ অনুমতি চালু করুন।"
      );
      return;
    }

    const title = record.type === "tc" ? "ছাড়পত্র" : "সনদপত্র";

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>

        <style>
          @page {
            size: A4 portrait;
            margin: 18mm;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            color: #111;
            font-family: "Noto Serif Bengali", "SolaimanLipi",
                         "Kalpurush", serif;
            font-size: 17px;
            line-height: 1.9;
          }

          .document {
            min-height: 255mm;
            border: 2px solid #075e3a;
            padding: 12mm;
            position: relative;
          }

          .document-header {
            text-align: center;
            border-bottom: 3px double #075e3a;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }

          .document-header h1 {
            font-size: 24px;
            margin: 0;
            color: #075e3a;
          }

          .document-header h2 {
            font-size: 17px;
            margin: 3px 0;
            font-weight: normal;
          }

          .document-header p {
            font-size: 13px;
            margin: 0;
          }

          .serial {
            text-align: right;
            font-size: 14px;
          }

          .document-title {
            text-align: center;
            margin: 22px 0 28px;
          }

          .document-title span {
            display: inline-block;
            border: 2px solid #075e3a;
            padding: 3px 30px;
            font-size: 23px;
            font-weight: bold;
          }

          .document-body {
            text-align: justify;
            font-size: 18px;
            min-height: 125mm;
          }

          .details {
            margin: 18px 0;
            line-height: 2.1;
          }

          .issue-date { margin-top: 24px; }

          .signature-row {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            align-items: end;
            margin-top: 55px;
            text-align: center;
            font-size: 14px;
            page-break-inside: avoid;
          }

          .signature {
            min-width: 0;
            white-space: nowrap;
          }

          .signature-line {
            border-top: 1px solid #111;
            margin: 0 4px 8px;
            height: 1px;
          }

          .document-footer {
            text-align: center;
            font-size: 11px;
            margin-top: 20px;
            color: #555;
          }

          @media screen {
            body { background: #eee; padding: 20px; }

            .document {
              max-width: 850px;
              margin: auto;
              background: white;
              box-shadow: 0 0 8px #aaa;
            }
          }
        </style>
      </head>

      <body>
        <div class="document">
          ${buildDocumentHTML(record)}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  /* -----------------------------
     DOCUMENT HISTORY
  ----------------------------- */

  function renderDocumentHistory() {
    const container = document.getElementById(
      "studentDocumentHistory"
    );

    if (!container) return;

    loadAllData();

    const selected = getSelectedStudent(false);

    if (!selected) {
      container.innerHTML = `
        <p class="empty">
          সনদ বা ছাড়পত্রের ইতিহাস দেখতে তালিকা থেকে একজন শিক্ষার্থী নির্বাচন করুন।
        </p>
      `;
      return;
    }

    const records = documentRecords.filter(record =>
      isDocumentForStudent(record, selected)
    );

    if (!records.length) {
      container.innerHTML = `
        <p class="empty">
          এই শিক্ষার্থীর কোনো সনদ বা ছাড়পত্রের রেকর্ড নেই।
        </p>
      `;
      return;
    }

    container.innerHTML = records.map((record, index) => `
      <div class="history-item">
        <div>
          <strong>${escapeHTML(record.typeName || "ডকুমেন্ট")}</strong><br>
          <span>নাম: ${escapeHTML(record.studentName || "")}</span><br>
          <span>নম্বর: ${escapeHTML(record.serial || "নম্বর নেই")}</span><br>
          <span>তারিখ: ${escapeHTML(record.issueDate || "")}</span>
        </div>

        <button
          type="button"
          class="reprint-document-button"
          data-document-index="${index}">
          পুনরায় প্রিন্ট
        </button>
      </div>
    `).join("");

    container.querySelectorAll(".reprint-document-button")
      .forEach(button => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.documentIndex);
          const record = records[index];

          if (record) printDocumentRecord(record);
        });
      });
  }

  function reprintStudentDocument(documentId) {
    loadAllData();

    const record = documentRecords.find(item =>
      String(item.documentId) === String(documentId)
    );

    if (!record) {
      alert("ডকুমেন্টের রেকর্ড পাওয়া যায়নি।");
      return;
    }

    printDocumentRecord(record);
  }

  /* -----------------------------
     ID CARD
  ----------------------------- */

  function printSelectedIDCard() {
    loadAllData();

    const student = getSelectedStudent();
    if (!student) return;

    const html = `
      <div style="
        width:340px;
        margin:25px auto;
        padding:18px;
        border:2px solid #075e3a;
        border-radius:10px;
        text-align:center;
        font-family:serif;
      ">
        <h3>${escapeHTML(INSTITUTION.name)}</h3>
        <p>${escapeHTML(INSTITUTION.address)}</p>
        <hr>
        <h3>শিক্ষার্থী পরিচয়পত্র</h3>
        <p><b>নাম:</b> ${escapeHTML(getName(student))}</p>
        <p><b>আইডি:</b> ${escapeHTML(getStudentId(student))}</p>
        <p><b>শ্রেণি:</b> ${escapeHTML(getClassName(student))}</p>
        <p><b>রোল:</b> ${escapeHTML(student.roll || "")}</p>
        <p><b>মোবাইল:</b> ${escapeHTML(getMobile(student))}</p>
      </div>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("প্রিন্ট পেজ খোলা যাচ্ছে না। পপ-আপ অনুমতি চালু করুন।");
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>শিক্ষার্থী পরিচয়পত্র</title>
        <style>
          body { font-family:serif; padding:20px; }
          @media print {
            @page { size:A4; margin:15mm; }
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload=function(){
            setTimeout(function(){window.print()},400);
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  /* -----------------------------
     GUARDIAN CONTACT
  ----------------------------- */

  function contactSelectedGuardian() {
    loadAllData();

    const student = getSelectedStudent();
    if (!student) return;

    const mobile = getMobile(student);

    if (!mobile) {
      alert("এই শিক্ষার্থীর মোবাইল নম্বর দেওয়া নেই।");
      return;
    }

    window.location.href =
      "tel:" + String(mobile).replace(/[^\d+]/g, "");
  }

  /* -----------------------------
     DUE TRACKING
  ----------------------------- */

  function getDueRecords() {
    for (const key of DUE_KEYS) {
      const records = readArray(key);
      if (records.length) return records;
    }
    return [];
  }

  function recordMatchesStudent(record, student) {
    if (!record || !student) return false;

    const studentId = String(getStudentId(student) || "").trim();

    const recordId = String(
      record.studentId ||
      record.student_id ||
      record.id ||
      ""
    ).trim();

    if (studentId && recordId && studentId === recordId) {
      return true;
    }

    const sameRoll =
      String(record.roll || "").trim() ===
      String(student.roll || "").trim();

    const sameClass =
      normalizeClassCode(
        record.class || record.classCode || record.class_name || ""
      ) === normalizeClassCode(getClassCode(student));

    const sameYear =
      String(record.year || "").trim() ===
      String(student.year || "").trim();

    const sameName =
      String(
        record.studentName ||
        record.name ||
        record.student_name ||
        ""
      ).trim() === String(getName(student)).trim();

    return sameRoll && sameClass && sameYear && sameName;
  }

  function money(value) {
    const number = Number(value || 0);
    return number.toLocaleString("bn-BD");
  }

  function showStudentDuePanel() {
    loadAllData();

    const student = getSelectedStudent();
    if (!student) return;

    const container = document.getElementById(
      "studentServiceMessage"
    );

    if (!container) return;

    const records = getDueRecords().filter(record =>
      recordMatchesStudent(record, student)
    );

    if (!records.length) {
      container.innerHTML = `
        <h3>বকেয়া তথ্য</h3>
        <p>এই শিক্ষার্থীর বকেয়ার কোনো তথ্য পাওয়া যায়নি।</p>
        <small>
          আয়-ব্যয় মডিউলে শিক্ষার্থী আইডি, নাম, শ্রেণি ও রোল সংরক্ষিত থাকলে
          এখানে তথ্য দেখানো যাবে।
        </small>
      `;
      return;
    }

    const totalDue = records.reduce((sum, record) => {
      const amount = Number(
        record.due ||
        record.dueAmount ||
        record.remaining ||
        record.balance ||
        0
      );
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    container.innerHTML = `
      <h3>বকেয়া তথ্য: ${escapeHTML(getName(student))}</h3>
      <p>শিক্ষার্থী আইডি: ${escapeHTML(getStudentId(student))}</p>
      <p>মোট বকেয়া: <strong>${money(totalDue)} টাকা</strong></p>
      <div>
        ${records.map(record => `
          <div class="history-item">
            <span>
              ${escapeHTML(
                record.category ||
                record.title ||
                record.feeName ||
                "বকেয়া"
              )}
            </span>
            <strong>
              ${money(
                record.due ||
                record.dueAmount ||
                record.remaining ||
                record.balance ||
                0
              )} টাকা
            </strong>
          </div>
        `).join("")}
      </div>
    `;
  }
  /* -----------------------------
     NOTIFICATION
  ----------------------------- */

  function showStudentNotificationPanel() {
    loadAllData();

    const student = getSelectedStudent();

    if (!student) {
      alert("প্রথমে তালিকা থেকে একজন শিক্ষার্থী নির্বাচন করুন।");
      return;
    }

    const container = document.getElementById("studentServiceMessage");
    if (!container) return;

    const notices = readArray(NOTICE_KEY).filter(item =>
      recordMatchesStudent(item, student)
    );

    container.innerHTML = `
      <h3>নোটিফিকেশন: ${escapeHTML(getName(student))}</h3>

      <p>শিক্ষার্থী আইডি:
        ${escapeHTML(getStudentId(student))}
      </p>

      <div class="history-item">
        <input
          type="text"
          id="studentNoticeTitle"
          placeholder="নোটিফিকেশনের শিরোনাম"
        >

        <input
          type="text"
          id="studentNoticeText"
          placeholder="নোটিফিকেশনের বার্তা"
        >

        <button type="button" id="saveStudentNoticeButton">
          সংরক্ষণ করুন
        </button>
      </div>

      <h4>নোটিফিকেশন তালিকা</h4>

      <div id="studentNoticeList">
        ${
          notices.length
            ? notices.map(item => `
                <div class="history-item">
                  <strong>${escapeHTML(item.title || "")}</strong>
                  <p>${escapeHTML(item.message || "")}</p>
                  <small>${escapeHTML(item.createdAt || "")}</small>
                  <button
                    type="button"
                    class="delete-student-notice"
                    data-notice-id="${escapeHTML(item.noticeId || "")}"
                  >
                    মুছুন
                  </button>
                </div>
              `).join("")
            : "<p>এই শিক্ষার্থীর কোনো নোটিফিকেশন নেই।</p>"
        }
      </div>
    `;

    document
      .getElementById("saveStudentNoticeButton")
      ?.addEventListener("click", saveStudentNotification);

    container.querySelectorAll(".delete-student-notice")
      .forEach(button => {
        button.addEventListener("click", function () {
          deleteStudentNotification(this.dataset.noticeId);
        });
      });
  }

  function saveStudentNotification() {
    const student = getSelectedStudent();

    if (!student) {
      alert("প্রথমে একজন শিক্ষার্থী নির্বাচন করুন।");
      return;
    }

    const title = document
      .getElementById("studentNoticeTitle")?.value.trim();

    const message = document
      .getElementById("studentNoticeText")?.value.trim();

    if (!title || !message) {
      alert("শিরোনাম ও নোটিফিকেশনের বার্তা লিখুন।");
      return;
    }

    const notices = readArray(NOTICE_KEY);

    notices.push({
      noticeId: "NOTICE-" + Date.now(),
      studentId: getStudentId(student),
      studentName: getName(student),
      roll: getRoll(student),
      class: getClass(student),
      year: getYear(student),
      title: title,
      message: message,
      createdAt: new Date().toLocaleString("bn-BD")
    });

    try {
      localStorage.setItem(NOTICE_KEY, JSON.stringify(notices));
      alert("নোটিফিকেশন সংরক্ষণ হয়েছে।");
      showStudentNotificationPanel();
    } catch (error) {
      console.error(error);
      alert("নোটিফিকেশন সংরক্ষণ করা যায়নি।");
    }
  }

  function deleteStudentNotification(noticeId) {
    if (!noticeId) return;

    if (!confirm("এই নোটিফিকেশনটি মুছে ফেলতে চান?")) {
      return;
    }

    const notices = readArray(NOTICE_KEY).filter(
      item => String(item.noticeId) !== String(noticeId)
    );

    try {
      localStorage.setItem(NOTICE_KEY, JSON.stringify(notices));
      showStudentNotificationPanel();
    } catch (error) {
      console.error(error);
      alert("নোটিফিকেশন মুছতে সমস্যা হয়েছে।");
    }
  }

  /* -----------------------------
     SERVICE BUTTON CONNECTION
  ----------------------------- */

  function serviceMessage(serviceName) {
    const service = String(serviceName || "").toLowerCase();

    if (
      service.includes("সনদ") ||
      service.includes("certificate")
    ) {
      printStudentCertificate();
      return;
    }

    if (
      service.includes("টি") ||
      service.includes("tc") ||
      service.includes("ছাড়") ||
      service.includes("ছাড়")
    ) {
      printStudentTC();
      return;
    }

    if (service.includes("আইডি")) {
      printSelectedIDCard();
      return;
    }

    if (
      service.includes("বকেয়া") ||
      service.includes("বকেয়া") ||
      service.includes("due")
    ) {
      showStudentDuePanel();
      return;
    }

    if (
      service.includes("নোটিফিকেশন") ||
      service.includes("notification")
    ) {
      showStudentNotificationPanel();
      return;
    }

    alert("এই সেবাটি এখনো সংযুক্ত করা হয়নি।");
  }

  /* -----------------------------
     INITIALIZATION
  ----------------------------- */

  function initializeStudentModule() {
    loadAllData();
    populateClassFilter();
    renderStudentList();
    renderDocumentHistory();

    document
      .getElementById("studentSearch")
      ?.addEventListener("input", renderStudentList);

    document
      .getElementById("studentClass")
      ?.addEventListener("change", renderStudentList);

    document
      .getElementById("studentStatusFilter")
      ?.addEventListener("change", renderStudentList);
  }

  /* -----------------------------
     CROSS-TAB STORAGE UPDATE
  ----------------------------- */

  window.addEventListener("storage", function (event) {
    if (
      event.key === STUDENT_KEY ||
      event.key === DOCUMENT_KEY ||
      event.key === NOTICE_KEY
    ) {
      const previousStudent = getSelectedStudent();
      const previousId = previousStudent
        ? getStudentId(previousStudent)
        : "";

      loadAllData();

      if (previousId) {
        selectedStudentIndex = studentRecords.findIndex(
          student => getStudentId(student) === previousId
        );
      }

      renderStudentList();
      renderDocumentHistory();

      const noticeContainer =
        document.getElementById("studentServiceMessage");

      if (
        event.key === NOTICE_KEY &&
        noticeContainer &&
        noticeContainer.innerHTML.includes("নোটিফিকেশন")
      ) {
        showStudentNotificationPanel();
      }
    }
  });

  /* -----------------------------
     GLOBAL FUNCTIONS
  ----------------------------- */

  window.selectStudent = selectStudent;
  window.showSelectedProfile = showSelectedProfile;
  window.printSelectedIDCard = printSelectedIDCard;
  window.printStudentCertificate = printStudentCertificate;
  window.printStudentTC = printStudentTC;
  window.contactSelectedGuardian = contactSelectedGuardian;
  window.serviceMessage = serviceMessage;
  window.reprintStudentDocument = reprintStudentDocument;
  window.refreshStudentList = renderStudentList;
  window.showStudentList = renderStudentList;
  window.showStudentDuePanel = showStudentDuePanel;
  window.showStudentNotificationPanel = showStudentNotificationPanel;
  window.saveStudentNotification = saveStudentNotification;
  window.deleteStudentNotification = deleteStudentNotification;

  /* -----------------------------
     START MODULE
  ----------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeStudentModule
    );
  } else {
    initializeStudentModule();
  }

})();

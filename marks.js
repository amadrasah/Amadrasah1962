
/* =====================================================
   MARKS MANAGEMENT SYSTEM
   Abdullah Hat Islamia Fazil (Degree) Madrasah
   নম্বর এন্ট্রি ও সংরক্ষণ
===================================================== */

(() => {
  "use strict";

  const STUDENT_KEY = "madrasah_students";
  const MARKS_KEY = "madrasah_marks";

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

  // বিষয়ভিত্তিক পূর্ণমান ও পাস নম্বর
  const SUBJECT_CONFIG = {
    "কুরআন মাজিদ": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "হাদীস শরিফ": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "আকাইদ ও ফিকহ": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "আরবী ১ম পত্র": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "আরবী ২য় পত্র": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "বাংলা ১ম পত্র": {
      mcq: 30, cq: 70, practical: 0,
      passMCQ: 10, passCQ: 23
    },
    "বাংলা ২য় পত্র": {
      mcq: 30, cq: 70, practical: 0,
      passMCQ: 10, passCQ: 23
    },
    "ইংরেজি ১ম পত্র": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "ইংরেজি ২য় পত্র": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33
    },
    "গণিত": {
      mcq: 30, cq: 70, practical: 0,
      passMCQ: 10, passCQ: 23
    },
    "ইসলামের ইতিহাস": {
      mcq: 30, cq: 70, practical: 0,
      passMCQ: 10, passCQ: 23
    },
    "তথ্য ও যোগাযোগ প্রযুক্তি": {
      mcq: 25, cq: 50, practical: 25,
      passMCQ: 8, passCQ: 17,
      passPractical: 8
    },
    "কৃষি শিক্ষা": {
      mcq: 0, cq: 100, practical: 0,
      passCQ: 33,
      optional: true
    }
  };

  let students = [];
  let marksRecords = [];

  let selectedStudents = [];

  function readStorage(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (error) {
      console.error("তথ্য পড়তে সমস্যা:", error);
      return fallback;
    }
  }

  function saveStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("তথ্য সংরক্ষণে সমস্যা:", error);
      return false;
    }
  }

  function loadData() {
    students = readStorage(STUDENT_KEY, []);
    marksRecords = readStorage(MARKS_KEY, []);

    if (!Array.isArray(students)) students = [];
    if (!Array.isArray(marksRecords)) marksRecords = [];
  }

  function getStudentName(student) {
    return (
      student.name ||
      student.studentName ||
      student.fullName ||
      student.student_name ||
      "নাম পাওয়া যায়নি"
    );
  }

  function getStudentRoll(student) {
    return String(
      student.roll ||
      student.studentRoll ||
      student.admissionRoll ||
      student.classRoll ||
      ""
    );
  }

  function getStudentId(student) {
    return String(
      student.studentId ||
      student.id ||
      student.admissionId ||
      student.student_id ||
      ""
    );
  }

  function getStudentClass(student) {
    return String(
      student.class ||
      student.classCode ||
      student.studentClass ||
      student.className ||
      ""
    );
  }

  function getStudentYear(student) {
    return String(
      student.year ||
      student.admissionYear ||
      student.session ||
      ""
    );
  }

  function getSelectedValue(id) {
    return document.getElementById(id)?.value.trim() || "";
  }

  function showMarksMessage(message) {
    const output = document.getElementById("marksMessage");
    if (output) output.textContent = message;
  }

  /* ---------------------------------
     EXAM SELECTION AND VALIDATION
  --------------------------------- */

  function getExamSettings() {
    const year = getSelectedValue("marksYear");
    const exam = getSelectedValue("marksExam");
    const classCode = getSelectedValue("marksClass");
    const subject = getSelectedValue("marksSubject");

    if (!year || !exam || !classCode || !subject) {
      showMarksMessage(
        "শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি ও বিষয় নির্বাচন করুন।"
      );
      return null;
    }

    if (!SUBJECT_CONFIG[subject]) {
      showMarksMessage("এই বিষয়ের নম্বরের নিয়ম পাওয়া যায়নি।");
      return null;
    }

    return { year, exam, classCode, subject };
  }

  function getSubjectConfig(subject) {
    return SUBJECT_CONFIG[subject];
  }

  function getSavedMark(settings, student) {
    return marksRecords.find(record =>
      String(record.year) === settings.year &&
      String(record.exam) === settings.exam &&
      String(record.classCode) === settings.classCode &&
      String(record.subject) === settings.subject &&
      (
        (
          getStudentId(student) &&
          String(record.studentId) === getStudentId(student)
        ) ||
        (
          !getStudentId(student) &&
          String(record.roll) === getStudentRoll(student)
        )
      )
    );
  }

  function getClassStudents(settings) {
    return students.filter(student => {
      const studentClass = getStudentClass(student);
      const studentYear = getStudentYear(student);

      const classMatches =
        studentClass === settings.classCode ||
        studentClass === CLASS_NAMES[settings.classCode];

      const yearMatches =
        !studentYear || studentYear === settings.year;

      const status = String(
        student.status || student.admissionStatus || ""
      ).toLowerCase();

      const active =
        !status ||
        status === "active" ||
        status === "নিয়মিত" ||
        status === "চলমান";

      return classMatches && yearMatches && active;
    }).sort((a, b) => {
      return Number(getStudentRoll(a)) -
             Number(getStudentRoll(b));
    });
  }

  /* ---------------------------------
     LOAD STUDENT MARKS TABLE
  --------------------------------- */

  function loadMarksStudents() {
    loadData();

    const settings = getExamSettings();
    if (!settings) return;

    selectedStudents = getClassStudents(settings);

    const container =
      document.getElementById("marksStudentList");

    if (!container) return;

    if (!selectedStudents.length) {
      container.innerHTML =
        "<p>এই শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি।</p>";

      showMarksMessage(
        "ভর্তি পেজে শিক্ষার্থীদের শ্রেণি ও শিক্ষাবর্ষ পরীক্ষা করুন।"
      );
      return;
    }

    const config = getSubjectConfig(settings.subject);

    const savedCount = selectedStudents.filter(student =>
      getSavedMark(settings, student)
    ).length;

    container.innerHTML = `
      <h3>নম্বর এন্ট্রি: ${CLASS_NAMES[settings.classCode]}</h3>

      <p>বিষয়: ${settings.subject}</p>
      <p>পরীক্ষা: ${settings.exam}</p>
      <p>শিক্ষাবর্ষ: ${settings.year}</p>

      <p>
        শিক্ষার্থী: ${selectedStudents.length} জন |
        আগে সংরক্ষিত: ${savedCount} জন
      </p>

      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>রোল</th>
              <th>শিক্ষার্থীর নাম</th>
              <th>আইডি</th>
              ${config.mcq > 0 ? "<th>MCQ</th>" : ""}
              ${config.cq > 0 ? "<th>CQ</th>" : ""}
              ${config.practical > 0 ? "<th>ব্যবহারিক</th>" : ""}
              <th>মোট</th>
              <th>অবস্থা</th>
            </tr>
          </thead>

          <tbody>
            ${selectedStudents.map((student, index) => {
              const saved = getSavedMark(settings, student);

              const mcq = saved ? saved.mcq : "";
              const cq = saved ? saved.cq : "";
              const practical = saved ? saved.practical : "";

              return `
                <tr data-student-index="${index}">
                  <td>${getStudentRoll(student)}</td>

                  <td>${escapeText(getStudentName(student))}</td>

                  <td>${escapeText(getStudentId(student))}</td>

                  ${
                    config.mcq > 0
                      ? `<td>
                          <input
                            type="number"
                            class="mark-mcq"
                            min="0"
                            max="${config.mcq}"
                            step="0.5"
                            value="${mcq}"
                            placeholder="0-${config.mcq}"
                          >
                        </td>`
                      : ""
                  }

                  ${
                    config.cq > 0
                      ? `<td>
                          <input
                            type="number"
                            class="mark-cq"
                            min="0"
                            max="${config.cq}"
                            step="0.5"
                            value="${cq}"
                            placeholder="0-${config.cq}"
                          >
                        </td>`
                      : ""
                  }

                  ${
                    config.practical > 0
                      ? `<td>
                          <input
                            type="number"
                            class="mark-practical"
                            min="0"
                            max="${config.practical}"
                            step="0.5"
                            value="${practical}"
                            placeholder="0-${config.practical}"
                          >
                        </td>`
                      : ""
                  }

                  <td class="mark-total">
                    ${saved ? saved.total : "—"}
                  </td>

                  <td class="mark-status">
                    ${saved ? "সংরক্ষিত" : "অপেক্ষমাণ"}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        id="saveAllMarksButton"
      >
        সকল নম্বর সংরক্ষণ করুন
      </button>
    `;

    container
      .querySelectorAll("input[type=number]")
      .forEach(input => {
        input.addEventListener("input", function () {
          updateRowTotal(this.closest("tr"), config);
        });
      });

    document
      .getElementById("saveAllMarksButton")
      ?.addEventListener("click", saveAllMarks);

    showMarksMessage(
      "শিক্ষার্থী তালিকা এসেছে। নম্বর এন্ট্রি করুন।"
    );
  }

  /* ---------------------------------
     SAFE TEXT OUTPUT
  --------------------------------- */

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  /* ---------------------------------
     MARKS CALCULATION
  --------------------------------- */

  function getInputNumber(row, selector) {
    const input = row.querySelector(selector);

    if (!input) return 0;

    const value = input.value.trim();

    return value === "" ? null : Number(value);
  }

  function calculateMarkStatus(mcq, cq, practical, config) {
    const total = mcq + cq + practical;

    let passed = true;

    if (
      config.mcq > 0 &&
      mcq < (config.passMCQ || 0)
    ) {
      passed = false;
    }

    if (
      config.cq > 0 &&
      cq < (config.passCQ || 0)
    ) {
      passed = false;
    }

    if (
      config.practical > 0 &&
      practical < (config.passPractical || 0)
    ) {
      passed = false;
    }

    return {
      total,
      passed
    };
  }

  function updateRowTotal(row, config) {
    if (!row) return;

    const mcq = getInputNumber(row, ".mark-mcq");
    const cq = getInputNumber(row, ".mark-cq");
    const practical = getInputNumber(row, ".mark-practical");

    if (
      mcq === null ||
      cq === null ||
      practical === null
    ) {
      row.querySelector(".mark-total").textContent = "—";
      row.querySelector(".mark-status").textContent = "অসম্পূর্ণ";
      return;
    }

    const result = calculateMarkStatus(
      mcq,
      cq,
      practical,
      config
    );

    const totalCell = row.querySelector(".mark-total");
    const statusCell = row.querySelector(".mark-status");

    totalCell.textContent = result.total;

    statusCell.textContent =
      result.passed ? "পাস" : "ফেল";
  }

  /* ---------------------------------
     VALIDATE ONE STUDENT'S MARKS
  --------------------------------- */

  function readStudentMarks(row, config) {
    const mcq = getInputNumber(row, ".mark-mcq");
    const cq = getInputNumber(row, ".mark-cq");
    const practical = getInputNumber(row, ".mark-practical");

    if (
      mcq === null ||
      cq === null ||
      practical === null
    ) {
      return {
        valid: false,
        message: "সব নম্বরের ঘর পূরণ করুন।"
      };
    }

    if (
      mcq < 0 ||
      cq < 0 ||
      practical < 0
    ) {
      return {
        valid: false,
        message: "ঋণাত্মক নম্বর দেওয়া যাবে না।"
      };
    }

    if (
      mcq > config.mcq ||
      cq > config.cq ||
      practical > config.practical
    ) {
      return {
        valid: false,
        message: "প্রদত্ত নম্বর পূর্ণমানের বেশি হতে পারবে না।"
      };
    }

    const result = calculateMarkStatus(
      mcq,
      cq,
      practical,
      config
    );

    return {
      valid: true,
      mcq,
      cq,
      practical,
      total: result.total,
      passed: result.passed
    };
  }

  /* ---------------------------------
     SAVE ALL STUDENT MARKS
  --------------------------------- */

  function saveAllMarks() {
    loadData();

    const settings = getExamSettings();

    if (!settings) return;

    const config = getSubjectConfig(settings.subject);

    const container =
      document.getElementById("marksStudentList");

    if (!container) return;

    const rows = container.querySelectorAll(
      "tbody tr[data-student-index]"
    );

    if (!rows.length) {
      alert("সংরক্ষণের জন্য শিক্ষার্থী পাওয়া যায়নি।");
      return;
    }

    const newRecords = [];
    const errors = [];

    rows.forEach(row => {
      const index = Number(row.dataset.studentIndex);
      const student = selectedStudents[index];

      if (!student) return;

      const result = readStudentMarks(row, config);

      if (!result.valid) {
        errors.push(
          "রোল " + getStudentRoll(student) +
          ": " + result.message
        );
        return;
      }

      newRecords.push({
        year: settings.year,
        exam: settings.exam,
        classCode: settings.classCode,
        className: CLASS_NAMES[settings.classCode],
        subject: settings.subject,

        studentId: getStudentId(student),
        studentName: getStudentName(student),
        roll: getStudentRoll(student),

        mcq: result.mcq,
        cq: result.cq,
        practical: result.practical,
        total: result.total,

        passed: result.passed,
        status: result.passed ? "পাস" : "ফেল",

        updatedAt: new Date().toISOString()
      });
    });

    if (errors.length) {
      alert(
        "কিছু শিক্ষার্থীর নম্বর সঠিক নয়:\n\n" +
        errors.slice(0, 10).join("\n") +
        (errors.length > 10 ? "\nআরও ভুল রয়েছে।" : "")
      );
      return;
    }

    if (newRecords.length !== rows.length) {
      alert("সব শিক্ষার্থীর তথ্য পাওয়া যায়নি।");
      return;
    }

    // একই পরীক্ষা, শ্রেণি, বিষয় ও শিক্ষার্থীর
    // পুরোনো নম্বর পরিবর্তন করে নতুন নম্বর রাখা হবে।

    newRecords.forEach(newRecord => {
      const index = marksRecords.findIndex(oldRecord => {
        const sameExam =
          String(oldRecord.year) === newRecord.year &&
          String(oldRecord.exam) === newRecord.exam &&
          String(oldRecord.classCode) === newRecord.classCode &&
          String(oldRecord.subject) === newRecord.subject;

        const sameStudent =
          newRecord.studentId
            ? String(oldRecord.studentId) === newRecord.studentId
            : String(oldRecord.roll) === newRecord.roll;

        return sameExam && sameStudent;
      });

      if (index >= 0) {
        marksRecords[index] = newRecord;
      } else {
        marksRecords.push(newRecord);
      }
    });

    if (!saveStorage(MARKS_KEY, marksRecords)) {
      alert("নম্বর সংরক্ষণ করা যায়নি।");
      return;
    }

    showMarksMessage(
      newRecords.length +
      " জন শিক্ষার্থীর নম্বর সফলভাবে সংরক্ষিত হয়েছে।"
    );

    alert("সকল নম্বর সফলভাবে সংরক্ষিত হয়েছে।");

    loadMarksStudents();
  }

  /* ---------------------------------
     CLEAR MARKS TABLE
  --------------------------------- */

  function clearMarksTable() {
    selectedStudents = [];

    const container =
      document.getElementById("marksStudentList");

    if (container) {
      container.innerHTML =
        "<p>পরীক্ষা, শ্রেণি ও বিষয় নির্বাচন করে শিক্ষার্থী তালিকা আনুন।</p>";
    }

    showMarksMessage("");
  }

  /* ---------------------------------
     PAGE INITIALIZATION
  --------------------------------- */

  function initializeMarksPage() {
    loadData();

    const yearSelect = document.getElementById("marksYear");

    if (
      yearSelect &&
      typeof populateYearDropdown === "function"
    ) {
      populateYearDropdown(yearSelect);
    }

    [
      "marksYear",
      "marksExam",
      "marksClass",
      "marksSubject"
    ].forEach(id => {
      document.getElementById(id)
        ?.addEventListener("change", clearMarksTable);
    });

    document.addEventListener(
      "madrasahYearsUpdated",
      function () {
        if (
          yearSelect &&
          typeof populateYearDropdown === "function"
        ) {
          populateYearDropdown(yearSelect);
        }

        clearMarksTable();
      }
    );

    showMarksMessage(
      "শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি ও বিষয় নির্বাচন করুন।"
    );
  }

  /* ---------------------------------
     STORAGE UPDATE
  --------------------------------- */

  window.addEventListener("storage", function (event) {
    if (
      event.key === STUDENT_KEY ||
      event.key === MARKS_KEY
    ) {
      loadData();

      const container =
        document.getElementById("marksStudentList");

      if (container) {
        showMarksMessage(
          "অন্য ট্যাব থেকে তথ্য পরিবর্তিত হয়েছে। তালিকা আবার আনুন।"
        );
      }
    }
  });

  /* ---------------------------------
     GLOBAL FUNCTIONS
  --------------------------------- */

  window.loadMarksStudents = loadMarksStudents;
  window.saveAllMarks = saveAllMarks;

  /* ---------------------------------
     START
  --------------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeMarksPage
    );
  } else {
    initializeMarksPage();
  }

})();

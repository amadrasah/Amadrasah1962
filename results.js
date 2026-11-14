
"use strict";

(function () {

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

  const EXAM_NAMES = [
    "অর্ধবার্ষিক পরীক্ষা",
    "প্রাক-নির্বাচনী পরীক্ষা",
    "নির্বাচনী পরীক্ষা",
    "১ম টিউটোরিয়াল",
    "২য় টিউটোরিয়াল",
    "৩য় টিউটোরিয়াল",
    "বার্ষিক পরীক্ষা"
  ];

  // বিষয়ভিত্তিক পূর্ণমান ও পাস নম্বর
  const SUBJECT_CONFIG = {
    "কুরআন মাজিদ": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "হাদীস শরিফ": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "আকাইদ ও ফিকহ": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "আরবী ১ম পত্র": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "আরবী ২য় পত্র": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "বাংলা ১ম পত্র": {
      mcq: 30, cq: 70, practical: 0,
      pass: { mcq: 10, cq: 23, practical: 0 }
    },
    "বাংলা ২য় পত্র": {
      mcq: 30, cq: 70, practical: 0,
      pass: { mcq: 10, cq: 23, practical: 0 }
    },
    "ইংরেজি ১ম পত্র": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "ইংরেজি ২য় পত্র": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 }
    },
    "গণিত": {
      mcq: 30, cq: 70, practical: 0,
      pass: { mcq: 10, cq: 23, practical: 0 }
    },
    "ইসলামের ইতিহাস": {
      mcq: 30, cq: 70, practical: 0,
      pass: { mcq: 10, cq: 23, practical: 0 }
    },
    "তথ্য ও যোগাযোগ প্রযুক্তি": {
      mcq: 25, cq: 50, practical: 25,
      pass: { mcq: 8, cq: 17, practical: 8 },
      excludeFromGPA: true
    },
    "কৃষি": {
      mcq: 0, cq: 100, practical: 0,
      pass: { mcq: 0, cq: 33, practical: 0 },
      optional: true
    }
  };

  function readData(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error("তথ্য পড়তে সমস্যা হয়েছে:", error);
      return [];
    }
  }

  function getStudents() {
    return readData(STUDENT_KEY);
  }

  function getMarks() {
    return readData(MARKS_KEY);
  }

  function getValue(id) {
    const element = document.getElementById(id);
    return element ? String(element.value || "").trim() : "";
  }

  function getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function showResultMessage(message, isError) {
    const element = document.getElementById("resultMessage");
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#c62828" : "#087443";
  }

  function getStudentName(student) {
    return student.name ||
      student.studentName ||
      student.student_name ||
      "নাম পাওয়া যায়নি";
  }

  function getStudentRoll(student) {
    return String(
      student.roll ||
      student.studentRoll ||
      student.admissionRoll ||
      ""
    );
  }

  function getStudentId(student) {
    return String(
      student.studentId ||
      student.id ||
      student.admissionId ||
      ""
    );
  }

  function getStudentClass(student) {
    return String(
      student.classCode ||
      student.class ||
      student.studentClass ||
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

  function getGrade(total, fullMark) {
    if (fullMark <= 0) {
      return { grade: "F", point: 0 };
    }

    const percentage = (total / fullMark) * 100;

    if (percentage >= 80) return { grade: "A+", point: 5 };
    if (percentage >= 70) return { grade: "A", point: 4 };
    if (percentage >= 60) return { grade: "A-", point: 3.5 };
    if (percentage >= 50) return { grade: "B", point: 3 };
    if (percentage >= 40) return { grade: "C", point: 2 };
    if (percentage >= 33) return { grade: "D", point: 1 };

    return { grade: "F", point: 0 };
  }

  // নম্বরের রেকর্ড থেকে শিক্ষার্থীর বিষয়ভিত্তিক নম্বর বের করা
  function getStudentSubjectMarks(student, year, exam, classCode, subject) {
    const studentId = getStudentId(student);
    const roll = getStudentRoll(student);

    return getMarks().find(record => {
      const sameStudent = studentId
        ? String(record.studentId || "") === studentId
        : String(record.roll || "") === roll;

      return (
        sameStudent &&
        String(record.year) === String(year) &&
        String(record.exam) === String(exam) &&
        String(record.classCode) === String(classCode) &&
        String(record.subject) === String(subject)
      );
    }) || null;
  }

  // একটি বিষয়ের ফলাফল হিসাব
  function calculateSubjectResult(student, year, exam, classCode, subject) {
    const config = SUBJECT_CONFIG[subject];
    if (!config) return null;

    const record = getStudentSubjectMarks(
      student, year, exam, classCode, subject
    );

    if (!record) return null;

    const mcq = getNumber(record.mcq);
    const cq = getNumber(record.cq);
    const practical = getNumber(record.practical);

    const fullMark =
      config.mcq + config.cq + config.practical;

    const total = mcq + cq + practical;

    const validMarks =
      mcq >= 0 && mcq <= config.mcq &&
      cq >= 0 && cq <= config.cq &&
      practical >= 0 && practical <= config.practical;

    const passed =
      validMarks &&
      mcq >= config.pass.mcq &&
      cq >= config.pass.cq &&
      practical >= config.pass.practical;

    const gradeInfo = passed
      ? getGrade(total, fullMark)
      : { grade: "F", point: 0 };

    return {
      subject,
      mcq,
      cq,
      practical,
      total,
      fullMark,
      grade: gradeInfo.grade,
      point: gradeInfo.point,
      passed,
      optional: !!config.optional,
      excludeFromGPA: !!config.excludeFromGPA,
      recordFound: true
    };
  }

  // শিক্ষার্থীর সব বিষয়ের ফলাফল
  function calculateStudentResult(student, year, exam, classCode) {
    const subjects = [];
    const subjectNames = Object.keys(SUBJECT_CONFIG);

    subjectNames.forEach(subject => {
      const result = calculateSubjectResult(
        student, year, exam, classCode, subject
      );

      if (result) subjects.push(result);
    });

    const compulsorySubjects = subjects.filter(item =>
      !item.optional && !item.excludeFromGPA
    );

    const optionalSubjects = subjects.filter(item =>
      item.optional
    );

    const excludedSubjects = subjects.filter(item =>
      item.excludeFromGPA
    );

    const failSubjects = compulsorySubjects.filter(item =>
      !item.passed
    );

    let compulsoryPointTotal = 0;

    compulsorySubjects.forEach(item => {
      compulsoryPointTotal += item.point;
    });

    let optionalBonus = 0;

    optionalSubjects.forEach(item => {
      if (item.passed && item.point > 2) {
        optionalBonus += item.point - 2;
      }
    });

    const divisor = compulsorySubjects.length;

    let gpa = 0;
    let finalGrade = "F";

    if (divisor > 0 && failSubjects.length === 0) {
      gpa = (compulsoryPointTotal + optionalBonus) / divisor;
      gpa = Math.min(5, gpa);

      if (gpa >= 5) finalGrade = "A+";
      else if (gpa >= 4) finalGrade = "A";
      else if (gpa >= 3.5) finalGrade = "A-";
      else if (gpa >= 3) finalGrade = "B";
      else if (gpa >= 2) finalGrade = "C";
      else if (gpa >= 1) finalGrade = "D";
      else finalGrade = "F";
    }

    const totalMarks = subjects.reduce(
      (sum, item) => sum + item.total, 0
    );

    const totalFullMarks = subjects.reduce(
      (sum, item) => sum + item.fullMark, 0
    );

    return {
      student,
      subjects,
      compulsorySubjects,
      optionalSubjects,
      excludedSubjects,
      failSubjects,
      failCount: failSubjects.length,
      totalMarks,
      totalFullMarks,
      optionalBonus,
      gpa: Number(gpa.toFixed(2)),
      grade: finalGrade,
      passed: divisor > 0 && failSubjects.length === 0,
      resultComplete: subjects.length > 0
    };
  }

  // ফলাফল অনুসন্ধানের তথ্য যাচাই
  function getSearchSettings() {
    const year = getValue("resultYear");
    const exam = getValue("resultExam");
    const classCode = getValue("resultClass");
    const roll = getValue("resultRoll");

    if (!year || !exam || !classCode || !roll) {
      showResultMessage(
        "শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি ও রোল নম্বর পূরণ করুন।",
        true
      );
      return null;
    }

    return { year, exam, classCode, roll };
  }

  // নির্দিষ্ট শিক্ষার্থী খুঁজে বের করা
  function findResultStudent(settings) {
    return getStudents().find(student =>
      getStudentYear(student) === settings.year &&
      getStudentClass(student) === settings.classCode &&
      getStudentRoll(student) === settings.roll
    ) || null;
  }

  // HTML-এ নিরাপদে লেখা দেখানোর জন্য
  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // মার্কশিট তৈরি
  function createMarksheet(result, settings) {
    const student = result.student;

    let rows = "";

    result.subjects.forEach(item => {
      rows += `
        <tr>
          <td>${escapeHTML(item.subject)}</td>
          <td>${item.mcq}</td>
          <td>${item.cq}</td>
          <td>${item.practical}</td>
          <td>${item.total}/${item.fullMark}</td>
          <td>${item.grade}</td>
          <td>${item.point.toFixed(2)}</td>
          <td>${item.passed ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}</td>
        </tr>
      `;
    });

    const remarks = result.failCount === 0
      ? "সকল আবশ্যিক বিষয়ে উত্তীর্ণ"
      : result.failCount + "টি আবশ্যিক বিষয়ে অকৃতকার্য";

    return `
      <div class="marksheet" id="printMarksheetArea">
        <div style="text-align:center;margin-bottom:15px;">
          <h2>${escapeHTML(
            window.MADRASAH_INFO?.name ||
            "আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা"
          )}</h2>
          <p>নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী</p>
          <h3>একাডেমিক ফলাফল / নম্বরপত্র</h3>
          <h4>${escapeHTML(settings.exam)} - ${escapeHTML(settings.year)}</h4>
        </div>

        <table class="result-info" style="width:100%;margin-bottom:12px;">
          <tr>
            <td><strong>শিক্ষার্থীর নাম:</strong></td>
            <td>${escapeHTML(getStudentName(student))}</td>
            <td><strong>রোল:</strong></td>
            <td>${escapeHTML(getStudentRoll(student))}</td>
          </tr>
          <tr>
            <td><strong>শিক্ষার্থী আইডি:</strong></td>
            <td>${escapeHTML(getStudentId(student) || "নেই")}</td>
            <td><strong>শ্রেণি:</strong></td>
            <td>${escapeHTML(CLASS_NAMES[settings.classCode] || settings.classCode)}</td>
          </tr>
        </table>

        <table class="result-table" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th>বিষয়</th>
              <th>MCQ</th>
              <th>CQ</th>
              <th>ব্যবহারিক</th>
              <th>মোট</th>
              <th>গ্রেড</th>
              <th>GP</th>
              <th>ফলাফল</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="margin-top:15px;">
          <p><strong>মোট প্রাপ্ত নম্বর:</strong> ${result.totalMarks} / ${result.totalFullMarks}</p>
          <p><strong>GPA:</strong> ${result.gpa.toFixed(2)}</p>
          <p><strong>সামগ্রিক গ্রেড:</strong> ${result.grade}</p>
          <p><strong>অকৃতকার্য আবশ্যিক বিষয়:</strong> ${result.failCount}টি</p>
          <p><strong>মন্তব্য:</strong> ${remarks}</p>
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:55px;">
          <span>শ্রেণি শিক্ষকের স্বাক্ষর</span>
          <span>অধ্যক্ষের স্বাক্ষর</span>
        </div>
      </div>
    `;
  }

  // একক শিক্ষার্থীর ফলাফল অনুসন্ধান
  function searchStudentResult() {
    const settings = getSearchSettings();
    if (!settings) return;

    const student = findResultStudent(settings);

    if (!student) {
      showResultMessage("এই তথ্য অনুযায়ী কোনো শিক্ষার্থী পাওয়া যায়নি।", true);
      document.getElementById("marksheetOutput").innerHTML = "";
      return;
    }

    const result = calculateStudentResult(
      student,
      settings.year,
      settings.exam,
      settings.classCode
    );

    if (!result.resultComplete) {
      showResultMessage(
        "এই শিক্ষার্থীর জন্য কোনো নম্বর পাওয়া যায়নি। আগে নম্বর এন্ট্রি করুন।",
        true
      );
      document.getElementById("marksheetOutput").innerHTML = "";
      return;
    }

    document.getElementById("marksheetOutput").innerHTML =
      createMarksheet(result, settings);

    showResultMessage("ফলাফল তৈরি হয়েছে।", false);
  }

  // মার্কশিট প্রিন্ট
  function printMarksheet() {
    const area = document.getElementById("printMarksheetArea");

    if (!area) {
      showResultMessage("প্রথমে শিক্ষার্থীর ফলাফল অনুসন্ধান করুন।", true);
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showResultMessage("প্রিন্ট উইন্ডো খোলা যায়নি। পপ-আপ অনুমতি দিন।", true);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>শিক্ষার্থীর মার্কশিট</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #111;
          }
          h2, h3, h4, p { margin: 5px 0; }
          table { border-collapse: collapse; width: 100%; }
          th, td {
            border: 1px solid #333;
            padding: 7px;
            text-align: center;
            font-size: 12px;
          }
          @page { size: A4 portrait; margin: 12mm; }
        </style>
      </head>
      <body>
        ${area.innerHTML}
        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  // নির্দিষ্ট শ্রেণির সব শিক্ষার্থীর ফলাফল
  function getClassResults(settings) {
    return getStudents()
      .filter(student =>
        getStudentYear(student) === settings.year &&
        getStudentClass(student) === settings.classCode
      )
      .map(student => {
        return calculateStudentResult(
          student,
          settings.year,
          settings.exam,
          settings.classCode
        );
      })
      .filter(result => result.resultComplete)
      .sort((a, b) => {
        if (b.passed !== a.passed) return b.passed - a.passed;
        if (b.gpa !== a.gpa) return b.gpa - a.gpa;
        return b.totalMarks - a.totalMarks;
      });
  }

  // মেধাতালিকা
  function showMeritList() {
    const settings = getSearchSettings();
    if (!settings) return;

    const results = getClassResults(settings)
      .filter(result => result.passed);

    const output = document.getElementById("meritListOutput");

    if (!output) return;

    if (!results.length) {
      output.innerHTML = "<p>কোনো উত্তীর্ণ শিক্ষার্থীর ফলাফল পাওয়া যায়নি।</p>";
      return;
    }

    let rows = "";

    results.forEach((result, index) => {
      rows += `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(getStudentName(result.student))}</td>
          <td>${escapeHTML(getStudentRoll(result.student))}</td>
          <td>${result.totalMarks}</td>
          <td>${result.gpa.toFixed(2)}</td>
          <td>${result.grade}</td>
        </tr>
      `;
    });

    output.innerHTML = `
      <h3 style="text-align:center;">মেধাতালিকা</h3>
      <p style="text-align:center;">
        ${escapeHTML(settings.exam)} - ${escapeHTML(settings.year)}
      </p>
      <table class="result-table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th>স্থান</th>
            <th>নাম</th>
            <th>রোল</th>
            <th>মোট নম্বর</th>
            <th>GPA</th>
            <th>গ্রেড</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // ট্যাবুলেশন শিট
  function showTabulation() {
    const settings = getSearchSettings();
    if (!settings) return;

    const results = getClassResults(settings);
    const output = document.getElementById("tabulationOutput");

    if (!output) return;

    if (!results.length) {
      output.innerHTML = "<p>কোনো ফলাফল পাওয়া যায়নি।</p>";
      return;
    }

    let rows = "";

    results.forEach(result => {
      rows += `
        <tr>
          <td>${escapeHTML(getStudentRoll(result.student))}</td>
          <td>${escapeHTML(getStudentName(result.student))}</td>
          <td>${result.totalMarks}</td>
          <td>${result.gpa.toFixed(2)}</td>
          <td>${result.grade}</td>
          <td>${result.failCount}</td>
          <td>${result.passed ? "উত্তীর্ণ" : "অনুত্তীর্ণ"}</td>
        </tr>
      `;
    });

    output.innerHTML = `
      <h3 style="text-align:center;">ট্যাবুলেশন শিট</h3>
      <p style="text-align:center;">
        ${escapeHTML(settings.exam)} - ${escapeHTML(settings.year)}
      </p>
      <table class="result-table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th>রোল</th>
            <th>শিক্ষার্থীর নাম</th>
            <th>মোট নম্বর</th>
            <th>GPA</th>
            <th>গ্রেড</th>
            <th>ফেল বিষয়</th>
            <th>ফলাফল</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // ফলাফলের সারাংশ
  function showResultSummary() {
    const settings = getSearchSettings();
    if (!settings) return;

    const results = getClassResults(settings);
    const output = document.getElementById("resultSummaryOutput");

    if (!output) return;

    const total = results.length;
    const passed = results.filter(item => item.passed).length;
    const failed = results.filter(item => !item.passed).length;
    const passRate = total ? ((passed / total) * 100).toFixed(2) : "0.00";

    const averageGPA = total
      ? (
          results.reduce((sum, item) => sum + item.gpa, 0) / total
        ).toFixed(2)
      : "0.00";

    output.innerHTML = `
      <h3>ফলাফলের সারাংশ</h3>
      <p>মোট শিক্ষার্থী: ${total} জন</p>
      <p>উত্তীর্ণ: ${passed} জন</p>
      <p>অনুত্তীর্ণ: ${failed} জন</p>
      <p>পাসের হার: ${passRate}%</p>
      <p>গড় GPA: ${averageGPA}</p>
    `;
  }

  // নির্দিষ্ট অংশ প্রিন্ট
  function printResultArea(elementId) {
    const area = document.getElementById(elementId);

    if (!area || !area.innerHTML.trim()) {
      showResultMessage("প্রথমে সংশ্লিষ্ট ফলাফল তৈরি করুন।", true);
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showResultMessage("প্রিন্ট উইন্ডো খোলা যায়নি। পপ-আপ অনুমতি দিন।", true);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>ফলাফল প্রিন্ট</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 15px; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            border: 1px solid #333;
            padding: 6px;
            text-align: center;
            font-size: 12px;
          }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        ${area.innerHTML}
        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  // বাটনের সঙ্গে ফাংশন যুক্ত করা
  function initializeResultsPage() {
    const searchButton = document.getElementById("searchResultButton");
    const marksheetButton = document.getElementById("printMarksheetButton");
    const meritButton = document.getElementById("showMeritListButton");
    const meritPrintButton = document.getElementById("printMeritListButton");
    const tabulationButton = document.getElementById("showTabulationButton");
    const tabulationPrintButton = document.getElementById("printTabulationButton");
    const summaryButton = document.getElementById("showResultSummaryButton");
    const summaryPrintButton = document.getElementById("printResultSummaryButton");

    if (searchButton) searchButton.addEventListener("click", searchStudentResult);
    if (marksheetButton) marksheetButton.addEventListener("click", printMarksheet);
    if (meritButton) meritButton.addEventListener("click", showMeritList);
    if (meritPrintButton) {
      meritPrintButton.addEventListener("click", function () {
        printResultArea("meritListOutput");
      });
    }
    if (tabulationButton) tabulationButton.addEventListener("click", showTabulation);
    if (tabulationPrintButton) {
      tabulationPrintButton.addEventListener("click", function () {
        printResultArea("tabulationOutput");
      });
    }
    if (summaryButton) summaryButton.addEventListener("click", showResultSummary);
    if (summaryPrintButton) {
      summaryPrintButton.addEventListener("click", function () {
        printResultArea("resultSummaryOutput");
      });
    }

    const yearSelect = document.getElementById("resultYear");

    if (yearSelect && typeof populateYearDropdown === "function") {
      populateYearDropdown(yearSelect);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeResultsPage);
  } else {
    initializeResultsPage();
  }

  // প্রয়োজন হলে অন্য স্ক্রিপ্ট থেকেও ব্যবহার করা যাবে
  window.searchStudentResult = searchStudentResult;
  window.showMeritList = showMeritList;
  window.showTabulation = showTabulation;
  window.showResultSummary = showResultSummary;
  window.printMarksheet = printMarksheet;

})();




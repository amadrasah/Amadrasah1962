
/* ==========================================
   MADRASAH INCOME & EXPENSE MANAGEMENT
   UPDATED VERSION
   ========================================== */

(function () {
  "use strict";

  const ACCOUNT_KEY = "madrasah_income_expense";
  const STUDENT_KEY = "madrasah_students";
  const YEAR_KEY = "madrasah_years";

  const $ = id => document.getElementById(id);

  let accountRecords = [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(ACCOUNT_KEY) || "[]"
    );
    accountRecords = Array.isArray(saved) ? saved : [];
  } catch (error) {
    accountRecords = [];
  }

  /* =====================================
     COMMON FUNCTIONS
     ===================================== */

  function money(amount) {
    return Number(amount || 0).toLocaleString("bn-BD") + " টাকা";
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function saveRecords() {
    try {
      localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify(accountRecords)
      );
      return true;
    } catch (error) {
      console.error("Account save error:", error);
      return false;
    }
  }

  /* =====================================
     STUDENT MANAGEMENT
     ===================================== */

  function getStudents() {
    try {
      const data = JSON.parse(
        localStorage.getItem(STUDENT_KEY) || "[]"
      );

      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function getStudentName(student) {
    return student.name ||
      student.studentName ||
      "নাম পাওয়া যায়নি";
  }

  function getStudentId(student) {
    return student.studentId ||
      student.id ||
      "আইডি পাওয়া যায়নি";
  }

  function findStudent() {
    const classCode = $("incomeClass").value;
    const roll = $("incomeRoll").value.trim();
    const year = $("incomeYear").value;

    const info = $("incomeStudentInfo");

    if (!classCode || !roll || !year) {
      info.innerHTML =
        "<p>শিক্ষার্থীর নাম: —</p>" +
        "<p>শিক্ষার্থী আইডি: —</p>";

      return null;
    }

    const student = getStudents().find(s => {
      const studentClass =
        s.classCode || s.class || s.studentClass || "";

      const studentRoll =
        s.roll || s.admissionRoll || "";

      return (
        String(studentClass) === String(classCode) &&
        String(studentRoll) === String(roll) &&
        String(s.year || "") === String(year)
      );
    });

    if (!student) {
      info.innerHTML =
        "<p>এই শিক্ষাবর্ষ ও শ্রেণিতে শিক্ষার্থী পাওয়া যায়নি।</p>";

      return null;
    }

    const name = getStudentName(student);
    const id = getStudentId(student);

    info.innerHTML = `
      <p>শিক্ষার্থীর নাম:
        <strong>${escapeHTML(name)}</strong>
      </p>
      <p>শিক্ষার্থী আইডি:
        <strong>${escapeHTML(id)}</strong>
      </p>
    `;

    return student;
  }

  /* =====================================
     YEAR MANAGEMENT
     ===================================== */

  function getAvailableYears() {
    let saved = [];

    try {
      saved = JSON.parse(
        localStorage.getItem(YEAR_KEY) || "[]"
      );
    } catch (error) {}

    if (!Array.isArray(saved)) {
      saved = Object.values(saved);
    }

    const years = saved.map(item => {
      if (typeof item === "object" && item !== null) {
        return String(
          item.year || item.value || item.name || ""
        );
      }

      return String(item);
    }).filter(year => /^\d{4}$/.test(year));

    if (!years.length) {
      const current = new Date().getFullYear();

      years.push(
        String(current),
        String(current + 1),
        String(current + 2)
      );
    }

    return [...new Set(years)].sort();
  }

  function loadIncomeYears() {
    const select = $("incomeYear");
    if (!select) return;

    const previous = select.value;
    const years = getAvailableYears();

    select.innerHTML =
      '<option value="">বছর নির্বাচন করুন</option>';

    years.forEach(year => {
      const option = document.createElement("option");

      option.value = year;
      option.textContent = year;

      select.appendChild(option);
    });

    if (years.includes(previous)) {
      select.value = previous;
    }
  }

  /* =====================================
     CATEGORY MANAGEMENT
     ===================================== */

  function setupCategories() {
    const select = $("accountCategory");
    if (!select) return;

    const categories = {
      income: [],
      expense: []
    };

    select.querySelectorAll("optgroup").forEach(group => {
      const label = group.label || "";

      const type = label.includes("আয়ের")
        ? "income"
        : label.includes("ব্যয়ের")
          ? "expense"
          : null;

      if (!type) return;

      Array.from(group.querySelectorAll("option")).forEach(option => {
        categories[type].push({
          value: option.value || option.textContent.trim(),
          text: option.textContent.trim()
        });
      });
    });

    function updateCategoryOptions() {
      const type = $("accountType").value;
      const previous = select.value;

      select.innerHTML =
        '<option value="">খাত নির্বাচন করুন</option>';

      (categories[type] || []).forEach(item => {
        const option = document.createElement("option");

        option.value = item.value;
        option.textContent = item.text;

        select.appendChild(option);
      });

      if (
        Array.from(select.options).some(
          option => option.value === previous
        )
      ) {
        select.value = previous;
      }
    }

    $("accountType").addEventListener(
      "change",
      updateCategoryOptions
    );

    updateCategoryOptions();
  }

  /* =====================================
     STUDENT INFORMATION EVENTS
     ===================================== */

  function setupStudentSearch() {
    $("incomeClass").addEventListener("change", findStudent);
    $("incomeRoll").addEventListener("input", findStudent);
    $("incomeYear").addEventListener("change", findStudent);
  }

  /* =====================================
     INCOME & EXPENSE SUMMARY
     ===================================== */

  function updateSummary() {
    const income = accountRecords
      .filter(record => record.type === "income")
      .reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      );

    const expense = accountRecords
      .filter(record => record.type === "expense")
      .reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      );

    $("totalIncome").textContent = money(income);
    $("totalExpense").textContent = money(expense);
    $("currentBalance").textContent = money(income - expense);
  }

  /* =====================================
     RECEIPT MANAGEMENT
     ===================================== */

  function showReceipt(record) {
    const studentName =
      record.studentName || "প্রযোজ্য নয়";

    const studentId =
      record.studentId || "প্রযোজ্য নয়";

    const classRoll =
      record.className
        ? record.className + " / " + (record.roll || "—")
        : "প্রযোজ্য নয়";

    $("receiptNumber").textContent = record.id;
    $("receiptStudentName").textContent = studentName;
    $("receiptStudentId").textContent = studentId;
    $("receiptClassRoll").textContent = classRoll;
    $("receiptCategory").textContent = record.category;
    $("receiptAmount").textContent = money(record.amount);
    $("receiptDate").textContent = record.date;
  }

  /* =====================================
     SAVE ACCOUNT
     ===================================== */

  function saveAccount() {
    const type = $("accountType").value;
    const category = $("accountCategory").value;
    const year = $("incomeYear").value;
    const amount = Number($("accountAmount").value);
    const date = $("accountDate").value;
    const note = $("accountNote").value.trim();

    if (!category || !year || !date || !Number.isFinite(amount) || amount <= 0) {
      alert("খাত, শিক্ষাবর্ষ, টাকার পরিমাণ এবং তারিখ পূরণ করুন।");
      return;
    }

    let student = null;

    const roll = $("incomeRoll").value.trim();
    const classCode = $("incomeClass").value;

    const studentFeeCategories = [
      "ভর্তি ফি",
      "পরীক্ষা ফি",
      "রেজিস্ট্রেশন ফি",
      "ফরম ফিলাপ ফি",
      "বেতন বিলম্ব ফি",
      "বেতন"
    ];

    if (
      type === "income" &&
      studentFeeCategories.includes(category)
    ) {
      if (!classCode || !roll) {
        alert("এই খাতের জন্য শিক্ষার্থীর শ্রেণি ও রোল দিতে হবে।");
        return;
      }

      student = findStudent();

      if (!student) {
        alert("শিক্ষার্থী পাওয়া যায়নি। শিক্ষাবর্ষ, শ্রেণি ও রোল পরীক্ষা করুন।");
        return;
      }
    } else if (type === "income" && (classCode || roll)) {
      if (classCode && roll) {
        student = findStudent();

        if (!student) {
          alert("শিক্ষার্থীর তথ্য সঠিক নয়। শ্রেণি ও রোল পরীক্ষা করুন।");
          return;
        }
      } else {
        alert("শিক্ষার্থীর তথ্য দিতে হলে শ্রেণি ও রোল দুটিই দিতে হবে।");
        return;
      }
    }

    const record = {
      id: Date.now(),
      type: type,
      category: category,
      year: year,

      classCode: student ? classCode : "",
      className: student
        ? student.className || ""
        : "",

      roll: student ? roll : "",

      studentName: student
        ? getStudentName(student)
        : "",

      studentId: student
        ? getStudentId(student)
        : "",

      amount: amount,
      date: date,
      note: note,

      createdAt: new Date().toISOString()
    };

    accountRecords.push(record);

    if (!saveRecords()) {
      accountRecords.pop();

      alert(
        "হিসাব সংরক্ষণ করা যায়নি। ব্রাউজারের স্টোরেজ পরীক্ষা করুন।"
      );

      return;
    }

    updateSummary();

    $("accountMessage").textContent =
      "হিসাব সফলভাবে সংরক্ষিত হয়েছে।";

    if (type === "income") {
      showReceipt(record);
    }

    $("accountAmount").value = "";
    $("accountNote").value = "";

    if (type === "income") {
      $("incomeRoll").value = "";
      $("incomeStudentInfo").innerHTML =
        "<p>শিক্ষার্থীর নাম: —</p>" +
        "<p>শিক্ষার্থী আইডি: —</p>";
    }
  }

  /* =====================================
     REPORT MANAGEMENT
     ===================================== */

  function showReport() {
    const type = $("reportType").value;
    const selectedDate = $("reportDate").value;

    if (!selectedDate) {
      alert("রিপোর্টের তারিখ নির্বাচন করুন।");
      return;
    }

    const filtered = accountRecords.filter(record => {
      if (!record.date) return false;

      if (type === "daily") {
        return record.date === selectedDate;
      }

      if (type === "monthly") {
        return record.date.slice(0, 7) === selectedDate.slice(0, 7);
      }

      return record.date.slice(0, 4) === selectedDate.slice(0, 4);
    });

    const income = filtered
      .filter(record => record.type === "income")
      .reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      );

    const expense = filtered
      .filter(record => record.type === "expense")
      .reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      );

    let html = `
      <h4>হিসাবের রিপোর্ট</h4>

      <p>মোট আয়: <strong>${money(income)}</strong></p>
      <p>মোট ব্যয়: <strong>${money(expense)}</strong></p>
      <p>উদ্বৃত্ত: <strong>${money(income - expense)}</strong></p>

      <div class="income-table-wrap">
      <table>
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>ধরন</th>
            <th>খাত</th>
            <th>শিক্ষার্থী</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach(record => {
      html += `
        <tr>
          <td>${escapeHTML(record.date)}</td>
          <td>${record.type === "income" ? "আয়" : "ব্যয়"}</td>
          <td>${escapeHTML(record.category)}</td>
          <td>${escapeHTML(record.studentName || "—")}</td>
          <td>${money(record.amount)}</td>
        </tr>
      `;
    });

    if (!filtered.length) {
      html += `
        <tr>
          <td colspan="5">এই সময়ের কোনো হিসাব পাওয়া যায়নি।</td>
        </tr>
      `;
    }

    html += `
        </tbody>
      </table>
      </div>
    `;

    $("incomeExpenseReport").innerHTML = html;
  }

  /* =====================================
     INITIALIZATION
     ===================================== */

  function initialize() {
    loadIncomeYears();
    setupCategories();
    setupStudentSearch();

    updateSummary();

    $("accountDate").value = getToday();
    $("reportDate").value = getToday();

    $("saveAccountBtn").addEventListener(
      "click",
      saveAccount
    );

    $("showReportBtn").addEventListener(
      "click",
      showReport
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );
  } else {
    initialize();
  }

})();

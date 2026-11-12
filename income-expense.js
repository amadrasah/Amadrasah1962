
/* =====================================
   MADRASAH INCOME & EXPENSE MANAGEMENT
   ===================================== */

const ACCOUNT_KEY = "madrasah_income_expense";
const STUDENT_KEY = "madrasah_students";

let accountRecords = JSON.parse(
  localStorage.getItem(ACCOUNT_KEY) || "[]"
);

const $ = id => document.getElementById(id);

function saveRecords() {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountRecords));
}

function money(amount) {
  return Number(amount || 0).toLocaleString("bn-BD") + " টাকা";
}

function getStudents() {
  try {
    const data = JSON.parse(localStorage.getItem(STUDENT_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function findStudent() {
  const classCode = $("incomeClass").value;
  const roll = $("incomeRoll").value.trim();

  const student = getStudents().find(s =>
    String(s.classCode || s.class || s.studentClass || "") === classCode &&
    String(s.roll || s.admissionRoll || "") === roll
  );

  const info = $("incomeStudentInfo");

  if (!classCode || !roll) {
    info.innerHTML = "<p>শিক্ষার্থীর নাম: —</p><p>শিক্ষার্থী আইডি: —</p>";
    return null;
  }

  if (!student) {
    info.innerHTML = "<p>শিক্ষার্থী পাওয়া যায়নি।</p>";
    return null;
  }

  const name = student.name || student.studentName || "নাম পাওয়া যায়নি";
  const id = student.id || student.studentId || "আইডি পাওয়া যায়নি";

  info.innerHTML = `
    <p>শিক্ষার্থীর নাম: <strong>${escapeHTML(name)}</strong></p>
    <p>শিক্ষার্থী আইডি: <strong>${escapeHTML(id)}</strong></p>
  `;

  return student;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function updateSummary() {
  const income = accountRecords
    .filter(r => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const expense = accountRecords
    .filter(r => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  $("totalIncome").textContent = money(income);
  $("totalExpense").textContent = money(expense);
  $("currentBalance").textContent = money(income - expense);
}

function saveAccount() {
  const type = $("accountType").value;
  const category = $("accountCategory").value;
  const year = $("incomeYear").value;
  const amount = Number($("accountAmount").value);
  const date = $("accountDate").value;
  const note = $("accountNote").value.trim();

  if (!category || !year || !amount || amount <= 0 || !date) {
    alert("খাত, বছর, টাকার পরিমাণ এবং তারিখ পূরণ করুন।");
    return;
  }

  let student = null;

  if (type === "income" && $("incomeRoll").value.trim()) {
    student = findStudent();

    if (!student) {
      alert("শিক্ষার্থী পাওয়া যায়নি। শ্রেণি ও রোল পরীক্ষা করুন।");
      return;
    }
  }

  const record = {
    id: Date.now(),
    type,
    category,
    year,
    classCode: $("incomeClass").value,
    roll: $("incomeRoll").value.trim(),
    studentName: student
      ? student.name || student.studentName || ""
      : "",
    studentId: student
      ? student.id || student.studentId || ""
      : "",
    amount,
    date,
    note
  };

  accountRecords.push(record);
  saveRecords();
  updateSummary();

  alert("হিসাব সফলভাবে সংরক্ষিত হয়েছে।");

  $("accountAmount").value = "";
  $("accountNote").value = "";

  if (type === "income") {
    showReceipt(record);
  }
}

function showReceipt(record) {
  const receiptArea = document.querySelectorAll(".card")[3];

  if (!receiptArea) return;

  receiptArea.innerHTML = `
    <div id="receiptContent">
      <h3>আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা</h3>
      <p>নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী</p>
      <h3>মানি রসিদ</h3>
      <hr>
      <p>রসিদ নম্বর: ${record.id}</p>
      <p>শিক্ষার্থীর নাম: ${escapeHTML(record.studentName || "প্রযোজ্য নয়")}</p>
      <p>শিক্ষার্থী আইডি: ${escapeHTML(record.studentId || "প্রযোজ্য নয়")}</p>
      <p>রোল: ${escapeHTML(record.roll || "প্রযোজ্য নয়")}</p>
      <p>জমার খাত: ${escapeHTML(record.category)}</p>
      <p>টাকার পরিমাণ: <strong>${money(record.amount)}</strong></p>
      <p>তারিখ: ${escapeHTML(record.date)}</p>
      <p>বিবরণ: ${escapeHTML(record.note || "—")}</p>
      <br>
      <p>গ্রহণকারীর স্বাক্ষর: __________________</p>
    </div>
    <button type="button" onclick="printReceipt()">রসিদ প্রিন্ট</button>
  `;
}

function printReceipt() {
  const content = $("receiptContent");
  if (!content) {
    alert("প্রিন্ট করার মতো রসিদ নেই।");
    return;
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("প্রিন্ট উইন্ডো খুলতে পারেনি। ব্রাউজারের পপ-আপ অনুমতি দিন।");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>মানি রসিদ</title>
      <style>
        @page { size: A5 portrait; margin: 10mm; }
        body {
          font-family: Arial, sans-serif;
          color: #111;
          border: 1px solid #999;
          padding: 15px;
        }
        h3, p { text-align: center; }
        p { margin: 10px 0; }
        hr { border: 0; border-top: 1px solid #777; }
      </style>
    </head>
    <body>${content.innerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function showReport() {
  const type = $("reportType").value;
  const selectedDate = $("reportDate").value;

  if (!selectedDate) {
    alert("রিপোর্টের তারিখ নির্বাচন করুন।");
    return;
  }

  const filtered = accountRecords.filter(record => {
    if (type === "daily") {
      return record.date === selectedDate;
    }

    if (type === "monthly") {
      return record.date.slice(0, 7) === selectedDate.slice(0, 7);
    }

    return record.date.slice(0, 4) === selectedDate.slice(0, 4);
  });

  const income = filtered
    .filter(r => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const expense = filtered
    .filter(r => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  let html = `
    <h4>রিপোর্ট</h4>
    <p>মোট আয়: ${money(income)}</p>
    <p>মোট ব্যয়: ${money(expense)}</p>
    <p>উদ্বৃত্ত: ${money(income - expense)}</p>
    <hr>
  `;

  filtered.forEach(record => {
    html += `
      <p>
        ${escapeHTML(record.date)} —
        ${escapeHTML(record.category)} —
        ${money(record.amount)}
        (${record.type === "income" ? "আয়" : "ব্যয়"})
      </p>
    `;
  });

  if (!filtered.length) {
    html += "<p>এই সময়ের কোনো হিসাব পাওয়া যায়নি।</p>";
  }

  $("incomeExpenseReport").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  updateSummary();

  const today = new Date().toISOString().slice(0, 10);
  $("accountDate").value = today;
  $("reportDate").value = today;

  $("incomeClass").addEventListener("change", findStudent);
  $("incomeRoll").addEventListener("input", findStudent);

  const cards = document.querySelectorAll(".card");

  if (cards[0]) {
    const saveButton = cards[0].querySelector("button");
    if (saveButton) saveButton.addEventListener("click", saveAccount);
  }

  if (cards[2]) {
    const reportButton = cards[2].querySelector("button");
    if (reportButton) reportButton.addEventListener("click", showReport);
  }
});

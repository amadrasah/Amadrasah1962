
/* =====================================
   STUDENT MANAGEMENT
   Abdullah Hat Islamia Fazil Madrasah
===================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "madrasah_students";

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
      console.error("শিক্ষার্থীর তথ্য পড়তে সমস্যা:", error);
      return [];
    }
  }

  function getValue(student, keys) {
    for (const key of keys) {
      const value = student[key];
      if (value !== undefined && value !== null && value !== "") {
        return String(value);
      }
    }
    return "";
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function renderStudents() {
    const students = getStudents();

    const searchText = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    const selectedClass = classSelect
      ? classSelect.value.trim()
      : "";

    const filtered = students.filter(function (student) {
      const name = getValue(student, ["name", "studentName"]);
      const id = getValue(student, ["studentId", "id", "studentID"]);
      const roll = getValue(student, ["roll", "studentRoll"]);
      const mobile = getValue(student, ["mobile", "phone"]);
      const className = getValue(student, ["className", "class", "class_name"]);

      const searchMatch = !searchText || [
        name, id, roll, mobile, className
      ].some(value => value.toLowerCase().includes(searchText));

      const classMatch = !selectedClass || className === selectedClass;

      return searchMatch && classMatch;
    });

    studentCount.textContent =
      "মোট শিক্ষার্থী: " + filtered.length + " জন";

    if (filtered.length === 0) {
      studentList.innerHTML =
        '<tr><td colspan="8" class="empty">' +
        (students.length === 0
          ? "এখনো কোনো শিক্ষার্থীর তথ্য সংরক্ষণ করা হয়নি। ভর্তি পেজ থেকে শিক্ষার্থী যোগ করুন।"
          : "আপনার অনুসন্ধানের সঙ্গে মেলে এমন কোনো শিক্ষার্থী পাওয়া যায়নি।") +
        "</td></tr>";
      return;
    }

    studentList.innerHTML = filtered.map(function (student, index) {
      const id = getValue(student, ["studentId", "id", "studentID"]);
      const roll = getValue(student, ["roll", "studentRoll"]);
      const name = getValue(student, ["name", "studentName"]);
      const className = getValue(student, ["className", "class", "class_name"]);
      const year = getValue(student, ["year", "admissionYear"]);
      const father = getValue(student, ["father", "fatherName"]);
      const mobile = getValue(student, ["mobile", "phone"]);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(id || "—")}</td>
          <td>${escapeHTML(roll || "—")}</td>
          <td>${escapeHTML(name || "—")}</td>
          <td>${escapeHTML(className || "—")}</td>
          <td>${escapeHTML(year || "—")}</td>
          <td>${escapeHTML(father || "—")}</td>
          <td>${escapeHTML(mobile || "—")}</td>
        </tr>
      `;
    }).join("");
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderStudents);
  }

  if (classSelect) {
    classSelect.addEventListener("change", renderStudents);
  }

  // অন্য ট্যাব বা উইন্ডোতে তথ্য পরিবর্তন হলে তালিকা আপডেট
  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      renderStudents();
    }
  });

  renderStudents();

  // অন্য স্ক্রিপ্ট থেকে প্রয়োজন হলে তালিকা নতুন করে দেখানো যাবে
  window.refreshStudentList = renderStudents;

})();

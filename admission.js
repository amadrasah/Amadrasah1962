
/* ADMISSION MANAGEMENT */

const ADMISSION_KEY = "madrasah_students";

const admissionClasses = {
  nurani1: ["নূরানী ১ম জামাত", "01"],
  nurani2: ["নূরানী ২য় জামাত", "02"],
  nurani3: ["নূরানী ৩য় জামাত", "03"],
  ebtedayi4: ["ইবতেদায়ী ৪র্থ শ্রেণি", "04"],
  ebtedayi5: ["ইবতেদায়ী ৫ম শ্রেণি", "05"],
  dakhil6: ["দাখিল ৬ষ্ঠ শ্রেণি", "06"],
  dakhil7: ["দাখিল ৭ম শ্রেণি", "07"],
  dakhil8: ["দাখিল ৮ম শ্রেণি", "08"],
  dakhil9: ["দাখিল ৯ম শ্রেণি", "09"],
  dakhil10: ["দাখিল ১০ম শ্রেণি", "10"],
  alim1: ["আলিম ১ম বর্ষ", "11"],
  alim2: ["আলিম ২য় বর্ষ", "12"],
  fazil1: ["ফাজিল ১ম বর্ষ", "13"],
  fazil2: ["ফাজিল ২য় বর্ষ", "14"],
  fazil3: ["ফাজিল ৩য় বর্ষ", "15"]
};

function getAdmissionStudents() {
  try {
    return JSON.parse(localStorage.getItem(ADMISSION_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveAdmissionStudents(data) {
  localStorage.setItem(ADMISSION_KEY, JSON.stringify(data));
}

function admissionEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function getAdmissionYears() {
  let saved = [];

  try {
    saved = JSON.parse(localStorage.getItem("madrasah_years")) || [];
  } catch (error) {}

  if (!Array.isArray(saved)) {
    saved = Object.values(saved);
  }

  const years = saved.map(item => {
    if (typeof item === "object" && item !== null) {
      return String(item.year || item.value || item.name || "");
    }
    return String(item);
  }).filter(year => /^\d{4}$/.test(year));

  if (!years.length) {
    const current = new Date().getFullYear();
    years.push(String(current), String(current + 1), String(current + 2));
  }

  return [...new Set(years)].sort();
}

function loadAdmissionYears() {
  const select = document.getElementById("admissionYear");
  const previous = select.value;
  const years = getAdmissionYears();

  select.innerHTML =
    '<option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>';

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

function getNextAdmissionNumbers(year, classCode) {
  const students = getAdmissionStudents();

  const sameClass = students.filter(student =>
    String(student.year) === String(year) &&
    student.class === classCode
  );

  const serial = sameClass.length + 1;
  const roll = String(serial).padStart(3, "0");

  const studentId =
    String(year) + admissionClasses[classCode][1] + roll;

  return { studentId, roll };
}

function updateAdmissionNumbers() {
  const year = document.getElementById("admissionYear").value;
  const classCode = document.getElementById("admissionClass").value;

  const idField = document.getElementById("admissionStudentId");
  const rollField = document.getElementById("admissionRoll");

  if (!year || !classCode) {
    idField.value = "";
    rollField.value = "";
    return;
  }

  const numbers = getNextAdmissionNumbers(year, classCode);

  idField.value = numbers.studentId;
  rollField.value = numbers.roll;
}

document.getElementById("admissionYear")
  .addEventListener("change", updateAdmissionNumbers);

document.getElementById("admissionClass")
  .addEventListener("change", updateAdmissionNumbers);

document.getElementById("admissionForm")
  .addEventListener("submit", function(event) {
    event.preventDefault();

    const year = document.getElementById("admissionYear").value;
    const classCode = document.getElementById("admissionClass").value;
    const name = document.getElementById("admissionName").value.trim();

    if (!year || !classCode || !name) {
      alert("শিক্ষাবর্ষ, শ্রেণি ও শিক্ষার্থীর নাম পূরণ করুন।");
      return;
    }

    const students = getAdmissionStudents();
    const numbers = getNextAdmissionNumbers(year, classCode);

    const student = {
      id: numbers.studentId,
      studentId: numbers.studentId,
      roll: numbers.roll,
      year: year,
      class: classCode,
      className: admissionClasses[classCode][0],
      name: name,
      father: document.getElementById("admissionFather").value.trim(),
      mother: document.getElementById("admissionMother").value.trim(),
      dob: document.getElementById("admissionDOB").value,
      birthReg: document.getElementById("admissionBirthReg").value.trim(),
      gender: document.getElementById("admissionGender").value,
      religion: document.getElementById("admissionReligion").value,
      blood: document.getElementById("admissionBlood").value,
      mobile: document.getElementById("admissionMobile").value.trim(),
      previousSchool: document.getElementById("admissionPreviousSchool").value.trim(),
      address: document.getElementById("admissionAddress").value.trim(),
      admissionDate: document.getElementById("admissionDate").value,
      createdAt: new Date().toISOString()
    };

    students.push(student);
    saveAdmissionStudents(students);

    document.getElementById("admissionMessage").textContent =
      "ভর্তি সফল হয়েছে। শিক্ষার্থী আইডি: " + student.studentId +
      " | রোল: " + student.roll;

    this.reset();

    loadAdmissionYears();
    updateAdmissionNumbers();
    renderAdmissionStudents();
  });

document.getElementById("admissionForm")
  .addEventListener("reset", function() {
    setTimeout(() => {
      updateAdmissionNumbers();
    }, 0);
  });

function renderAdmissionStudents() {
  const students = getAdmissionStudents();
  const search = document.getElementById("admissionSearch")
    .value.trim().toLowerCase();

  const filtered = students.filter(student => {
    const text = [
      student.studentId,
      student.id,
      student.roll,
      student.name,
      student.father,
      student.mobile,
      student.className,
      student.year
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  document.getElementById("admissionStudentCount").textContent =
    students.length;

  const tbody = document.getElementById("admissionStudentList");

  if (!filtered.length) {
    tbody.innerHTML =
      '<tr><td colspan="7">কোনো তথ্য পাওয়া যায়নি।</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(student => `
    <tr>
      <td>${admissionEscape(student.studentId || student.id)}</td>
      <td>${admissionEscape(student.roll)}</td>
      <td>${admissionEscape(student.name)}</td>
      <td>${admissionEscape(student.father)}</td>
      <td>${admissionEscape(student.className)}</td>
      <td>${admissionEscape(student.year)}</td>
      <td>${admissionEscape(student.mobile)}</td>
    </tr>
  `).join("");
}

document.getElementById("admissionSearch")
  .addEventListener("input", renderAdmissionStudents);

loadAdmissionYears();
renderAdmissionStudents();

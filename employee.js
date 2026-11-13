
/* TEACHER & EMPLOYEE MANAGEMENT */

const EMPLOYEE_KEY = "madrasah_employees";

function getEmployees() {
  try {
    return JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveEmployees(data) {
  localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data));
}

function employeeEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

let employeePhotoData = "";

const employeeForm = document.getElementById("employeeForm");
const employeePhoto = document.getElementById("employeePhoto");
const employeePreview = document.getElementById("employeePhotoPreview");

employeePhoto.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("অনুগ্রহ করে একটি ছবি নির্বাচন করুন।");
    this.value = "";
    return;
  }

  if (file.size > 1024 * 1024) {
    alert("ছবির আকার ১ MB-এর মধ্যে রাখুন।");
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    employeePhotoData = event.target.result;
    employeePreview.src = employeePhotoData;
    employeePreview.style.display = "block";
  };

  reader.readAsDataURL(file);
});

employeeForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const employees = getEmployees();
  const editId = document.getElementById("employeeEditId").value;

  const name = document.getElementById("employeeName").value.trim();
  const designation = document.getElementById("employeeDesignation").value.trim();

  if (!name || !designation) {
    alert("নাম ও পদবি লিখুন।");
    return;
  }

  const oldEmployee = employees.find(item => item.id === editId);

  const employee = {
    id: editId || "EMP-" + Date.now(),
    name,
    designation,
    type: document.getElementById("employeeType").value,
    mobile: document.getElementById("employeeMobile").value.trim(),
    email: document.getElementById("employeeEmail").value.trim(),
    address: document.getElementById("employeeAddress").value.trim(),
    qualification: document.getElementById("employeeQualification").value.trim(),
    salary: document.getElementById("employeeSalary").value,
    joinDate: document.getElementById("employeeJoinDate").value,
    jobDetails: document.getElementById("employeeJobDetails").value.trim(),
    photo: employeePhotoData || (oldEmployee ? oldEmployee.photo : "")
  };

  if (editId) {
    const index = employees.findIndex(item => item.id === editId);

    if (index !== -1) {
      employees[index] = employee;
    }
  } else {
    employees.push(employee);
  }

  saveEmployees(employees);

  document.getElementById("employeeMessage").textContent =
    editId ? "তথ্য সফলভাবে আপডেট হয়েছে।" : "নতুন তথ্য সংরক্ষিত হয়েছে।";

  resetEmployeeForm();
  renderEmployees();
});

function renderEmployees() {
  const employees = getEmployees();
  const search = document.getElementById("employeeSearch").value
    .trim().toLowerCase();

  const filtered = employees.filter(employee => {
    const text = [
      employee.name,
      employee.designation,
      employee.type,
      employee.mobile,
      employee.id
    ].join(" ").toLowerCase();

    return text.includes(search);
  });

  document.getElementById("employeeCount").textContent = employees.length;

  const tbody = document.getElementById("employeeTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">কোনো তথ্য পাওয়া যায়নি।</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(employee => `
    <tr>
      <td>
        ${
          employee.photo
            ? `<img src="${employee.photo}" alt="ছবি"
                 style="width:45px;height:45px;object-fit:cover;border-radius:50%;">`
            : "ছবি নেই"
        }
      </td>
      <td>${employeeEscape(employee.id)}</td>
      <td>
        <strong>${employeeEscape(employee.name)}</strong><br>
        ${employeeEscape(employee.designation)}
      </td>
      <td>${employeeEscape(employee.type)}</td>
      <td>${employeeEscape(employee.mobile)}</td>
      <td>${employeeEscape(employee.qualification)}</td>
      <td>${employee.salary ? employeeEscape(employee.salary) + " টাকা" : ""}</td>
      <td>${employeeEscape(employee.joinDate)}</td>
      <td>
        <button type="button" onclick="editEmployee('${employeeEscape(employee.id)}')">
          সম্পাদনা
        </button>
        <button type="button" onclick="deleteEmployee('${employeeEscape(employee.id)}')">
          মুছুন
        </button>
        <button type="button" onclick="viewEmployee('${employeeEscape(employee.id)}')">
          বিস্তারিত
        </button>
      </td>
    </tr>
  `).join("");
}

function editEmployee(id) {
  const employee = getEmployees().find(item => item.id === id);

  if (!employee) return;

  document.getElementById("employeeEditId").value = employee.id;
  document.getElementById("employeeName").value = employee.name || "";
  document.getElementById("employeeDesignation").value = employee.designation || "";
  document.getElementById("employeeType").value = employee.type || "শিক্ষক";
  document.getElementById("employeeMobile").value = employee.mobile || "";
  document.getElementById("employeeEmail").value = employee.email || "";
  document.getElementById("employeeAddress").value = employee.address || "";
  document.getElementById("employeeQualification").value = employee.qualification || "";
  document.getElementById("employeeSalary").value = employee.salary || "";
  document.getElementById("employeeJoinDate").value = employee.joinDate || "";
  document.getElementById("employeeJobDetails").value = employee.jobDetails || "";

  employeePhotoData = employee.photo || "";

  if (employeePhotoData) {
    employeePreview.src = employeePhotoData;
    employeePreview.style.display = "block";
  } else {
    employeePreview.style.display = "none";
  }

  document.getElementById("employeeFormTitle").textContent =
    "শিক্ষক/কর্মচারীর তথ্য সম্পাদনা";

  document.getElementById("employeeSaveButton").textContent =
    "আপডেট করুন";

  document.getElementById("employeeCancelButton").style.display =
    "inline-block";

  document.getElementById("employeeForm").scrollIntoView({
    behavior: "smooth"
  });
}

function deleteEmployee(id) {
  if (!confirm("আপনি কি এই তথ্য মুছে ফেলতে চান?")) return;

  const employees = getEmployees().filter(item => item.id !== id);

  saveEmployees(employees);
  renderEmployees();
}

function viewEmployee(id) {
  const employee = getEmployees().find(item => item.id === id);

  if (!employee) return;

  alert(
    "নাম: " + employee.name +
    "\nপদবি: " + employee.designation +
    "\nধরন: " + employee.type +
    "\nমোবাইল: " + employee.mobile +
    "\nইমেইল: " + employee.email +
    "\nঠিকানা: " + employee.address +
    "\nশিক্ষাগত যোগ্যতা: " + employee.qualification +
    "\nমাসিক বেতন: " + employee.salary +
    "\nযোগদানের তারিখ: " + employee.joinDate +
    "\nচাকরির বিবরণ: " + employee.jobDetails
  );
}

function resetEmployeeForm() {
  employeeForm.reset();

  document.getElementById("employeeEditId").value = "";
  document.getElementById("employeeFormTitle").textContent =
    "নতুন শিক্ষক/কর্মচারী যোগ করুন";

  document.getElementById("employeeSaveButton").textContent =
    "তথ্য সংরক্ষণ করুন";

  document.getElementById("employeeCancelButton").style.display =
    "none";

  employeePhotoData = "";
  employeePreview.src = "";
  employeePreview.style.display = "none";
}

document.getElementById("employeeCancelButton").addEventListener(
  "click",
  resetEmployeeForm
);

document.getElementById("employeeSearch").addEventListener(
  "input",
  renderEmployees
);

renderEmployees();

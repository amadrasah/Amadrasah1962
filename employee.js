
/* =========================================
   EMPLOYEE MANAGEMENT SYSTEM
   Abdullah Hat Islamia Fazil Madrasah
   ========================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "madrasah_employees";

  const form = document.getElementById("employeeForm");
  const tableBody = document.getElementById("employeeTableBody");
  const searchInput = document.getElementById("employeeSearch");
  const message = document.getElementById("employeeMessage");
  const countElement = document.getElementById("employeeCount");

  function getEmployees() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveEmployees(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function showMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.className = type || "message";
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function renderEmployees(keyword = "") {
    if (!tableBody) return;

    const employees = getEmployees();
    const search = keyword.trim().toLowerCase();

    const filtered = employees.filter(employee => {
      const text = [
        employee.name,
        employee.designation,
        employee.type,
        employee.mobile,
        employee.employeeId
      ].join(" ").toLowerCase();

      return text.includes(search);
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center">কোনো তথ্য পাওয়া যায়নি</td></tr>';
    } else {
      filtered.forEach((employee, index) => {
        const row = document.createElement("tr");

        const cells = [
          index + 1,
          employee.employeeId,
          employee.name,
          employee.designation,
          employee.type,
          employee.mobile,
          employee.joinDate,
          ""
        ];

        cells.forEach((value, cellIndex) => {
          const td = document.createElement("td");

          if (cellIndex === 7) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "মুছুন";
            deleteButton.className = "danger";
            deleteButton.addEventListener("click", () => {
              deleteEmployee(employee.employeeId);
            });
            td.appendChild(deleteButton);
          } else {
            td.textContent = value || "-";
          }

          row.appendChild(td);
        });

        tableBody.appendChild(row);
      });
    }

    if (countElement) {
      countElement.textContent = employees.length;
    }
  }

  function deleteEmployee(id) {
    if (!confirm("এই শিক্ষক/কর্মচারীর তথ্য মুছে ফেলবেন?")) return;

    const updated = getEmployees().filter(
      employee => employee.employeeId !== id
    );

    saveEmployees(updated);
    renderEmployees(searchInput ? searchInput.value : "");
    showMessage("তথ্য মুছে ফেলা হয়েছে।", "success");
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("employeeName")?.value.trim();
      const designation =
        document.getElementById("employeeDesignation")?.value.trim();
      const type = document.getElementById("employeeType")?.value;
      const mobile =
        document.getElementById("employeeMobile")?.value.trim();
      const email =
        document.getElementById("employeeEmail")?.value.trim();
      const address =
        document.getElementById("employeeAddress")?.value.trim();
      const joinDate =
        document.getElementById("employeeJoinDate")?.value;

      if (!name || !designation || !mobile) {
        showMessage("নাম, পদবি ও মোবাইল নম্বর লিখুন।", "error");
        return;
      }

      const employees = getEmployees();

      const employee = {
        employeeId: "EMP-" + Date.now(),
        name,
        designation,
        type,
        mobile,
        email,
        address,
        joinDate,
        createdAt: new Date().toISOString()
      };

      employees.push(employee);
      saveEmployees(employees);

      form.reset();
      renderEmployees();

      showMessage("তথ্য সফলভাবে সংরক্ষণ হয়েছে।", "success");
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderEmployees(this.value);
    });
  }

  renderEmployees();

})();

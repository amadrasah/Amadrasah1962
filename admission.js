
/* ADMISSION MANAGEMENT WITH STUDENT PHOTO */

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
    const data = JSON.parse(localStorage.getItem(ADMISSION_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function saveAdmissionStudents(data) {
  try {
    localStorage.setItem(ADMISSION_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Student save error:", error);
    return false;
  }
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

/* GET ADMISSION YEARS */

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
    years.push(
      String(current),
      String(current + 1),
      String(current + 2)
    );
  }

  return [...new Set(years)].sort();
}

function loadAdmissionYears() {
  const select = document.getElementById("admissionYear");
  if (!select) return;

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

/* GENERATE STUDENT ID AND ROLL */

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
  const year = document.getElementById("admissionYear")?.value;
  const classCode = document.getElementById("admissionClass")?.value;

  const idField = document.getElementById("admissionStudentId");
  const rollField = document.getElementById("admissionRoll");

  if (!idField || !rollField) return;

  if (!year || !classCode || !admissionClasses[classCode]) {
    idField.value = "";
    rollField.value = "";
    return;
  }

  const numbers = getNextAdmissionNumbers(year, classCode);

  idField.value = numbers.studentId;
  rollField.value = numbers.roll;
}

/* COMPRESS STUDENT PHOTO */

function compressAdmissionPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("অনুগ্রহ করে একটি ছবি নির্বাচন করুন।"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("ছবির আকার ৫ MB-এর বেশি হতে পারবে না।"));
      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
      const image = new Image();

      image.onload = function() {
        const maxWidth = 500;
        const maxHeight = 600;

        let width = image.width;
        let height = image.height;

        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height,
          1
        );

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("ছবি প্রস্তুত করা যায়নি।"));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);

        context.drawImage(image, 0, 0, width, height);

        try {
          const compressedPhoto =
            canvas.toDataURL("image/jpeg", 0.78);

          resolve(compressedPhoto);
        } catch (error) {
          reject(new Error("ছবি সংকুচিত করা যায়নি।"));
        }
      };

      image.onerror = function() {
        reject(new Error("ছবিটি খোলা যাচ্ছে না। অন্য ছবি দিন।"));
      };

      image.src = event.target.result;
    };

    reader.onerror = function() {
      reject(new Error("ছবি পড়তে সমস্যা হয়েছে।"));
    };

    reader.readAsDataURL(file);
  });
}

/* PHOTO PREVIEW */

const admissionPhotoInput =
  document.getElementById("admissionPhoto");

const admissionPhotoPreview =
  document.getElementById("admissionPhotoPreview");

if (admissionPhotoInput) {
  admissionPhotoInput.addEventListener("change", function() {
    const file = this.files[0];

    if (!file) {
      if (admissionPhotoPreview) {
        admissionPhotoPreview.src =
          "https://placehold.co/120x140?text=Photo";
      }
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("অনুগ্রহ করে একটি ছবি নির্বাচন করুন।");
      this.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ছবির আকার ৫ MB-এর বেশি হতে পারবে না।");
      this.value = "";
      return;
    }

    if (admissionPhotoPreview) {
      const reader = new FileReader();

      reader.onload = function(event) {
        admissionPhotoPreview.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
}

/* ADMISSION FORM SUBMIT */

const admissionForm =
  document.getElementById("admissionForm");

if (admissionForm) {
  admissionForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const year =
      document.getElementById("admissionYear").value;

    const classCode =
      document.getElementById("admissionClass").value;

    const name =
      document.getElementById("admissionName").value.trim();

    const message =
      document.getElementById("admissionMessage");

    if (!year || !classCode || !name) {
      alert("শিক্ষাবর্ষ, শ্রেণি ও শিক্ষার্থীর নাম পূরণ করুন।");
      return;
    }

    if (!admissionClasses[classCode]) {
      alert("সঠিক শ্রেণি নির্বাচন করুন।");
      return;
    }

    const photoFile = admissionPhotoInput?.files[0] || null;

    let photoData = "";

    try {
      photoData = await compressAdmissionPhoto(photoFile);
    } catch (error) {
      alert(error.message);
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

      // শিক্ষার্থীর ছবি
      photo: photoData,

      createdAt: new Date().toISOString()
    };

    students.push(student);

    if (!saveAdmissionStudents(students)) {
      alert(
        "তথ্য সংরক্ষণ করা যায়নি। ব্রাউজারের স্টোরেজ পূর্ণ হতে পারে।"
      );
      return;
    }

    if (message) {
      message.textContent =
        "ভর্তি সফল হয়েছে। শিক্ষার্থী আইডি: " +
        student.studentId +
        " | রোল: " + student.roll;
    }

    this.reset();

    if (admissionPhotoPreview) {
      admissionPhotoPreview.src =
        "https://placehold.co/120x140?text=Photo";
    }

    loadAdmissionYears();
    updateAdmissionNumbers();
    renderAdmissionStudents();
  });

  admissionForm.addEventListener("reset", function() {
    setTimeout(() => {
      updateAdmissionNumbers();

      if (admissionPhotoPreview) {
        admissionPhotoPreview.src =
          "https://placehold.co/120x140?text=Photo";
      }
    }, 0);
  });
}

/* SHOW STUDENT LIST */

function renderAdmissionStudents() {
  const students = getAdmissionStudents();

  const searchField =
    document.getElementById("admissionSearch");

  const search = searchField
    ? searchField.value.trim().toLowerCase()
    : "";

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

  const count =
    document.getElementById("admissionStudentCount");

  if (count) {
    count.textContent = students.length;
  }

  const tbody =
    document.getElementById("admissionStudentList");

  if (!tbody) return;

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

/* SEARCH */

const admissionSearch =
  document.getElementById("admissionSearch");

if (admissionSearch) {
  admissionSearch.addEventListener(
    "input",
    renderAdmissionStudents
  );
}

/* INITIAL LOAD */

document.getElementById("admissionYear")
  ?.addEventListener("change", updateAdmissionNumbers);

document.getElementById("admissionClass")
  ?.addEventListener("change", updateAdmissionNumbers);

loadAdmissionYears();
renderAdmissionStudents();

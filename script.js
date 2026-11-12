
"use strict";

/* ==================================
   MADRASAH MANAGEMENT SYSTEM
   Main JavaScript
================================== */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Abdullah Hat Islamia Madrasah System Ready");

  // বর্তমান পেজের মেনু চিহ্নিত করা
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
});

// নিরাপদভাবে স্থানীয় তথ্য সংরক্ষণের সহায়ক ফাংশন
const MadrasahStorage = {
  save: function (key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("তথ্য সংরক্ষণ করা যায়নি:", error);
      return false;
    }
  },

  get: function (key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error("তথ্য পড়া যায়নি:", error);
      return defaultValue;
    }
  },

  remove: function (key) {
    localStorage.removeItem(key);
  }
};

// প্রতিষ্ঠানের তথ্য
const MADRASAH_INFO = {
  name: "আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা",
  englishName: "Abdullah Hat Islamia Fazil (Degree) Madrasah",
  address: "নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী",
  phone: "01814-716405",
  email: "amadrasah1962@gmail.com"
};

// শিক্ষাবর্ষ
function getMadrasahYears() {
  return MadrasahStorage.get("madrasah_years", [
    2025, 2026, 2027, 2028
  ]);
}

// নতুন শিক্ষাবর্ষ যোগ
function addMadrasahYear(year) {
  const years = getMadrasahYears();
  const newYear = Number(year);

  if (!Number.isInteger(newYear) || newYear < 2000 || newYear > 2100) {
    alert("সঠিক শিক্ষাবর্ষ লিখুন।");
    return false;
  }

  if (years.includes(newYear)) {
    alert("এই শিক্ষাবর্ষ আগে থেকেই আছে।");
    return false;
  }

  years.push(newYear);
  years.sort(function (a, b) {
    return a - b;
  });

  MadrasahStorage.save("madrasah_years", years);
  alert("নতুন শিক্ষাবর্ষ যোগ হয়েছে।");
  return true;
}

// নতুন শিক্ষাবর্ষ যোগ করার বোতাম
function addNewYear() {
  const year = prompt("নতুন শিক্ষাবর্ষ লিখুন (যেমন: 2029):");

  if (year === null || year.trim() === "") {
    return;
  }

  if (addMadrasahYear(year)) {
    document.dispatchEvent(new Event("madrasahYearsUpdated"));
  }
}

// সব পেজে শিক্ষাবর্ষের তালিকা হালনাগাদ করার সহায়ক
function populateYearDropdown(selectElement) {
  if (!selectElement) return;

  const selectedValue = selectElement.value;
  const years = getMadrasahYears();

  selectElement.innerHTML = '<option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>';

  years.forEach(function (year) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    selectElement.appendChild(option);
  });

  if (years.includes(Number(selectedValue))) {
    selectElement.value = selectedValue;
  }
}

// সব পেজে বর্তমান শিক্ষাবর্ষের তথ্য
document.addEventListener("madrasahYearsUpdated", function () {
  document.querySelectorAll("select[data-year-dropdown]").forEach(function (select) {
    populateYearDropdown(select);
  });
});

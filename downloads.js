
/* MADRASAH DOWNLOAD CENTER */

const DOWNLOAD_KEY = "madrasah_download_documents";

let downloadDocuments = JSON.parse(
  localStorage.getItem(DOWNLOAD_KEY) || "[]"
);

const down = id => document.getElementById(id);

function saveDownloadData() {
  localStorage.setItem(
    DOWNLOAD_KEY,
    JSON.stringify(downloadDocuments)
  );
}

function downloadSafe(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function addDownloadDocument() {
  const title = down("downloadTitle").value.trim();
  const category = down("downloadCategory").value;
  const url = down("downloadUrl").value.trim();
  const description = down("downloadDescription").value.trim();

  if (!title || !url) {
    alert("ডকুমেন্টের নাম ও লিংক দিন।");
    return;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    alert("সঠিক লিংক দিন।");
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    alert("শুধু নিরাপদ ওয়েব লিংক ব্যবহার করুন।");
    return;
  }

  const documentItem = {
    id: Date.now(),
    title,
    category,
    url: parsedUrl.href,
    description,
    date: new Date().toISOString().slice(0, 10)
  };

  downloadDocuments.push(documentItem);

  try {
    saveDownloadData();
  } catch {
    downloadDocuments.pop();
    alert("তথ্য সংরক্ষণ করা যায়নি।");
    return;
  }

  down("downloadTitle").value = "";
  down("downloadUrl").value = "";
  down("downloadDescription").value = "";

  showDownloadDocuments();

  alert("ডকুমেন্ট যুক্ত হয়েছে।");
}

function showDownloadDocuments() {
  const categories = [
    "formDownloads",
    "studentDownloads",
    "teacherDownloads",
    "otherDownloads"
  ];

  categories.forEach(category => {
    const container = down(category);

    const items = downloadDocuments.filter(
      item => item.category === category
    );

    container.innerHTML = items.length
      ? items.map(item => `
        <div class="card">
          <h4>${downloadSafe(item.title)}</h4>
          <p>${downloadSafe(item.description || "")}</p>
          <a href="${downloadSafe(item.url)}"
             target="_blank" rel="noopener noreferrer">
             ডাউনলোড / দেখুন
          </a>
          <button type="button"
            onclick="deleteDownloadDocument(${item.id})">
            মুছে ফেলুন
          </button>
        </div>
      `).join("")
      : "<p>এখনো কোনো ডকুমেন্ট যুক্ত করা হয়নি।</p>";
  });
}

function deleteDownloadDocument(id) {
  if (!confirm("ডকুমেন্টটি মুছে ফেলবেন?")) return;

  downloadDocuments = downloadDocuments.filter(
    item => item.id !== id
  );

  saveDownloadData();
  showDownloadDocuments();
}

document.addEventListener("DOMContentLoaded", () => {
  down("saveDownload").addEventListener(
    "click",
    addDownloadDocument
  );

  showDownloadDocuments();
});

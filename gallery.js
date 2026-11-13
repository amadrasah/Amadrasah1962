
/* MADRASAH PHOTO GALLERY */

const GALLERY_KEY = "madrasah_gallery_images";

let galleryImages = JSON.parse(
  localStorage.getItem(GALLERY_KEY) || "[]"
);

const gal = id => document.getElementById(id);

function saveGalleryData() {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(galleryImages));
}

function gallerySafe(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function addGalleryPhoto() {
  const title = gal("photoTitle").value.trim();
  const category = gal("photoCategory").value;
  const description = gal("photoDescription").value.trim();
  const file = gal("photoFile").files[0];

  if (!title || !file) {
    alert("ছবির শিরোনাম ও ছবি নির্বাচন করুন।");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("শুধু ছবি নির্বাচন করুন।");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert("ছবির আকার ৩ MB-এর বেশি হতে পারবে না।");
    return;
  }

  if (galleryImages.length >= 30) {
    alert("এই ব্রাউজারে সর্বোচ্চ ৩০টি ছবি রাখা যাবে।");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    const photo = {
      id: Date.now(),
      title,
      category,
      description,
      image: event.target.result,
      date: new Date().toISOString().slice(0, 10)
    };

    galleryImages.push(photo);

    try {
      saveGalleryData();
    } catch (error) {
      galleryImages.pop();
      alert("ব্রাউজারের জায়গা পূর্ণ হয়ে গেছে। ছোট ছবি ব্যবহার করুন।");
      return;
    }

    gal("photoTitle").value = "";
    gal("photoDescription").value = "";
    gal("photoFile").value = "";

    showGalleryPhotos();

    alert("ছবি সফলভাবে যুক্ত হয়েছে।");
  };

  reader.onerror = function() {
    alert("ছবি পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  };

  reader.readAsDataURL(file);
}

function showGalleryPhotos() {
  const filter = gal("galleryFilter").value;
  const container = gal("galleryList");

  const photos = galleryImages.filter(photo =>
    filter === "all" || photo.category === filter
  );

  if (!photos.length) {
    container.innerHTML = "<p>কোনো ছবি পাওয়া যায়নি।</p>";
    return;
  }

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
      ${photos.map(photo => `
        <div class="card">
          <img
            src="${photo.image}"
            alt="${gallerySafe(photo.title)}"
            style="width:100%;height:140px;object-fit:cover;border-radius:8px;cursor:pointer;"
            onclick="viewGalleryPhoto(${photo.id})"
          >

          <h4>${gallerySafe(photo.title)}</h4>
          <p>${gallerySafe(photo.category)}</p>
          <p>${gallerySafe(photo.description || "")}</p>

          <button type="button" onclick="deleteGalleryPhoto(${photo.id})">
            মুছে ফেলুন
          </button>
        </div>
      `).join("")}
    </div>
  `;
}

function viewGalleryPhoto(id) {
  const photo = galleryImages.find(p => p.id === id);
  if (!photo) return;

  const win = window.open("", "_blank");

  if (!win) {
    alert("ছবি বড় করে দেখতে ব্রাউজারের পপ-আপ অনুমতি দিন।");
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>${gallerySafe(photo.title)}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body {
          margin: 0;
          padding: 15px;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <h3>${gallerySafe(photo.title)}</h3>
      <img src="${photo.image}" alt="${gallerySafe(photo.title)}">
      <p>${gallerySafe(photo.description || "")}</p>
    </body>
    </html>
  `);

  win.document.close();
}

function deleteGalleryPhoto(id) {
  if (!confirm("এই ছবিটি স্থায়ীভাবে মুছে ফেলবেন?")) return;

  galleryImages = galleryImages.filter(photo => photo.id !== id);

  saveGalleryData();
  showGalleryPhotos();
}

document.addEventListener("DOMContentLoaded", () => {
  gal("savePhoto").addEventListener("click", addGalleryPhoto);
  gal("galleryFilter").addEventListener("change", showGalleryPhotos);

  showGalleryPhotos();
});


<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>একাডেমিক ক্যালেন্ডার</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<header class="header">
  <h2>আব্দুল্লাহ হাট ইসলামিয়া ফাজিল (ডিগ্রী) মাদ্রাসা</h2>
  <p>নাটেশ্বর, সোনাইমুড়ী, নোয়াখালী</p>
</header>

<nav class="nav">
  <a href="index.html">হোম</a>
  <a href="dashboard.html">ড্যাশবোর্ড</a>
  <a href="students.html">শিক্ষার্থী</a>
  <a href="exam.html">পরীক্ষা</a>
  <a href="income-expense.html">আয়-ব্যয়</a>
</nav>

<main class="container">

  <h2>একাডেমিক ক্যালেন্ডার</h2>

  <section class="card">
    <h3>নতুন কর্মসূচি যুক্ত করুন</h3>

    <label>কর্মসূচির নাম</label>
    <input type="text" id="eventTitle" placeholder="যেমন: বার্ষিক পরীক্ষা">

    <label>কর্মসূচির ধরন</label>
    <select id="eventType">
      <option value="পরীক্ষা">পরীক্ষা</option>
      <option value="ছুটি">ছুটি</option>
      <option value="ভর্তি">ভর্তি কার্যক্রম</option>
      <option value="অনুষ্ঠান">প্রতিষ্ঠানের অনুষ্ঠান</option>
      <option value="সভা">সভা</option>
      <option value="অন্যান্য">অন্যান্য</option>
    </select>

    <label>শুরুর তারিখ</label>
    <input type="date" id="eventStart">

    <label>শেষের তারিখ</label>
    <input type="date" id="eventEnd">

    <label>বিস্তারিত</label>
    <textarea id="eventDetails" placeholder="কর্মসূচির বিস্তারিত লিখুন"></textarea>

    <button type="button" id="saveEvent">কর্মসূচি সংরক্ষণ</button>
  </section>

  <section class="card">
    <h3>কর্মসূচির তালিকা</h3>

    <label>বছর নির্বাচন করুন</label>
    <select id="calendarYear">
      <option value="2026">২০২৬</option>
      <option value="2027">২০২৭</option>
      <option value="2028">২০২৮</option>
    </select>

    <div id="calendarEvents">
      কর্মসূচির তালিকা এখানে দেখা যাবে।
    </div>
  </section>

  <section class="card">
    <h3>মাসভিত্তিক ক্যালেন্ডার</h3>
    <div id="monthlyCalendar">
      ক্যালেন্ডার এখানে প্রদর্শিত হবে।
    </div>
  </section>

</main>

<script src="script.js"></script>
</body>
</html>

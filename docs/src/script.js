const quoteBox   = document.getElementById("quote");
const userInput  = document.getElementById("quote-input");
const startBtn   = document.getElementById("start-test");
const stopBtn    = document.getElementById("stop-test");
const timeEl     = document.getElementById("time");
const liveWpmEl  = document.getElementById("live-wpm");
const mistakesEl = document.getElementById("mistakes");
const timeChip   = document.getElementById("time-chip");
const pageTyping = document.getElementById("page-typing");
const pageResult = document.getElementById("page-result");
const btnTryAgain  = document.getElementById("btn-try-again");
const btnNextQuote = document.getElementById("btn-next-quote");
const btnNext      = document.getElementById("btn-next");
const langToggle   = document.getElementById("lang-toggle");

const DURATION = 60;
let quote             = "";
let timer             = null;
let timeLeft          = DURATION;
let mistakes          = 0;
let started           = false;
let startTime         = null;
let totalCorrectChars = 0;
let totalTypedChars   = 0;
let totalMistakes     = 0;
let currentLang       = "en";

// ── Fallback quotes ──
const fallbacks = {
  en: "keep going! every word you type makes you faster and more accurate over time.",
  km: "បន្តទៅ! រាល់ពាក្យដែលអ្នកវាយធ្វើឱ្យអ្នកលឿន និងត្រឹមត្រូវជាងមុន។",
};

const initialFallbacks = {
  en: "the quick brown fox jumps over the lazy dog. practice makes perfect when it comes to typing speed and accuracy.",
  km: "ការអនុវត្តជារៀងរាល់ថ្ងៃនឹងធ្វើឱ្យការវាយអក្សររបស់អ្នកលឿន និងត្រឹមត្រូវ។",
};

// ── Translations ──
const translations = {
  en: {
    badge:         "60s test",
    description:   "Type the text as fast and accurately as you can!",
    placeholder:   "Click here and start typing…",
    btnStart:      "Start Test",
    btnStop:       "Stop",
    btnNext:       "Next",
    btnTryAgain:   "↺ Try Again",
    btnNextQuote:  "Next Quote →",
    labelTime:     "⏱ Time",
    labelWpm:      "⚡ WPM",
    labelMistakes: "✗ Mistakes",
    rcWpm:         "WPM",
    rcTime:        "Time",
    rcAccuracy:    "Accuracy",
    rcMistakes:    "Mistakes",
    rcUnitWpm:     "words / min",
    rcUnitTime:    "seconds used",
    rcUnitAccuracy:"percent",
    rcUnitErrors:  "errors",
    loading:       "Loading quote",
    ratings: [
      { minWpm: 80, minAcc: 95, emoji: "🏆", label: "Elite Typist",  sub: "Top 1% speed with near-perfect accuracy." },
      { minWpm: 60, minAcc: 90, emoji: "🥇", label: "Advanced",      sub: "Excellent speed and solid accuracy." },
      { minWpm: 45, minAcc: 85, emoji: "🥈", label: "Proficient",    sub: "Above average — keep pushing!" },
      { minWpm: 30, minAcc: 75, emoji: "🥉", label: "Intermediate",  sub: "Good foundation, room to grow." },
      { minWpm: 20, minAcc: 0,  emoji: "📈", label: "Beginner",      sub: "Practice daily for faster results." },
      { minWpm: 0,  minAcc: 0,  emoji: "🌱", label: "Just Starting", sub: "Everyone starts somewhere. Keep going!" },
    ],
  },
  km: {
    badge:         "ការធ្វើតេស្ត ៦០វិនាទី",
    description:   "វាយអត្ថបទឱ្យលឿន ហើយត្រឹមត្រូវ!",
    placeholder:   "ចុចទីនេះ រួចវាយអត្ថបទ…",
    btnStart:      "ចាប់ផ្តើមតេស្ត",
    btnStop:       "ឈប់",
    btnNext:       "បន្ទាប់",
    btnTryAgain:   "↺ សាកម្តងទៀត",
    btnNextQuote:  "ចាប់ផ្ដើមបន្ទាប់ →",
    labelTime:     "⏱ ពេលវេលា",
    labelWpm:      "⚡ WPM",
    labelMistakes: "✗ កំហុស",
    rcWpm:         "WPM",
    rcTime:        "ពេលវេលា",
    rcAccuracy:    "ភាពត្រឹមត្រូវ",
    rcMistakes:    "កំហុស",
    rcUnitWpm:     "ពាក្យ / នាទី",
    rcUnitTime:    "វិនាទីប្រើ",
    rcUnitAccuracy:"ភាគរយ",
    rcUnitErrors:  "កំហុស",
    loading:       "កំពុងផ្ទុកសម្រង់",
    ratings: [
      { minWpm: 80, minAcc: 95, emoji: "🏆", label: "វាយអក្សរកំពូល",   sub: "លឿន និងត្រឹមត្រូវ — កំពូល ១%។" },
      { minWpm: 60, minAcc: 90, emoji: "🥇", label: "កម្រិតខ្ពស់",      sub: "ល្បឿនល្អ និងភាពត្រឹមត្រូវខ្ពស់។" },
      { minWpm: 45, minAcc: 85, emoji: "🥈", label: "ប្រសើរជាងមធ្យម",  sub: "ល្អប្រសើរ — បន្តព្យាយាមទៀត!" },
      { minWpm: 30, minAcc: 75, emoji: "🥉", label: "កម្រិតមធ្យម",      sub: "មូលដ្ឋានល្អ — នៅមានកន្លែងអភិវឌ្ឍ។" },
      { minWpm: 20, minAcc: 0,  emoji: "📈", label: "អ្នកចាប់ផ្តើម",    sub: "អនុវត្តជារៀងរាល់ថ្ងៃដើម្បីលើកកម្ពស់ល្បឿន។" },
      { minWpm: 0,  minAcc: 0,  emoji: "🌱", label: "ទើបតែចាប់ផ្តើម",  sub: "មនុស្សគ្រប់រូបចាប់ផ្តើមពីទីនេះ។ បន្តទៅ!" },
    ],
  },
};

// ── Set lang toggle button UI (flag + label) ──
const setLangToggleUI = (lang) => {
  if (lang === "en") {
  
       langToggle.innerHTML = `
      <span class="fi fi-gb" style="font-size:1.2rem;border-radius:3px;"></span>
      <span>English</span>
    `;
  } else {
   
     langToggle.innerHTML = `
      <span class="fi fi-kh" style="font-size:1.2rem;border-radius:3px;"></span>
      <span>ខ្មែរ</span>
    `;
  }
};

// ── Apply language to UI ──
const applyLanguage = (lang) => {
  const t = translations[lang];

  // Header
  document.getElementById("badge-text").textContent       = t.badge;
  document.getElementById("description-text").textContent = t.description;
  userInput.placeholder                                    = t.placeholder;

  // Buttons
  startBtn.textContent     = t.btnStart;
  stopBtn.textContent      = t.btnStop;
  btnNext.textContent      = t.btnNext;
  btnTryAgain.textContent  = t.btnTryAgain;
  btnNextQuote.textContent = t.btnNextQuote;

  // Lang toggle button — use innerHTML to preserve flag spans
  setLangToggleUI(lang);

  // Stat chip labels
  document.getElementById("label-time").textContent     = t.labelTime;
  document.getElementById("label-wpm").textContent      = t.labelWpm;
  document.getElementById("label-mistakes").textContent = t.labelMistakes;

  // Result card labels
  document.getElementById("rc-label-wpm").textContent      = t.rcWpm;
  document.getElementById("rc-label-time").textContent     = t.rcTime;
  document.getElementById("rc-label-accuracy").textContent = t.rcAccuracy;
  document.getElementById("rc-label-mistakes").textContent = t.rcMistakes;
  document.getElementById("rc-unit-wpm").textContent       = t.rcUnitWpm;
  document.getElementById("rc-unit-time").textContent      = t.rcUnitTime;
  document.getElementById("rc-unit-accuracy").textContent  = t.rcUnitAccuracy;
  document.getElementById("rc-unit-errors").textContent    = t.rcUnitErrors;

  // Font & lang attribute
  document.body.classList.toggle("lang-km", lang === "km");
  document.documentElement.lang = lang === "km" ? "km" : "en";
};

// ── Language toggle ──
langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "km" : "en";
  applyLanguage(currentLang);
});

// ── Page transitions ──
const showTypingPage = () => {
  pageResult.classList.remove("slide-in");
  pageTyping.classList.remove("slide-out");
};

const showResultPage = () => {
  pageTyping.classList.add("slide-out");
  pageResult.classList.add("slide-in");
};

// ── Fetch quote ──
const fetchQuote = async () => {
  const t = translations[currentLang];
  quoteBox.innerHTML = `<span style="color:var(--muted)" class="loading">${t.loading}</span>`;

  try {
    const res  = await fetch("https://dummyjson.com/quotes?limit=50");
    const data = await res.json();
    const random = data.quotes[Math.floor(Math.random() * data.quotes.length)];
    quote = random.quote.toLowerCase();
  } catch {
    quote = initialFallbacks[currentLang];
  }

  renderQuote();
};

const renderQuote = () => {
  quoteBox.innerHTML = quote.split("").map((ch, i) =>
    `<span class="quote-char" data-i="${i}">${ch === " " ? "&nbsp;" : ch}</span>`
  ).join("");
  updateProgress(0);
};

// ── Input handler — auto-starts on first keystroke ──
userInput.addEventListener("input", () => {
  if (!started && userInput.value.length === 1) {
    beginSession();
  }

  if (!started) return;

  const typed = userInput.value.toLowerCase();
  const chars = document.querySelectorAll(".quote-char");
  let errs = 0;

  chars.forEach((span, i) => {
    span.classList.remove("success", "fail", "current");
    if (i < typed.length) {
      if (typed[i] === quote[i]) span.classList.add("success");
      else { span.classList.add("fail"); errs++; }
    } else if (i === typed.length) {
      span.classList.add("current");
    }
  });

  mistakes = errs;
  mistakesEl.textContent = mistakes;

  const elapsed = (Date.now() - startTime) / 60000;
  let correctNow = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === quote[i]) correctNow++;
  }
  const liveWpm = elapsed >= 0.05
    ? Math.round(((totalCorrectChars + correctNow) / 5) / elapsed)
    : 0;
  liveWpmEl.textContent = liveWpm;

  updateProgress(typed.length / quote.length);

  if (typed.length >= quote.length) {
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === quote[i]) totalCorrectChars++;
    }
    totalTypedChars += typed.length;
    totalMistakes   += errs;
    nextQuote();
  }
});

const nextQuote = async () => {
  quoteBox.style.transition = "background 0.25s";
  quoteBox.style.background = "rgba(80,250,123,0.12)";
  userInput.disabled = true;

  await new Promise(r => setTimeout(r, 400));

  quoteBox.style.background = "";
  userInput.value = "";
  mistakes = 0;
  mistakesEl.textContent = 0;
  updateProgress(0);

  try {
    const res  = await fetch("https://dummyjson.com/quotes?limit=50");
    const data = await res.json();
    const random = data.quotes[Math.floor(Math.random() * data.quotes.length)];
    quote = random.quote.toLowerCase();
  } catch {
    quote = fallbacks[currentLang];
  }

  renderQuote();

  if (started) {
    userInput.disabled = false;
    userInput.focus();
  }
};

const updateProgress = (ratio) => {
  quoteBox.style.setProperty("--progress", ratio.toFixed(4));
  if (ratio > 0) quoteBox.classList.add("in-progress");
  else quoteBox.classList.remove("in-progress");
};

const tick = () => {
  timeLeft--;
  timeEl.textContent = timeLeft + "s";
  if (timeLeft <= 10) timeChip.classList.add("warning");
  if (timeLeft <= 0) endTest();
};

const beginSession = () => {
  userInput.disabled = false;
  userInput.focus();
  started   = true;
  startTime = Date.now();
  timer     = setInterval(tick, 1000);
  startBtn.disabled = true;
  stopBtn.disabled  = false;
  timeChip.classList.add("active");
  showTypingPage();
};

const stopTest = () => {
  clearInterval(timer);
  started = false;
  userInput.disabled = true;
  startBtn.disabled  = false;
  stopBtn.disabled   = true;
  timeChip.classList.remove("active", "warning");
};

startBtn.addEventListener("click", () => {
  if (!started) beginSession();
});

stopBtn.addEventListener("click", () => stopTest());

btnTryAgain.addEventListener("click", () => {
  resetState();
  userInput.value = "";
  renderQuote();
  userInput.disabled = false;
  userInput.focus();
  showTypingPage();
});

btnNext.addEventListener("click", () => {
  resetState();
  fetchQuote();
  userInput.value = "";
  userInput.disabled = false;
  userInput.focus();
  showTypingPage();
});

btnNextQuote.addEventListener("click", () => {
  resetState();
  fetchQuote();
  userInput.value = "";
  userInput.disabled = false;
  userInput.focus();
  showTypingPage();
});

const endTest = () => {
  clearInterval(timer);
  started            = false;
  userInput.disabled = true;
  startBtn.disabled  = false;
  stopBtn.disabled   = true;
  timeChip.classList.remove("active", "warning");
  showResults();
};

const showResults = () => {
  const timeUsed = DURATION - timeLeft;
  const typed    = userInput.value;

  let correctNow = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === quote[i]) correctNow++;
  }

  const grandCorrect  = totalCorrectChars + correctNow;
  const grandTyped    = totalTypedChars   + typed.length;
  const grandMistakes = totalMistakes     + mistakes;

  const mins     = timeUsed / 60;
  const wpm      = mins > 0 ? Math.round((grandCorrect / 5) / mins) : 0;
  const accuracy = grandTyped > 0 ? Math.round((grandCorrect / grandTyped) * 100) : 0;

  document.getElementById("r-wpm").textContent      = wpm;
  document.getElementById("r-time").textContent     = timeUsed + "s";
  document.getElementById("r-accuracy").textContent = accuracy + "%";
  document.getElementById("r-mistakes").textContent = grandMistakes;

  applyLanguage(currentLang);

  const { emoji, label, sub } = getRating(wpm, accuracy, currentLang);
  document.getElementById("rating-badge").textContent   = emoji;
  document.getElementById("rating-text").textContent    = label;
  document.getElementById("rating-sub").textContent     = sub;
  document.getElementById("rating-badge-2").textContent = emoji;
  document.getElementById("rating-text-2").textContent  = label;
  document.getElementById("rating-sub-2").textContent   = sub;

  showResultPage();
};

const getRating = (wpm, acc, lang) => {
  const ratings = translations[lang].ratings;
  for (const r of ratings) {
    if (wpm >= r.minWpm && acc >= r.minAcc) {
      return { emoji: r.emoji, label: r.label, sub: r.sub };
    }
  }
  const last = ratings[ratings.length - 1];
  return { emoji: last.emoji, label: last.label, sub: last.sub };
};

const resetState = () => {
  clearInterval(timer);
  timeLeft          = DURATION;
  mistakes          = 0;
  started           = false;
  startTime         = null;
  totalCorrectChars = 0;
  totalTypedChars   = 0;
  totalMistakes     = 0;
  timeEl.textContent     = DURATION + "s";
  liveWpmEl.textContent  = "0";
  mistakesEl.textContent = "0";
  timeChip.classList.remove("active", "warning");
  updateProgress(0);
};

window.onload = () => {
  userInput.value    = "";
  userInput.disabled = false;
  stopBtn.disabled   = true;
  applyLanguage(currentLang);
  fetchQuote();
};
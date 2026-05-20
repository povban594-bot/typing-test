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
  const btnTryAgain   = document.getElementById("btn-try-again");
  const btnNextQuote  = document.getElementById("btn-next-quote");
  const btnNext        = document.getElementById("btn-next");
  const langToggle     = document.getElementById("lang-toggle");

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

  // ── Translations ──
  const translations = {
    en: {
      badge:        "60s test",
      description:  "Type the text as fast and accurately as you can!",
      placeholder:  "Press Start Test, then type here…",
      btnStart:     "Start Test",
      btnStop:      "Stop",
      btnNext:      "Next",
      btnTryAgain:  "↺ Try Again",
      btnNextQuote: "Next Quote →",
      labelTime:    "⏱ Time",
      labelWpm:     "⚡ WPM",
      labelMistakes:"✗ Mistakes",
      rcWpm:        "WPM",
      rcTime:       "Time",
      rcAccuracy:   "Accuracy",
      rcMistakes:   "Mistakes",
      rcUnitWpm:    "words / min",
      rcUnitTime:   "seconds used",
      rcUnitAccuracy:"percent",
      rcUnitErrors: "errors",
      toggleBtn:    "🇰🇭 ខ្មែរ",
      loading:      "Loading quote",
    },
    km: {
      badge:        "ការធ្វើតេស្ត ៦០វិនាទី",
      description:  "វាយអត្ថបទឱ្យលឿន ហើយត្រឹមត្រូវ!",
      placeholder:  "ចុច ចាប់ផ្តើមតេស្ត រួចវាយអត្ថបទទីនេះ…",
      btnStart:     "ចាប់ផ្តើមតេស្ត",
      btnStop:      "ឈប់",
      btnNext:      "បន្ទាប់",
      btnTryAgain:  "↺ សាកម្តងទៀត",
      btnNextQuote: "សម្រង់បន្ទាប់ →",
      labelTime:    "⏱ ពេលវេលា",
      labelWpm:     "⚡ WPM",
      labelMistakes:"✗ កំហុស",
      rcWpm:        "WPM",
      rcTime:       "ពេលវេលា",
      rcAccuracy:   "ភាពត្រឹមត្រូវ",
      rcMistakes:   "កំហុស",
      rcUnitWpm:    "ពាក្យ / នាទី",
      rcUnitTime:   "វិនាទីប្រើ",
      rcUnitAccuracy:"ភាគរយ",
      rcUnitErrors: "កំហុស",
      toggleBtn:    "🇺🇸 English",
      loading:      "កំពុងផ្ទុកសម្រង់",
    
    }
  };

  // ── Apply language to UI ──
  const applyLanguage = (lang) => {
    const t = translations[lang];

    document.querySelector("header span").textContent      = t.badge;
    document.querySelector(".description").textContent     = t.description;
    userInput.placeholder                                  = t.placeholder;
    startBtn.textContent                                   = t.btnStart;
    stopBtn.textContent                                    = t.btnStop;
    btnNext.textContent                                    = t.btnNext;
    btnTryAgain.textContent                                = t.btnTryAgain;
    btnNextQuote.textContent                               = t.btnNextQuote;
    langToggle.textContent                                 = t.toggleBtn;

    // Stats bar labels
    const labels = document.querySelectorAll(".stat-chip .label");
    if (labels[0]) labels[0].textContent = t.labelTime;
    if (labels[1]) labels[1].textContent = t.labelWpm;
    if (labels[2]) labels[2].textContent = t.labelMistakes;

    // Result card labels
    const rcLabels = document.querySelectorAll(".rc-label");
    if (rcLabels[0]) rcLabels[0].textContent = t.rcWpm;
    if (rcLabels[1]) rcLabels[1].textContent = t.rcTime;
    if (rcLabels[2]) rcLabels[2].textContent = t.rcAccuracy;
    if (rcLabels[3]) rcLabels[3].textContent = t.rcMistakes;

    const rcUnits = document.querySelectorAll(".rc-unit");
    if (rcUnits[0]) rcUnits[0].textContent = t.rcUnitWpm;
    if (rcUnits[1]) rcUnits[1].textContent = t.rcUnitTime;
    if (rcUnits[2]) rcUnits[2].textContent = t.rcUnitAccuracy;
    if (rcUnits[3]) rcUnits[3].textContent = t.rcUnitErrors;

    // Font & lang attribute
    document.body.classList.toggle("lang-km", lang === "km");
    document.documentElement.lang = lang === "km" ? "km" : "en";
  };

  // ── Language toggle click ──
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
      quote = "the quick brown fox jumps over the lazy dog. practice makes perfect when it comes to typing speed and accuracy.";
    }

    renderQuote();
  };

  const renderQuote = () => {
    quoteBox.innerHTML = quote.split("").map((ch, i) =>
      `<span class="quote-char" data-i="${i}">${ch === " " ? "&nbsp;" : ch}</span>`
    ).join("");
    updateProgress(0);
  };

  userInput.addEventListener("input", () => {
    if (!started) return;

    const typed = userInput.value.toLowerCase();
    const chars = document.querySelectorAll(".quote-char");
    let errs = 0;

    chars.forEach((span, i) => {
      span.classList.remove("success", "fail", "current");

      if (i < typed.length) {
        if (typed[i] === quote[i]) {
          span.classList.add("success");
        } else {
          span.classList.add("fail");
          errs++;
        }
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
    quoteBox.style.transition = 'background 0.25s';
    quoteBox.style.background = 'rgba(80,250,123,0.12)';
    userInput.disabled = true;

    await new Promise(r => setTimeout(r, 400));

    quoteBox.style.background = '';
    userInput.value = '';
    mistakes = 0;
    mistakesEl.textContent = 0;
    updateProgress(0);

    try {
      const res  = await fetch("https://dummyjson.com/quotes?limit=50");
      const data = await res.json();
      const random = data.quotes[Math.floor(Math.random() * data.quotes.length)];
      quote = random.quote.toLowerCase();
    } catch {
      quote = "keep going! every word you type makes you faster and more accurate over time.";
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
    userInput.value    = "";
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
    startBtn.disabled = false;
    stopBtn.disabled = true;
    timeChip.classList.remove("active", "warning");
  };

  startBtn.addEventListener("click", () => beginSession());
  stopBtn.addEventListener("click", () => stopTest());

  // Try Again — same quote, fresh timer
  btnTryAgain.addEventListener("click", () => {
    resetState();
    userInput.value = "";
    renderQuote();
    beginSession();
  });

  btnNext.addEventListener("click", () => {
    resetState();
    fetchQuote().then(() => beginSession());
  });

  // Next Quote — new quote, fresh timer
  btnNextQuote.addEventListener("click", () => {
    resetState();
    fetchQuote().then(() => beginSession());
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

    const { emoji, label, sub } = getRating(wpm, accuracy);
    document.getElementById("rating-badge").textContent   = emoji;
    document.getElementById("rating-text").textContent    = label;
    document.getElementById("rating-sub").textContent     = sub;
    document.getElementById("rating-badge-2").textContent = emoji;
    document.getElementById("rating-text-2").textContent  = label;
    document.getElementById("rating-sub-2").textContent   = sub;

    showResultPage();
  };

const getRating = (wpm, acc) => {
    if (wpm >= 80 && acc >= 95) return { emoji: "🏆", label: "Elite Typist",   sub: "Top 1% speed with near-perfect accuracy." };
    if (wpm >= 60 && acc >= 90) return { emoji: "🥇", label: "Advanced",       sub: "Excellent speed and solid accuracy." };
    if (wpm >= 45 && acc >= 85) return { emoji: "🥈", label: "Proficient",     sub: "Above average — keep pushing!" };
    if (wpm >= 30 && acc >= 75) return { emoji: "🥉", label: "Intermediate",   sub: "Good foundation, room to grow." };
    if (wpm >= 20)              return { emoji: "📈", label: "Beginner",        sub: "Practice daily for faster results." };
    return                             { emoji: "🌱", label: "Just Starting",   sub: "Everyone starts somewhere. Keep going!" };
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
    userInput.disabled = true;
    stopBtn.disabled   = true;
    applyLanguage(currentLang); // apply default EN on load
    fetchQuote();
  };
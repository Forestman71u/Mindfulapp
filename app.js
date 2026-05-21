const STORAGE_KEY = "mindfulResetSessions";
const CURRENT_KEY = "mindfulResetCurrentSession";

const USERS = [
  { id: "caregiver", label: "Caregiver 1", emoji: "🧑" },
  { id: "child1", label: "Child 1", emoji: "🧒" },
  { id: "child2", label: "Child 2", emoji: "👧" }
];

const EMOTIONS = [
  "Calm", "Safe", "Good", "Hopeful", "Comfortable", "Loved", "Empathy",
  "Angry", "Tired", "Annoyed", "Insecure", "Numb", "Burned Out", "Furious",
  "Guilty", "Lonely", "Confused", "Frustrated", "Worried", "Lost", "Scared",
  "Sad", "Ashamed", "Tense", "Shocked", "Disconnected"
];

const ACTIVITIES = [
  {
    id: "Short Break",
    icon: "🌿",
    description: "Step away, drink water, stretch, or sit quietly."
  },
  {
    id: "Meditation/Breathing",
    icon: "🫧",
    description: "Slow breathing and a simple guided pause."
  },
  {
    id: "Calm my Body",
    icon: "🤲",
    description: "Relax muscles, unclench jaw, and release tension."
  },
  {
    id: "Distraction",
    icon: "🎧",
    description: "Choose a gentle distraction while feelings settle."
  },
  {
    id: "Self-Soothe",
    icon: "🧸",
    description: "Use comfort, warmth, music, or a grounding object."
  }
];

const FLOW = [
  "welcome", "character", "feelings", "intensity", "trigger", "activities",
  "time", "doActivity", "rerate", "celebration", "reflect"
];

let route = location.hash.replace("#", "") || "welcome";
let timerInterval = null;

function defaultCurrentSession() {
  return {
    participants: ["caregiver"],
    emotionsByUser: { caregiver: [], child1: [], child2: [] },
    intensityStartByUser: { caregiver: 5, child1: 5, child2: 5 },
    trigger: "",
    chosenActivities: [],
    durationMinutes: 1,
    intensityEndByUser: { caregiver: 3, child1: 3, child2: 3 },
    reflection: {},
    timestamp: new Date().toISOString()
  };
}

function getCurrent() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY)) || defaultCurrentSession();
  } catch {
    return defaultCurrentSession();
  }
}

function setCurrent(value) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(value));
}

function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSession(session) {
  const sessions = getSessions();
  sessions.push({ ...session, timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function seedData() {
  if (getSessions().length) return;

  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const mock = [
    {
      participants: ["caregiver"], emotionsByUser: { caregiver: ["Tired", "Burned Out"], child1: [], child2: [] },
      intensityStartByUser: { caregiver: 8, child1: 0, child2: 0 }, trigger: "Long workday",
      chosenActivities: ["Short Break", "Meditation/Breathing"], durationMinutes: 5,
      intensityEndByUser: { caregiver: 4, child1: 0, child2: 0 }, reflection: { proud: "I paused instead of reacting." }, timestamp: daysAgo(5)
    },
    {
      participants: ["child1"], emotionsByUser: { caregiver: [], child1: ["Frustrated", "Sad"], child2: [] },
      intensityStartByUser: { caregiver: 0, child1: 7, child2: 0 }, trigger: "Homework felt hard",
      chosenActivities: ["Calm my Body"], durationMinutes: 10,
      intensityEndByUser: { caregiver: 0, child1: 3, child2: 0 }, reflection: { learned: "Breaks help." }, timestamp: daysAgo(4)
    },
    {
      participants: ["child2"], emotionsByUser: { caregiver: [], child1: [], child2: ["Scared", "Worried"] },
      intensityStartByUser: { caregiver: 0, child1: 0, child2: 6 }, trigger: "Bedtime worries",
      chosenActivities: ["Self-Soothe"], durationMinutes: 5,
      intensityEndByUser: { caregiver: 0, child1: 0, child2: 2 }, reflection: { remember: "Use the stuffed animal and breathing." }, timestamp: daysAgo(3)
    },
    {
      participants: ["caregiver", "child1"], emotionsByUser: { caregiver: ["Annoyed"], child1: ["Angry"], child2: [] },
      intensityStartByUser: { caregiver: 6, child1: 9, child2: 0 }, trigger: "Sibling conflict",
      chosenActivities: ["Short Break", "Distraction"], durationMinutes: 15,
      intensityEndByUser: { caregiver: 3, child1: 5, child2: 0 }, reflection: { cause: "Too much noise and arguing." }, timestamp: daysAgo(2)
    },
    {
      participants: ["caregiver"], emotionsByUser: { caregiver: ["Calm", "Hopeful"], child1: [], child2: [] },
      intensityStartByUser: { caregiver: 3, child1: 0, child2: 0 }, trigger: "Morning check-in",
      chosenActivities: ["Meditation/Breathing"], durationMinutes: 1,
      intensityEndByUser: { caregiver: 1, child1: 0, child2: 0 }, reflection: { notes: "Good way to start the day." }, timestamp: daysAgo(1)
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
}

function navigate(nextRoute) {
  route = nextRoute;
  location.hash = nextRoute;
  render();
}

window.addEventListener("hashchange", () => {
  route = location.hash.replace("#", "") || "welcome";
  render();
});

function app() {
  return document.getElementById("app");
}

function userLabel(userId) {
  return USERS.find(u => u.id === userId)?.label || userId;
}

function flowProgress() {
  const index = FLOW.indexOf(route);
  if (index === -1) return "";
  const pct = Math.round(((index + 1) / FLOW.length) * 100);
  return `
    <div class="progress-wrap" aria-label="Progress">
      <div class="progress-meta">
        <span>Step ${index + 1} of ${FLOW.length}</span>
        <span>${pct}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
  `;
}

function shell(content, showProgress = true) {
  app().innerHTML = `
    ${showProgress ? flowProgress() : ""}
    <section class="card">${content}</section>
  `;
  app().focus();
  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.nav === route);
  });
}

function renderWelcome() {
  shell(`
    <div class="hero">
      <span class="kicker">Family mindfulness helper</span>
      <h2 class="hero-title">Pause. Notice. Reset.</h2>
      <p class="hero-subtitle">
        Use this quick check-in when emotions feel big. Pick who is participating, name the feeling,
        choose a calming activity, and notice what changed.
      </p>
      <div class="notice">
        This app is a coping-skills and mindfulness helper. It is not a medical, emergency, or therapy replacement.
      </div>
      <div class="actions">
        <button class="primary-btn" onclick="startFlow()">Start</button>
        <button class="secondary-btn" onclick="navigate('menu')">Take me home!</button>
      </div>
    </div>
  `, false);
}

function startFlow() {
  setCurrent(defaultCurrentSession());
  navigate("character");
}

function renderCharacter() {
  const current = getCurrent();
  const cards = USERS.map(u => `
    <button class="avatar-card selectable ${current.participants.includes(u.id) ? "selected" : ""}"
      onclick="toggleParticipant('${u.id}')"
      aria-pressed="${current.participants.includes(u.id)}">
      <div class="avatar-face" aria-hidden="true">${u.emoji}</div>
      <h3>${u.label}</h3>
      <p class="small-muted">${current.participants.includes(u.id) ? "Selected" : "Tap to include"}</p>
    </button>
  `).join("");

  shell(`
    <h2 class="page-title">Who is checking in?</h2>
    <p class="page-copy">Select one or more people for this session.</p>
    <div class="grid grid-3">${cards}</div>
    <div class="actions">
      <button class="ghost-btn" onclick="navigate('welcome')">Back</button>
      <button class="primary-btn" onclick="navigate('feelings')" ${current.participants.length ? "" : "disabled"}>Next</button>
    </div>
  `);
}

function toggleParticipant(id) {
  const current = getCurrent();
  const has = current.participants.includes(id);
  current.participants = has
    ? current.participants.filter(p => p !== id)
    : [...current.participants, id];
  if (current.participants.length === 0) current.participants = [id];
  setCurrent(current);
  renderCharacter();
}

function renderFeelings() {
  const current = getCurrent();
  const participantTabs = current.participants.map(id => `
    <div class="form-group">
      <label>${userLabel(id)}</label>
      <div class="chip-grid">
        ${EMOTIONS.map(e => `
          <button class="emotion-chip ${current.emotionsByUser[id]?.includes(e) ? "selected" : ""}"
            onclick="toggleEmotion('${id}', '${e}')"
            aria-pressed="${current.emotionsByUser[id]?.includes(e)}">${e}</button>
        `).join("")}
      </div>
    </div>
  `).join("");

  const hasEmotion = current.participants.some(id => current.emotionsByUser[id]?.length);

  shell(`
    <h2 class="page-title">What are you feeling right now?</h2>
    <p class="page-copy">Pick as many as fit. It is okay to choose more than one.</p>
    ${participantTabs}
    <div class="actions">
      <button class="ghost-btn" onclick="navigate('character')">Back</button>
      <button class="primary-btn" onclick="navigate('intensity')" ${hasEmotion ? "" : "disabled"}>Next</button>
    </div>
  `);
}

function toggleEmotion(userId, emotion) {
  const current = getCurrent();
  const list = current.emotionsByUser[userId] || [];
  current.emotionsByUser[userId] = list.includes(emotion)
    ? list.filter(e => e !== emotion)
    : [...list, emotion];
  setCurrent(current);
  renderFeelings();
}

function renderIntensity(kind = "start") {
  const current = getCurrent();
  const key = kind === "end" ? "intensityEndByUser" : "intensityStartByUser";
  const title = kind === "end" ? "How big do these emotions feel now?" : "How big do these emotions feel?";
  const next = kind === "end" ? "celebration" : "trigger";

  const sliders = current.participants.map(id => `
    <div class="slider-row">
      <header>
        <label for="${key}-${id}">${userLabel(id)}</label>
        <span class="slider-value">${current[key][id]}</span>
      </header>
      <input id="${key}-${id}" type="range" min="0" max="10" value="${current[key][id]}"
        oninput="updateIntensity('${key}', '${id}', this.value)" />
      <p class="small-muted">${(current.emotionsByUser[id] || []).join(", ") || "No emotion selected"}</p>
    </div>
  `).join("");

  shell(`
    <h2 class="page-title">${title}</h2>
    <p class="page-copy">Use 0 for tiny and 10 for huge.</p>
    ${sliders}
    <div class="actions">
      <button class="ghost-btn" onclick="navigate('${kind === "end" ? "doActivity" : "feelings"}')">Back</button>
      ${kind === "end"
        ? `<button class="secondary-btn" onclick="navigate('activities')">Yes, let’s do more!</button>`
        : ""}
      <button class="primary-btn" onclick="navigate('${next}')">${kind === "end" ? "No, I feel better now" : "Next"}</button>
    </div>
  `);
}

function updateIntensity(key, id, value) {
  const current = getCurrent();
  current[key][id] = Number(value);
  if (key === "intensityStartByUser" && current.intensityEndByUser[id] === 3) {
    current.intensityEndByUser[id] = Math.max(0, Number(value) - 2);
  }
  setCurrent(current);
  renderIntensity(key === "intensityEndByUser" ? "end" : "start");
}

function renderTrigger() {
  const current = getCurrent();
  shell(`
    <h2 class="page-title">Identify the trigger</h2>
    <p class="page-copy">What happened right before the feelings got big?</p>
    <div class="form-group">
      <label for="trigger">Trigger</label>
      <input id="trigger" type="text" value="${escapeHtml(current.trigger || "")}" placeholder="Example: noise, conflict, homework, work stress" />
    </div>
    <div class="actions">
      <button class="ghost-btn" onclick="navigate('intensity')">Back</button>
      <button class="secondary-btn" onclick="saveTrigger(true)">Skip</button>
      <button class="primary-btn" onclick="saveTrigger(false)">Next</button>
    </div>
  `);
}

function saveTrigger(skip) {
  const current = getCurrent();
  current.trigger = skip ? "" : document.getElementById("trigger").value.trim();
  setCurrent(current);
  navigate("activities");
}

function renderActivities() {
  const current = getCurrent();
  const cards = ACTIVITIES.map(a => `
    <button class="activity-card selectable ${current.chosenActivities.includes(a.id) ? "selected" : ""}"
      onclick="toggleActivity('${a.id}')"
      aria-pressed="${current.chosenActivities.includes(a.id)}">
      <h3>${a.icon} ${a.id}</h3>
      <p class="small-muted">${a.description}</p>
    </button>
  `).join("");

  shell(`
    <h2 class="page-title">What would be most helpful right now?</h2>
    <p class="page-copy">You can select multiple or skip if you just want to use the timer.</p>
    <div class="grid grid-2">${cards}</div>
    <div class="actions">
      <button class="ghost-btn" onclick="navigate('trigger')">Back</button>
      <button class="secondary-btn" onclick="navigate('time')">Skip</button>
      <button class="primary-btn" onclick="navigate('time')">Next</button>
    </div>
  `);
}

function toggleActivity(id) {
  const current = getCurrent();
  current.chosenActivities = current.chosenActivities.includes(id)
    ? current.chosenActivities.filter(a => a !== id)
    : [...current.chosenActivities, id];
  setCurrent(current);
  renderActivities();
}

function renderTime() {
  const current = getCurrent();
  const times = [
    { label: "1m", value: 1 },
    { label: "5m", value: 5 },
    { label: "10m", value: 10 },
    { label: "15–20m", value: 15 },
    { label: "30m", value: 30 },
    { label: "60m+", value: 60 }
  ];

  shell(`
    <h2 class="page-title">How much time do you have?</h2>
    <p class="page-copy">Choose a realistic amount of time. Even one minute counts.</p>
    <div class="grid grid-3">
      ${times.map(t => `
        <button class="activity-card selectable ${current.durationMinutes === t.value ? "selected" : ""}"
          onclick="pickTime(${t.value})">${t.label}</button>
      `).join("")}
    </div>
    <div class="actions">
      <button class="ghost-btn" onclick="navigate('activities')">Back</button>
      <button class="primary-btn" onclick="navigate('doActivity')">Start activity</button>
    </div>
  `);
}

function pickTime(value) {
  const current = getCurrent();
  current.durationMinutes = value;
  setCurrent(current);
  renderTime();
}

function renderDoActivity() {
  const current = getCurrent();
  const activityText = current.chosenActivities.length ? current.chosenActivities.join(", ") : "Quiet reset";
  const seconds = Math.max(1, Number(current.durationMinutes || 1)) * 60;

  shell(`
    <h2 class="page-title">Do the activity</h2>
    <p class="page-copy"><strong>${activityText}</strong>. Breathe slowly. Notice your body. Let the feeling move through.</p>
    <div class="timer-circle" id="timerCircle">
      <div>
        <div class="timer-time" id="timerDisplay">${formatTime(seconds)}</div>
        <p class="small-muted" style="text-align:center;margin:0;">remaining</p>
      </div>
    </div>
    <div class="actions">
      <button class="secondary-btn" id="pauseBtn" onclick="toggleTimer()">Pause</button>
      <button class="primary-btn" onclick="finishActivity()">Done</button>
    </div>
  `);

  startTimer(seconds);
}

function startTimer(totalSeconds) {
  clearInterval(timerInterval);
  let remaining = totalSeconds;
  let paused = false;

  window.toggleTimer = () => {
    paused = !paused;
    document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
  };

  function draw() {
    const pct = Math.round(((totalSeconds - remaining) / totalSeconds) * 100);
    document.getElementById("timerDisplay").textContent = formatTime(remaining);
    document.getElementById("timerCircle").style.setProperty("--timer-progress", `${pct}%`);
  }

  draw();

  timerInterval = setInterval(() => {
    if (paused) return;
    remaining -= 1;
    draw();
    if (remaining <= 0) {
      clearInterval(timerInterval);
      finishActivity();
    }
  }, 1000);
}

function finishActivity() {
  clearInterval(timerInterval);
  navigate("rerate");
}

function renderCelebration() {
  const confetti = Array.from({ length: 26 }).map((_, i) => {
    const left = Math.round((i / 26) * 100);
    const delay = (i % 8) * 0.22;
    return `<span style="left:${left}%;animation-delay:${delay}s"></span>`;
  }).join("");

  shell(`
    <h2 class="page-title">Celebration Page!</h2>
    <p class="page-copy">You paused, noticed what was happening, and tried something helpful. That is a win.</p>
    <div class="confetti" aria-hidden="true">${confetti}</div>
    <div class="notice" style="margin-top:1rem;">
      Earned: <strong>Reset Coin</strong> 🪙
    </div>
    <div class="actions">
      <button class="primary-btn" onclick="navigate('reflect')">Reflect</button>
      <button class="secondary-btn" onclick="completeWithoutReflection()">Skip reflection</button>
    </div>
  `);
}

function completeWithoutReflection() {
  saveSession(getCurrent());
  localStorage.removeItem(CURRENT_KEY);
  navigate("stats");
}

function renderReflect() {
  const fields = [
    ["cause", "What happened to cause the distress?"],
    ["reaction", "How did you react?"],
    ["proud", "What are you proud of?"],
    ["learned", "What did you learn?"],
    ["remember", "What do you want to remember next time?"],
    ["notes", "Any Other Notes"]
  ];

  shell(`
    <h2 class="page-title">Would you like to reflect?</h2>
    <p class="page-copy">Optional journaling can help you notice patterns over time.</p>
    <div id="reflectionFields">
      ${fields.map(([id, label]) => `
        <div class="form-group">
          <label for="${id}">${label}</label>
          <textarea id="${id}" placeholder="Write a few words..."></textarea>
        </div>
      `).join("")}
    </div>
    <div class="actions">
      <button class="primary-btn" onclick="saveReflection()">Yes, please!</button>
      <button class="secondary-btn" onclick="completeWithoutReflection()">No thanks, maybe next time.</button>
    </div>
  `);
}

function saveReflection() {
  const current = getCurrent();
  current.reflection = {
    cause: document.getElementById("cause").value.trim(),
    reaction: document.getElementById("reaction").value.trim(),
    proud: document.getElementById("proud").value.trim(),
    learned: document.getElementById("learned").value.trim(),
    remember: document.getElementById("remember").value.trim(),
    notes: document.getElementById("notes").value.trim()
  };
  saveSession(current);
  localStorage.removeItem(CURRENT_KEY);
  navigate("stats");
}

function renderStats() {
  const sessions = getSessions();
  const totalSessions = sessions.length;
  const avgReduction = averageReduction(sessions);
  const topActivities = mostEffectiveActivities(sessions);
  const emotionCounts = emotionBreakdown(sessions);
  const rows = sessions.slice().reverse().map(s => {
    const date = new Date(s.timestamp).toLocaleDateString();
    const users = s.participants.map(userLabel).join(", ");
    const emotions = s.participants.flatMap(p => s.emotionsByUser[p] || []).join(", ");
    const activities = s.chosenActivities.join(", ") || "Quiet reset";
    const reduction = sessionReduction(s).toFixed(1);
    return `<tr><td>${date}</td><td>${users}</td><td>${emotions}</td><td>${activities}</td><td>${reduction}</td></tr>`;
  }).join("");

  shell(`
    <h2 class="page-title">Stats</h2>
    <p class="page-copy">These are simple local-only insights based on completed sessions saved in your browser.</p>

    <div class="stats-grid">
      <div class="stat-card"><span class="small-muted">Days Logged</span><strong>${totalSessions}</strong></div>
      <div class="stat-card"><span class="small-muted">Avg. intensity reduction</span><strong>${avgReduction.toFixed(1)}</strong></div>
      <div class="stat-card"><span class="small-muted">Top activity</span><strong>${topActivities[0]?.name || "None yet"}</strong></div>
    </div>

    <h3>Most Effective Activities</h3>
    <div class="grid grid-3">
      ${topActivities.slice(0, 3).map(a => `
        <div class="stat-card"><span class="small-muted">${a.name}</span><strong>${a.avg.toFixed(1)}</strong><p class="small-muted">avg. reduction</p></div>
      `).join("") || `<p class="small-muted">Complete a session to see activity results.</p>`}
    </div>

    <h3>My Emotions</h3>
    <div class="chart">${barChart(emotionCounts)}</div>

    <h3>Intensity Trend</h3>
    <div class="chart">${lineChart(sessions)}</div>

    <h3>Days Logged</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Who</th><th>Emotions</th><th>Activities</th><th>Reduction</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="actions">
      <button class="primary-btn" onclick="startFlow()">Start another check-in</button>
      <button class="danger-btn" onclick="resetData()">Reset demo data</button>
    </div>
  `, false);
}

function averageReduction(sessions) {
  if (!sessions.length) return 0;
  return sessions.reduce((sum, s) => sum + sessionReduction(s), 0) / sessions.length;
}

function sessionReduction(session) {
  const reductions = session.participants.map(p => {
    const start = Number(session.intensityStartByUser[p] || 0);
    const end = Number(session.intensityEndByUser?.[p] || 0);
    return Math.max(0, start - end);
  });
  return reductions.length ? reductions.reduce((a, b) => a + b, 0) / reductions.length : 0;
}

function mostEffectiveActivities(sessions) {
  const map = {};
  sessions.forEach(s => {
    const reduction = sessionReduction(s);
    (s.chosenActivities.length ? s.chosenActivities : ["Quiet reset"]).forEach(a => {
      map[a] = map[a] || [];
      map[a].push(reduction);
    });
  });

  return Object.entries(map)
    .map(([name, values]) => ({ name, avg: values.reduce((a, b) => a + b, 0) / values.length }))
    .sort((a, b) => b.avg - a.avg);
}

function emotionBreakdown(sessions) {
  const counts = {};
  sessions.forEach(s => {
    s.participants.forEach(p => {
      (s.emotionsByUser[p] || []).forEach(e => {
        counts[e] = (counts[e] || 0) + 1;
      });
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function barChart(counts) {
  if (!counts.length) return `<p class="small-muted">No emotion data yet.</p>`;
  const max = Math.max(...counts.map(([, count]) => count));
  return counts.slice(0, 10).map(([emotion, count]) => `
    <div style="margin-bottom:.7rem">
      <div style="display:flex;justify-content:space-between;gap:1rem">
        <strong>${emotion}</strong><span>${count}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>
    </div>
  `).join("");
}

function lineChart(sessions) {
  if (!sessions.length) return `<p class="small-muted">No trend data yet.</p>`;

  const points = sessions.slice(-8).map((s, i) => {
    const avgStart = s.participants.reduce((sum, p) => sum + Number(s.intensityStartByUser[p] || 0), 0) / s.participants.length;
    const x = 40 + i * 80;
    const y = 190 - avgStart * 16;
    return { x, y, label: new Date(s.timestamp).toLocaleDateString() };
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5"><title>${p.label}</title></circle>`).join("");

  return `
    <svg viewBox="0 0 680 220" width="100%" height="220" role="img" aria-label="Intensity trend line">
      <line x1="30" y1="190" x2="650" y2="190" stroke="#ded6c8" />
      <line x1="30" y1="30" x2="30" y2="190" stroke="#ded6c8" />
      <polyline points="${polyline}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
      <text x="34" y="32" font-size="12" fill="#657068">10</text>
      <text x="34" y="190" font-size="12" fill="#657068">0</text>
    </svg>
  `;
}

function resetData() {
  if (!confirm("Reset all saved sessions and reload mock demo data?")) return;
  localStorage.removeItem(STORAGE_KEY);
  seedData();
  renderStats();
}

function renderResources() {
  shell(`
    <h2 class="page-title">Resources</h2>
    <p class="page-copy">Add parent resources, quick references, and calming ideas here.</p>
    <div class="grid grid-2">
      <div class="resource-card">
        <h3>Resources for Parents</h3>
        <ul class="inline-list">
          <li>Add your favorite parenting, mindfulness, or therapy-informed links.</li>
          <li>Add crisis/emergency resources if appropriate for your audience.</li>
        </ul>
      </div>
      <div class="resource-card">
        <h3>Quick Reference</h3>
        <ul class="inline-list">
          <li>Name the feeling.</li>
          <li>Lower the intensity.</li>
          <li>Reflect after the moment has passed.</li>
        </ul>
      </div>
      <div class="resource-card">
        <h3>Skip to Activities</h3>
        <p class="small-muted">Go straight to calming tools when there is no time for a full check-in.</p>
        <button class="secondary-btn" onclick="navigate('activities')">Open activities</button>
      </div>
      <div class="resource-card">
        <h3>Notes</h3>
        <p class="small-muted">This is a placeholder for family rules, mantras, or reminders.</p>
      </div>
    </div>
  `, false);
}

function renderMenu() {
  const links = [
    ["welcome", "Home"],
    ["character", "Start check-in"],
    ["activities", "Skip to Activities"],
    ["stats", "Stats"],
    ["resources", "Resources"]
  ];

  shell(`
    <h2 class="page-title">Menu</h2>
    <p class="page-copy">Jump to a major section.</p>
    <div class="menu-list">
      ${links.map(([id, label]) => `<button onclick="navigate('${id}')">${label}</button>`).join("")}
    </div>
  `, false);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function render() {
  clearInterval(timerInterval);
  switch (route) {
    case "welcome": renderWelcome(); break;
    case "character": renderCharacter(); break;
    case "feelings": renderFeelings(); break;
    case "intensity": renderIntensity("start"); break;
    case "trigger": renderTrigger(); break;
    case "activities": renderActivities(); break;
    case "time": renderTime(); break;
    case "doActivity": renderDoActivity(); break;
    case "rerate": renderIntensity("end"); break;
    case "celebration": renderCelebration(); break;
    case "reflect": renderReflect(); break;
    case "stats": renderStats(); break;
    case "resources": renderResources(); break;
    case "menu": renderMenu(); break;
    default: navigate("welcome");
  }
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-nav]");
  if (navButton) navigate(navButton.dataset.nav);

  if (event.target.id === "menuButton") navigate("menu");
});

seedData();
render();

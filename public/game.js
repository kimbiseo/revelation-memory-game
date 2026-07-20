(() => {
  "use strict";

  if (window.__REVELATION_GAME_STARTED__) return;

  const W = 606;
  const CARD_W = 245;
  const CARD_H = 118;
  const COLORS = [
    "rgb(3, 126, 219)",
    "rgb(156, 113, 219)",
    "rgb(240, 144, 187)",
    "rgb(5, 198, 198)",
    "rgb(5, 165, 138)",
  ];

  // User-authored final card data. Keep every card boundary and spelling intact.
  const verseChunks = [
    ["예수 그리스도의", "계시라", "이는 하나님이", "그에게 주사", "반드시", "속히 될 일을", "그 종들에게", "보이시려고", "그 천사를", "그 종 요한에게", "보내어", "지시하신 것이라"],
    ["요한은", "하나님의 말씀과", "예수 그리스도의 증거", "곧", "자기의 본 것을", "다 증거하였느니라"],
    ["이 예언의", "말씀을", "읽는 자와", "듣는 자들과", "그 가운데", "기록한 것을", "지키는 자들이", "복이 있나니", "때가 가까움이라"],
    ["요한은", "아시아에 있는", "일곱 교회에", "편지하노니", "이제도 계시고", "전에도 계시고", "장차 오실 이와", "그 보좌 앞에", "일곱 영과"],
    ["또 충성된 증인으로", "죽은 자들", "가운데서", "먼저 나시고", "땅의 임금들의", "머리가 되신", "예수 그리스도로", "말미암아", "은혜와", "평강이", "너희에게", "있기를 원하노라", "우리를 사랑하사", "그의 피로", "우리 죄에서", "우리를 해방하시고"],
    ["그 아버지", "하나님을 위하여", "우리를", "나라와 제사장으로", "삼으신 그에게", "영광과", "능력이", "세세토록 있기를", "원하노라 아멘"],
    ["볼찌어다", "구름을 타고", "오시리라", "각인의 눈이", "그를 보겠고", "그를 찌른 자들도", "볼터이요", "땅에 있는", "모든 족속이", "그를 인하여", "애곡하리니", "그러하리라", "아멘"],
    ["주 하나님이", "가라사대", "나는", "알파와 오메가라", "이제도 있고", "전에도 있었고", "장차 올 자요", "전능한 자라", "하시더라"],
    ["나 요한은", "너희 형제요", "예수의 환난과", "나라와", "참음에", "동참하는 자라", "하나님의 말씀과", "예수의 증거를", "인하여", "밧모라 하는", "섬에 있었더니"],
    ["주의 날에", "내가", "성령에 감동하여", "내 뒤에서 나는", "나팔 소리 같은", "큰 음성을", "들으니"],
    ["가로되", "너 보는 것을", "책에 써서", "에베소", "서머나", "버가모", "두아디라", "사데", "빌라델비아", "라오디게아", "일곱 교회에", "보내라", "하시기로"],
    ["몸을 돌이켜", "나더러 말한", "음성을", "알아 보려고 하여", "돌이킬 때에", "일곱 금 촛대를", "보았는데"],
    ["촛대 사이에", "인자 같은 이가", "발에 끌리는", "옷을 입고", "가슴에 금띠를 띠고"],
    ["그 머리와", "털의 희기가", "흰 양털 같고", "눈 같으며", "그의 눈은", "불꽃 같고"],
    ["그의 발은", "풀무에 단련한", "빛난 주석 같고", "그의 음성은", "많은 물", "소리와 같으며"],
    ["그 오른손에", "일곱 별이 있고", "그 입에서", "좌우에", "날선 검이", "나오고", "그 얼굴은", "해가 힘있게", "비취는것", "같더라"],
    ["내가 볼때에", "그 발앞에", "엎드러져", "죽은 자", "같이 되매", "그가 오른손을", "내게 얹고", "가라사대", "두려워 말라", "나는", "처음이요 나중이니"],
    ["곧 산 자라", "내가 전에", "죽었었노라", "볼찌어다", "이제", "세세토록", "살아 있어", "사망과", "음부의", "열쇠를", "가졌노니"],
    ["그러므로", "네 본 것과", "이제 있는 일과", "장차 될 일을", "기록하라"],
    ["네 본 것은", "내 오른손에", "일곱 별의 비밀과", "일곱 금 촛대라", "일곱 별은", "일곱 교회의", "사자요", "일곱 촛대는", "일곱 교회니라"],
  ];

  const audioFiles = {
    correct: "/assets/audio/correct.mp3",
    incorrect: "/assets/audio/incorrect.mp3",
    wow: "/assets/audio/wow.mp3",
    letsGo: "/assets/audio/lets-go.mp3",
    verseEnd: "/assets/audio/verse-ending.mp3",
    victory: "/assets/audio/victory-fanfare.mp3",
    applause: "/assets/audio/applause-and-cheers.mp3",
    theEnd: "/assets/audio/the-end.mp3",
    cloudEntrance: "/assets/audio/cloud-entrance.mp3",
    newAlert: "/assets/audio/new-alert.mp3",
  };

  const stage = document.getElementById("game-stage");
  const laneLayer = document.getElementById("lane-layer");
  const sentenceLines = document.getElementById("sentence-lines");
  const sentenceWindow = document.getElementById("sentence-window");
  const flyingLayer = document.getElementById("flying-word-layer");
  const angelZone = document.getElementById("angel-zone");
  const finalLayer = document.getElementById("final-layer");
  const menuButton = document.getElementById("menu-button");
  const menuOverlay = document.getElementById("menu-overlay");
  const homeButton = document.getElementById("home-button");
  const resumeButton = document.getElementById("resume-button");
  const musicButton = document.getElementById("music-button");
  const soundButton = document.getElementById("sound-button");
  const musicLabel = document.getElementById("music-label");
  const soundLabel = document.getElementById("sound-label");
  const hintWord = document.getElementById("hint-word");
  const srStatus = document.getElementById("screen-reader-status");

  if (!stage || !laneLayer || !sentenceLines || !angelZone || !finalLayer) return;
  window.__REVELATION_GAME_STARTED__ = true;

  const bootstrapCards = Array.isArray(window.__REVELATION_GAME_BOOTSTRAP__?.cards)
    ? window.__REVELATION_GAME_BOOTSTRAP__.cards
    : [];

  const state = {
    verseIndex: 0,
    chunkIndex: 0,
    chunks: [],
    answerIndex: 0,
    cards: [],
    decorations: [],
    batchCorrectCount: 0,
    batchTargetCount: 0,
    batchNumber: 0,
    batchToken: 0,
    displayLines: [],
    sentenceAnimating: false,
    sentenceTimer: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    totalCorrect: 0,
    wowSchedule: new Map(),
    letsGoSchedule: new Map(),
    voiceScheduleToken: 0,
    introVisible: true,
    locked: false,
    paused: false,
    final: false,
    musicOn: true,
    soundOn: true,
    bgmStarted: false,
    idleTimer: 0,
    cheerTimer: 0,
    duckCount: 0,
    lastAlertAt: -Infinity,
    pendingInitialEntrance: false,
    previousFirstTargetSlot: null,
    firstTargetSlotUsage: Array(11).fill(0),
  };

  const bgm = new Audio("/assets/audio/game-bgm.mp3");
  bgm.loop = true;
  bgm.preload = "auto";
  bgm.volume = 0.22;

  const audioBank = Object.fromEntries(Object.entries(audioFiles).map(([name, src]) => {
    const sound = new Audio();
    sound.preload = "auto";
    sound.src = src;
    return [name, sound];
  }));

  function normalizeText(value) {
    return String(value ?? "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const answerCards = verseChunks.flatMap((chunks, verseIndex) => (
    chunks.map((word, verseCardIndex) => ({
      id: `verse-${verseIndex + 1}-card-${verseCardIndex + 1}`,
      sourceIndex: 0,
      verseIndex,
      verseCardIndex,
      word: normalizeText(word),
    }))
  ));
  answerCards.forEach((card, sourceIndex) => {
    card.sourceIndex = sourceIndex;
  });
  const distractors = answerCards.map((card) => card.word);

  function createSprite(className, src) {
    const wrap = document.createElement("span");
    wrap.className = `sprite-crop ${className}`;
    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.draggable = false;
    wrap.appendChild(image);
    return wrap;
  }

  function createCloudCard(definition) {
    const { id, centerX, centerY } = definition;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cloud-card fixed-card";
    button.id = `cloud-card-${id}`;
    button.dataset.cardId = String(id);
    button.style.opacity = "0";
    button.dataset.slot = String(id);
    const idleX = 2 + (id % 3);
    const idleDirection = id % 2 === 0 ? 1 : -1;
    const idleY = 4 + (id % 4);
    button.style.setProperty("--idle-x-a", `${-idleX * idleDirection}px`);
    button.style.setProperty("--idle-x-b", `${idleX * idleDirection}px`);
    button.style.setProperty("--idle-y-a", `${-idleY}px`);
    button.style.setProperty("--idle-y-b", `${idleY}px`);
    button.style.setProperty("--idle-duration", `${3.5 + (id % 6) * 0.38}s`);
    button.style.setProperty("--idle-delay", `${-(id % 5) * 0.57}s`);

    const visual = document.createElement("span");
    visual.className = "cloud-visual";

    const white = document.createElement("img");
    white.className = "cloud-art white";
    white.src = "/assets/images/cloud_card.png";
    white.alt = "";
    white.draggable = false;
    visual.appendChild(white);

    const dark = document.createElement("img");
    dark.className = "cloud-art dark";
    dark.src = "/assets/images/cloud_dark.png";
    dark.alt = "";
    dark.draggable = false;
    visual.appendChild(dark);

    const fx = document.createElement("span");
    fx.className = "fx-layer";
    fx.appendChild(createSprite("ring-sprite", "/assets/images/effect_correct_ring.png"));
    fx.appendChild(createSprite("bubble-left-sprite", "/assets/images/effect_bubble_left.png"));
    fx.appendChild(createSprite("bubble-right-sprite", "/assets/images/effect_bubble_right.png"));
    fx.appendChild(createSprite("star-white-sprite star-one", "/assets/images/effect_star_white.png"));
    fx.appendChild(createSprite("star-yellow-sprite star-two", "/assets/images/effect_star_yellow.png"));
    fx.appendChild(createSprite("star-white-sprite star-three", "/assets/images/effect_star_white.png"));
    visual.appendChild(fx);

    const lightning = document.createElement("span");
    lightning.className = "lightning-sprite";
    lightning.innerHTML = '<img src="/assets/images/lightning.png" alt="" draggable="false">';
    visual.appendChild(lightning);

    const rain = document.createElement("span");
    rain.className = "rain-sprite";
    rain.innerHTML = '<img src="/assets/images/rain.png" alt="" draggable="false">';
    visual.appendChild(rain);

    const word = document.createElement("span");
    word.className = "cloud-word";
    visual.appendChild(word);
    button.appendChild(visual);
    laneLayer.appendChild(button);

    const card = {
      id,
      centerX,
      centerY,
      el: button,
      wordEl: word,
      word: "",
      x: 0,
      top: centerY - CARD_H / 2,
      colorIndex: definition.colorIndex,
      distractorIndex: definition.distractorIndex,
      targetIndex: null,
      targetId: null,
      animating: false,
      selected: false,
    };
    button.addEventListener("click", () => handleCard(card));
    return card;
  }

  function createDecorativeCloud(left, top, width, stretch) {
    const decorationIndex = state.decorations.length;
    const cloud = document.createElement("span");
    cloud.className = "decorative-cloud";
    cloud.style.left = `${left}px`;
    cloud.style.top = `${top}px`;
    cloud.style.setProperty("--decor-width", `${width}px`);
    cloud.style.setProperty("--decor-stretch", String(stretch));
    const idleX = 1 + (decorationIndex % 2);
    const idleDirection = decorationIndex % 2 === 0 ? 1 : -1;
    const idleY = 2 + (decorationIndex % 3);
    cloud.style.setProperty("--decor-idle-x-a", `${-idleX * idleDirection}px`);
    cloud.style.setProperty("--decor-idle-x-b", `${idleX * idleDirection}px`);
    cloud.style.setProperty("--decor-idle-y-a", `${-idleY}px`);
    cloud.style.setProperty("--decor-idle-y-b", `${idleY}px`);
    cloud.style.setProperty("--decor-idle-duration", `${6.2 + (decorationIndex % 4) * 0.55}s`);
    cloud.style.setProperty("--decor-idle-delay", `${-(decorationIndex % 5) * 0.73}s`);
    const art = document.createElement("img");
    art.className = "cloud-art white";
    art.src = "/assets/images/cloud_card.png";
    art.alt = "";
    art.draggable = false;
    cloud.appendChild(art);
    laneLayer.appendChild(cloud);
    state.decorations.push(cloud);
  }

  function createCards() {
    laneLayer.innerHTML = "";
    state.cards = [];
    state.decorations = [];
    [
      [-118, 188, 185, 0.82], [533, 205, 185, 0.82],
      [-130, 468, 195, 0.88], [540, 505, 182, 0.8],
      [-126, 690, 188, 0.84], [538, 666, 190, 0.84],
      [-118, 890, 176, 0.76], [545, 915, 180, 0.78],
    ].forEach(([left, top, width, stretch]) => {
      createDecorativeCloud(left, top, width, stretch);
    });

    const fallbackSlots = [
      [303, 570], [160, 420], [446, 720], [446, 420], [160, 720],
      [160, 270], [446, 870], [446, 270], [160, 870], [160, 1020],
      [446, 1020],
    ];
    const definitions = bootstrapCards.length === 11
      ? bootstrapCards
      : fallbackSlots.map(([centerX, centerY], id) => ({
          id,
          centerX,
          centerY,
          colorIndex: id % COLORS.length,
          distractorIndex: id * 11 + 7,
        }));
    definitions.forEach((definition) => {
      state.cards.push(createCloudCard(definition));
    });
  }

  function setCardWord(card, entry, colorIndex) {
    const normalizedWord = normalizeText(entry.word);
    card.word = normalizedWord;
    card.targetIndex = Number.isInteger(entry.targetIndex) ? entry.targetIndex : null;
    card.targetId = typeof entry.targetId === "string" ? entry.targetId : null;
    card.wordEl.textContent = normalizedWord;
    card.wordEl.className = "cloud-word";
    const length = normalizedWord.replace(/\s/g, "").length;
    if (length > 7) card.wordEl.classList.add("small");
    else if (length > 5) card.wordEl.classList.add("medium");
    card.el.style.setProperty("--cloud-color", COLORS[colorIndex % COLORS.length]);
    const width = Math.max(164, Math.min(278, 142 + length * 17));
    card.x = card.centerX - width / 2;
    card.top = card.centerY - CARD_H / 2;
    card.el.style.left = `${card.x}px`;
    card.el.style.top = `${card.top}px`;
    card.el.style.setProperty("--card-width", `${width}px`);
    card.el.style.setProperty("--cloud-stretch", String(width / CARD_W));
    card.el.style.setProperty("--rain-stretch", String((width / CARD_W) * (303 / 262)));
    if (card.targetIndex === null) delete card.el.dataset.targetIndex;
    else card.el.dataset.targetIndex = String(card.targetIndex);
    if (card.targetId === null) delete card.el.dataset.targetId;
    else card.el.dataset.targetId = card.targetId;
    card.el.setAttribute("aria-label", `구름 카드: ${normalizedWord}`);
  }

  function shuffle(values) {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function createBatchSlotOrder() {
    const slots = Array.from({ length: 11 }, (_, index) => index);
    const eligibleFirstSlots = slots.filter((slot) => slot !== state.previousFirstTargetSlot);
    const lowestUseCount = Math.min(...eligibleFirstSlots.map((slot) => state.firstTargetSlotUsage[slot]));
    const balancedFirstSlots = eligibleFirstSlots.filter(
      (slot) => state.firstTargetSlotUsage[slot] === lowestUseCount,
    );
    const firstSlot = balancedFirstSlots[Math.floor(Math.random() * balancedFirstSlots.length)];
    state.previousFirstTargetSlot = firstSlot;
    state.firstTargetSlotUsage[firstSlot] += 1;
    return [firstSlot, ...shuffle(slots.filter((slot) => slot !== firstSlot))];
  }

  function getBatchWords() {
    const correctEntries = answerCards
      .slice(state.answerIndex, state.answerIndex + 10)
      .map((target) => ({
        word: target.word,
        targetId: target.id,
        targetIndex: target.sourceIndex,
      }));
    const excluded = new Set(correctEntries.map((entry) => entry.word));
    const used = new Set(excluded);
    const orderedEntries = [...correctEntries];
    let cursor = state.verseIndex * 37 + state.batchNumber * 53 + 11;
    while (orderedEntries.length < 11) {
      const entryIndex = orderedEntries.length;
      let candidate = "";
      let attempts = 0;
      while ((!candidate || excluded.has(candidate) || used.has(candidate)) && attempts < distractors.length) {
        candidate = normalizeText(distractors[(cursor + entryIndex * 17 + attempts * 7) % distractors.length]);
        attempts += 1;
      }
      const word = candidate || normalizeText(distractors[(cursor + entryIndex) % distractors.length]);
      orderedEntries.push({ word, targetId: null, targetIndex: null });
      used.add(word);
    }
    const slotOrder = createBatchSlotOrder();
    const entries = Array(11).fill(null);
    orderedEntries.forEach((entry, index) => {
      entries[slotOrder[index]] = entry;
    });
    return { entries, targetCount: correctEntries.length };
  }

  function updateHint() {
    if (!hintWord) return;
    hintWord.textContent = state.final ? "" : (answerCards[state.answerIndex]?.word || "");
  }

  function syncCurrentTarget() {
    const target = answerCards[state.answerIndex];
    if (!target) {
      state.verseIndex = verseChunks.length - 1;
      state.chunks = verseChunks[state.verseIndex];
      state.chunkIndex = state.chunks.length;
      return;
    }
    state.verseIndex = target.verseIndex;
    state.chunks = verseChunks[target.verseIndex];
    state.chunkIndex = target.verseCardIndex;
  }

  function populateCards() {
    const token = ++state.batchToken;
    const batch = getBatchWords();
    state.batchTargetCount = batch.targetCount;
    state.batchCorrectCount = 0;
    state.locked = true;
    state.cards.forEach((card, index) => {
      const entry = batch.entries[index];
      setCardWord(card, entry, card.colorIndex);
      card.animating = false;
      card.selected = false;
      card.el.className = "cloud-card fixed-card";
      card.el.style.opacity = "0";
      card.el.disabled = false;
    });
    const decorationsNeedEntrance = state.decorations.some((cloud) => !cloud.classList.contains("show"));
    if (decorationsNeedEntrance) {
      state.decorations.forEach((cloud) => {
        cloud.className = "decorative-cloud";
        cloud.style.opacity = "0";
      });
    }
    updateHint();
    window.setTimeout(() => {
      if (token !== state.batchToken) return;
      playFx("cloudEntrance", 0, 0.8);
      if (decorationsNeedEntrance) {
        state.decorations.forEach((cloud, index) => {
          window.setTimeout(() => {
            if (token !== state.batchToken) return;
            cloud.style.opacity = "";
            cloud.classList.add("show", "entering");
            window.setTimeout(() => {
              if (token !== state.batchToken) return;
              cloud.classList.remove("entering");
              cloud.classList.add("idle");
            }, 480);
          }, 25 + index * 65);
        });
      }
      state.cards.forEach((card, index) => {
        window.setTimeout(() => {
          if (token !== state.batchToken) return;
          card.el.style.opacity = "1";
          card.el.classList.add("entering");
          window.setTimeout(() => {
            if (token !== state.batchToken) return;
            card.el.classList.remove("entering");
            card.el.classList.add("idle");
          }, 480);
        }, index * 50);
      });
      window.setTimeout(() => {
        if (token !== state.batchToken) return;
        state.locked = false;
        updateHint();
        armIdleReminder();
      }, state.cards.length * 50 + 500);
    }, 200);
  }

  function startBgm() {
    if (!state.musicOn || state.bgmStarted) return;
    state.bgmStarted = true;
    bgm.play().catch(() => {
      state.bgmStarted = false;
    });
  }

  function duckBgm(duration = 1350) {
    if (!state.musicOn || !state.bgmStarted) return;
    state.duckCount += 1;
    bgm.volume = 0.12;
    window.setTimeout(() => {
      state.duckCount = Math.max(0, state.duckCount - 1);
      if (state.duckCount === 0 && state.musicOn) bgm.volume = 0.22;
    }, duration);
  }

  function playFx(name, delay = 0, volume = 0.9) {
    const play = () => {
      if (!state.soundOn) return;
      const prepared = audioBank[name];
      if (!prepared) return;
      const sound = prepared.cloneNode(true);
      sound.volume = volume;
      if (name === "cloudEntrance") state.pendingInitialEntrance = false;
      sound.play().catch(() => {
        if (name === "cloudEntrance" && state.totalCorrect === 0) {
          state.pendingInitialEntrance = true;
        }
      });
      duckBgm(name === "victory" ? 4200 : 1450);
    };
    if (delay > 0) window.setTimeout(play, delay);
    else play();
  }

  function chooseAnswerNumber(start, count, excludedNumber = null) {
    const candidates = Array.from({ length: count }, (_, index) => start + index)
      .filter((answerNumber) => answerNumber !== excludedNumber);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function ensureVoiceSchedule(answerNumber) {
    const letsGoBlock = Math.floor((answerNumber - 1) / 20);
    const letsGoStart = letsGoBlock * 20 + 1;
    if (!state.letsGoSchedule.has(letsGoBlock)) {
      state.letsGoSchedule.set(letsGoBlock, chooseAnswerNumber(letsGoStart, 20));
    }

    const wowBlock = Math.floor((answerNumber - 1) / 10);
    const wowStart = wowBlock * 10 + 1;
    if (!state.wowSchedule.has(wowBlock)) {
      const letsGoTarget = state.letsGoSchedule.get(letsGoBlock);
      state.wowSchedule.set(wowBlock, chooseAnswerNumber(wowStart, 10, letsGoTarget));
    }
  }

  function playScheduledVoice(name, delay = 180, volume = 0.9) {
    const scheduleToken = state.voiceScheduleToken;
    window.setTimeout(() => {
      if (scheduleToken !== state.voiceScheduleToken) return;
      playFx(name, 0, volume);
    }, delay);
  }

  function clearIdleReminder() {
    if (state.idleTimer) window.clearTimeout(state.idleTimer);
    state.idleTimer = 0;
  }

  function armIdleReminder() {
    clearIdleReminder();
    if (state.final || state.paused || state.locked) return;
    state.idleTimer = window.setTimeout(() => {
      const now = performance.now();
      if (now - state.lastAlertAt >= 20000) {
        state.lastAlertAt = now;
        playFx("newAlert");
      }
      armIdleReminder();
    }, 5000);
  }

  function renderSentence() {
    sentenceLines.innerHTML = "";
    state.displayLines.forEach((line) => {
      const lineEl = document.createElement("div");
      lineEl.className = "sentence-line";
      line.parts.forEach((part, index) => {
        const span = document.createElement("span");
        span.textContent = `${index > 0 ? " " : ""}${part.text}`;
        if (part.verse) span.className = "verse-number";
        if (part.intro) span.className = "start-title";
        lineEl.appendChild(span);
      });
      sentenceLines.appendChild(lineEl);
    });
  }

  function resetSentence() {
    if (state.sentenceTimer) window.clearTimeout(state.sentenceTimer);
    state.sentenceTimer = 0;
    state.sentenceAnimating = false;
    state.displayLines = state.introVisible && state.verseIndex === 0
      ? [{ parts: [{ text: "요한계시록 1장", intro: true }] }]
      : [];
    sentenceLines.classList.remove("scroll-up");
    renderSentence();
  }

  function animateSentenceOverflow() {
    if (state.sentenceAnimating || state.displayLines.length <= 2) return;
    state.sentenceAnimating = true;
    requestAnimationFrame(() => sentenceLines.classList.add("scroll-up"));
    state.sentenceTimer = window.setTimeout(() => {
      state.displayLines.shift();
      sentenceLines.classList.remove("scroll-up");
      renderSentence();
      state.sentenceAnimating = false;
      state.sentenceTimer = 0;
      if (state.displayLines.length > 2) {
        window.setTimeout(animateSentenceOverflow, 20);
      }
    }, 315);
  }

  function appendSentenceChunk(chunk, verseIndex, isVerseStart = false) {
    if (isVerseStart || state.displayLines.length === 0) {
      const parts = [];
      if (isVerseStart) {
        parts.push({ text: `${verseIndex + 1}.`, verse: true });
      }
      parts.push({ text: chunk, verse: false });
      state.displayLines.push({ parts });
      renderSentence();
      animateSentenceOverflow();
      return;
    }

    const current = state.displayLines[state.displayLines.length - 1];
    const currentText = current.parts.map((part) => part.text).join(" ");
    const candidateLength = `${currentText} ${chunk}`.replace(/\s/g, "").length;
    if (candidateLength > 14 && current.parts.length > 0) {
      state.displayLines.push({ parts: [{ text: chunk, verse: false }] });
    } else {
      current.parts.push({ text: chunk, verse: false });
    }
    renderSentence();
    animateSentenceOverflow();
  }

  function dismissStartPrompts() {
    if (!state.introVisible) return;
    state.introVisible = false;
    state.displayLines = [];
    sentenceLines.classList.remove("scroll-up");
    renderSentence();
  }

  function announce(message) {
    if (!srStatus) return;
    srStatus.textContent = "";
    window.setTimeout(() => {
      srStatus.textContent = message;
    }, 20);
  }

  function setAngel(type = "idle", duration = 0) {
    if (state.final) return;
    if (state.cheerTimer) {
      window.clearTimeout(state.cheerTimer);
      state.cheerTimer = 0;
    }
    let wrap = angelZone.querySelector(":scope > .angel-sprite:not(.final-cheer)");
    let image = wrap?.querySelector("img");
    if (!wrap || !image || angelZone.children.length !== 1) {
      wrap = document.createElement("span");
      image = document.createElement("img");
      image.alt = "";
      image.draggable = false;
      wrap.appendChild(image);
      angelZone.replaceChildren(wrap);
    }
    wrap.className = "angel-sprite";
    wrap.style.left = "12px";
    let file = "angel_idle.png";
    if (type === "smile") file = "angel_happy.png";
    if (type === "heart" || type === "cheer") file = "angel_fullbody.png";
    if (type === "cry") file = "angel_cry.png";
    image.src = `/assets/images/${file}`;
    if (type === "heart" || type === "cheer") {
      wrap.classList.add("fullbody-heart", "milestone-jump");
    }
    if (duration > 0) {
      state.cheerTimer = window.setTimeout(() => {
        state.cheerTimer = 0;
        setAngel("idle");
      }, duration);
    }
  }

  function flyWord(card, word) {
    const fly = document.createElement("span");
    fly.className = "flying-word";
    fly.textContent = word;
    fly.style.left = `${card.x}px`;
    fly.style.top = `${card.top + 24}px`;
    fly.style.setProperty("--fly-x", `${W / 2 - card.centerX}px`);
    fly.style.setProperty("--fly-y", `${56 - (card.top + 58)}px`);
    flyingLayer.appendChild(fly);
    window.setTimeout(() => fly.remove(), 680);
  }

  function finishBatch() {
    const transitionToken = state.batchToken;
    clearIdleReminder();
    state.locked = true;
    updateHint();
    const remaining = state.cards.filter((card) => !card.selected);
    remaining.forEach((card) => {
      card.animating = true;
      card.el.disabled = true;
      card.el.classList.remove("idle");
      card.el.style.opacity = "0";
    });
    state.decorations.forEach((cloud) => {
      cloud.classList.remove("idle", "show", "entering");
      cloud.style.opacity = "0";
    });
    window.setTimeout(() => {
      if (transitionToken !== state.batchToken) return;
      if (state.answerIndex >= answerCards.length) showFinalScreen();
      else {
        state.batchNumber += 1;
        populateCards();
      }
    }, 980);
  }

  function handleCorrect(card) {
    const cardBatchToken = state.batchToken;
    const target = answerCards[state.answerIndex];
    if (!target) return;
    const selectedWord = card.word;
    const isVerseStart = target.verseCardIndex === 0;
    const completedVerse = target.verseCardIndex === verseChunks[target.verseIndex].length - 1;
    card.animating = true;
    card.selected = true;
    card.el.classList.remove("idle");
    card.el.classList.add("correct");
    state.answerIndex += 1;
    syncCurrentTarget();
    state.batchCorrectCount += 1;
    state.consecutiveCorrect += 1;
    state.consecutiveWrong = 0;
    const answerNumber = state.totalCorrect + 1;
    ensureVoiceSchedule(answerNumber);
    state.totalCorrect = answerNumber;

    playFx("correct");
    const letsGoBlock = Math.floor((answerNumber - 1) / 20);
    const wowBlock = Math.floor((answerNumber - 1) / 10);
    if (state.letsGoSchedule.get(letsGoBlock) === answerNumber) {
      playScheduledVoice("letsGo", 180);
    } else if (state.wowSchedule.get(wowBlock) === answerNumber) {
      playScheduledVoice("wow", 180);
    }
    if (state.totalCorrect % 10 === 0) setAngel("heart", 1250);
    else setAngel("smile", 760);
    flyWord(card, selectedWord);
    window.setTimeout(() => appendSentenceChunk(selectedWord, target.verseIndex, isVerseStart), 520);
    if (completedVerse) {
      playFx("verseEnd", 190);
      announce(`${target.verseIndex + 1}절 완성`);
    }
    announce(`정답. ${selectedWord}`);

    const batchFinished = state.batchCorrectCount >= state.batchTargetCount;
    if (batchFinished) state.locked = true;

    window.setTimeout(() => {
      card.el.style.opacity = "0";
      card.el.disabled = true;
    }, 930);

    if (batchFinished) {
      updateHint();
      if (cardBatchToken === state.batchToken) finishBatch();
    } else {
      const next = answerCards[state.answerIndex]?.word;
      updateHint();
      if (next) announce(`정답. 다음 말씀은 ${next}`);
    }
  }

  function handleWrong(card) {
    card.animating = true;
    card.el.classList.remove("idle");
    card.el.classList.add("wrong");
    state.consecutiveCorrect = 0;
    state.consecutiveWrong += 1;
    playFx("incorrect");
    setAngel("cry", 860);
    announce("다시 생각해 보세요.");
    window.setTimeout(() => {
      card.el.classList.remove("wrong");
      card.el.classList.add("idle");
      card.animating = false;
    }, 820);
  }

  function handleCard(card) {
    startBgm();
    if (state.locked || state.paused || state.final || card.animating) return;
    dismissStartPrompts();
    armIdleReminder();
    const target = answerCards[state.answerIndex];
    if (!target) return;
    const idMatches = card.targetId === target.id;
    const indexMatches = card.targetIndex === target.sourceIndex;
    const textMatches = normalizeText(card.word) === normalizeText(target.word);
    if (idMatches && indexMatches && textMatches) handleCorrect(card);
    else handleWrong(card);
  }

  function beginGame() {
    state.answerIndex = 0;
    syncCurrentTarget();
    state.batchNumber = 0;
    state.batchCorrectCount = 0;
    state.batchTargetCount = 0;
    state.locked = true;
    state.consecutiveWrong = 0;
    state.final = false;
    sentenceWindow.style.display = "block";
    laneLayer.style.display = "block";
    resetSentence();
    populateCards();
    setAngel("idle");
    announce(`1절 시작. 첫 말씀은 ${answerCards[0].word}`);
  }

  function makeFinalCloud(char, left, top, delay, color) {
    const cloud = document.createElement("div");
    cloud.className = "final-cloud";
    cloud.style.left = `${left}px`;
    cloud.style.top = `${top}px`;
    cloud.style.animationDelay = `${delay}ms`;
    const art = document.createElement("img");
    art.className = "cloud-art white";
    art.src = "/assets/images/cloud_card.png";
    art.alt = "";
    art.draggable = false;
    const word = document.createElement("span");
    word.className = "cloud-word";
    word.textContent = char;
    word.style.color = color;
    cloud.appendChild(art);
    cloud.appendChild(word);
    finalLayer.appendChild(cloud);
  }

  function makeFinalStar(type, left, top, delay) {
    const star = document.createElement("span");
    star.className = `final-star ${type}`;
    star.style.left = `${left}px`;
    star.style.top = `${top}px`;
    star.style.animationDelay = `${delay}ms`;
    const image = document.createElement("img");
    image.src = `/assets/images/effect_star_${type === "white" ? "white" : "yellow"}.png`;
    image.alt = "";
    image.draggable = false;
    star.appendChild(image);
    finalLayer.appendChild(star);
  }

  function renderFinalAngels() {
    angelZone.innerHTML = "";
    const positions = [12, 132, 252, 372, 492];
    const delays = [0, 140, 280, 80, 220];
    positions.forEach((left, index) => {
      const wrap = document.createElement("span");
      wrap.className = "angel-sprite fullbody-heart final-cheer";
      wrap.style.left = `${left}px`;
      wrap.style.animationDelay = `${delays[index]}ms`;
      const image = document.createElement("img");
      image.src = "/assets/images/angel_fullbody.png";
      image.alt = "";
      image.draggable = false;
      wrap.appendChild(image);
      angelZone.appendChild(wrap);
    });
  }

  function renderAmenPopcorn() {
    const angelCenters = [61, 181, 301, 421, 541];
    const bursts = [
      { x: -32, y: -78, top: 1012 },
      { x: 0, y: -98, top: 1032 },
      { x: 32, y: -82, top: 1050 },
    ];
    angelCenters.forEach((center, angelIndex) => {
      bursts.forEach((burst, burstIndex) => {
        let travelX = burst.x;
        if (angelIndex === 0 && travelX < 0) travelX = -18;
        if (angelIndex === angelCenters.length - 1 && travelX > 0) travelX = 18;
        const amen = document.createElement("span");
        amen.className = `amen-pop ${(angelIndex + burstIndex) % 2 === 0 ? "yellow" : "blue"}`;
        amen.textContent = "아멘";
        amen.style.left = `${center}px`;
        amen.style.top = `${burst.top}px`;
        amen.style.setProperty("--amen-x", `${travelX}px`);
        amen.style.setProperty("--amen-y", `${burst.y}px`);
        amen.style.setProperty("--amen-x-near", `${Math.round(travelX * 0.28)}px`);
        amen.style.setProperty("--amen-y-near", `${Math.round(burst.y * 0.18)}px`);
        amen.style.setProperty("--amen-x-mid", `${Math.round(travelX * 0.72)}px`);
        amen.style.setProperty("--amen-y-mid", `${Math.round(burst.y * 0.68)}px`);
        amen.style.animationDelay = `${120 + angelIndex * 70 + burstIndex * 180}ms`;
        finalLayer.appendChild(amen);
      });
    });
  }

  function renderFinalCredits() {
    const creditCloud = document.createElement("div");
    creditCloud.className = "final-credit-cloud";
    creditCloud.setAttribute("aria-label", "사용 리소스 출처");

    [
      ["Music:", "Suno AI"],
      ["Font:", "BM JUA"],
    ].forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "final-credit-row";
      const labelElement = document.createElement("span");
      labelElement.className = "final-credit-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("strong");
      valueElement.className = "final-credit-value";
      valueElement.textContent = value;
      row.appendChild(labelElement);
      row.appendChild(valueElement);
      creditCloud.appendChild(row);
    });

    finalLayer.appendChild(creditCloud);
  }

  function showFinalScreen() {
    clearIdleReminder();
    state.final = true;
    state.locked = true;
    laneLayer.style.display = "none";
    sentenceWindow.style.display = "none";
    finalLayer.innerHTML = "";
    finalLayer.classList.add("show");
    finalLayer.setAttribute("aria-hidden", "false");

    const title = document.createElement("div");
    title.className = "final-title";
    title.textContent = "계시록 통달";
    finalLayer.appendChild(title);

    makeFinalCloud("할", 28, 292, 180, COLORS[2]);
    makeFinalCloud("수", 330, 455, 390, COLORS[0]);
    makeFinalCloud("있", 34, 614, 600, COLORS[1]);
    makeFinalCloud("다", 326, 770, 810, COLORS[3]);

    [
      ["yellow", 245, 275, 0], ["white", 214, 392, 210],
      ["yellow", 413, 360, 340], ["white", 505, 402, 90],
      ["yellow", 130, 480, 280], ["white", 48, 548, 430],
      ["yellow", 474, 608, 120], ["white", 299, 670, 520],
      ["yellow", 164, 760, 360], ["white", 405, 748, 180],
      ["yellow", 74, 886, 480], ["white", 520, 884, 260],
    ].forEach(([type, left, top, delay]) => makeFinalStar(type, left, top, delay));

    renderFinalAngels();
    renderAmenPopcorn();
    renderFinalCredits();
    playFx("victory", 0, 1);
    playFx("applause", 70, 0.9);
    playFx("theEnd", 2900, 0.95);
    announce("계시록 통달. 할 수 있다!");
  }

  function openMenu() {
    startBgm();
    state.paused = true;
    clearIdleReminder();
    menuOverlay.classList.add("open");
    menuOverlay.setAttribute("aria-hidden", "false");
    menuButton.style.display = "none";
    resumeButton.focus({ preventScroll: true });
  }

  function closeMenu() {
    menuOverlay.classList.remove("open");
    menuOverlay.setAttribute("aria-hidden", "true");
    menuButton.style.display = "block";
    state.paused = false;
    if (!state.final) armIdleReminder();
    menuButton.focus({ preventScroll: true });
  }

  function updateMenuLabels() {
    musicLabel.textContent = state.musicOn ? "음악 켜짐" : "음악 꺼짐";
    soundLabel.textContent = state.soundOn ? "효과음 켜짐" : "효과음 꺼짐";
    musicButton.setAttribute("aria-pressed", String(state.musicOn));
    soundButton.setAttribute("aria-pressed", String(state.soundOn));
  }

  function resetGame() {
    state.verseIndex = 0;
    state.chunkIndex = 0;
    state.answerIndex = 0;
    state.consecutiveCorrect = 0;
    state.consecutiveWrong = 0;
    state.totalCorrect = 0;
    state.wowSchedule.clear();
    state.letsGoSchedule.clear();
    state.voiceScheduleToken += 1;
    ensureVoiceSchedule(1);
    state.previousFirstTargetSlot = null;
    state.firstTargetSlotUsage.fill(0);
    state.introVisible = true;
    state.locked = false;
    state.final = false;
    state.paused = false;
    finalLayer.classList.remove("show");
    finalLayer.setAttribute("aria-hidden", "true");
    finalLayer.innerHTML = "";
    menuOverlay.classList.remove("open");
    menuOverlay.setAttribute("aria-hidden", "true");
    menuButton.style.display = "block";
    beginGame();
  }

  menuButton.addEventListener("click", openMenu);
  resumeButton.addEventListener("click", closeMenu);
  homeButton.addEventListener("click", () => {
    resetGame();
    menuButton.focus({ preventScroll: true });
  });
  musicButton.addEventListener("click", () => {
    state.musicOn = !state.musicOn;
    if (state.musicOn) {
      state.bgmStarted = false;
      startBgm();
    } else {
      bgm.pause();
      state.bgmStarted = false;
    }
    updateMenuLabels();
  });
  soundButton.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    updateMenuLabels();
  });

  document.addEventListener("pointerdown", () => {
    startBgm();
    if (state.pendingInitialEntrance) playFx("cloudEntrance", 0, 0.8);
  }, { once: true, passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      bgm.pause();
      state.bgmStarted = false;
    } else if (state.musicOn) {
      startBgm();
    }
  });
  createCards();
  updateMenuLabels();
  resetGame();
  startBgm();
})();

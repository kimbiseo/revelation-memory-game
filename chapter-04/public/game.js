(() => {
  "use strict";

  if (window.__REVELATION_GAME_STARTED__) return;

  const W = 606;
  const CARD_W = 245;
  const CARD_H = 118;
  const STAGE_ASSET_HEIGHT = 1198;
  const TOP_CLOUD_OPAQUE_BOTTOM = 224;
  const GRASS_OPAQUE_TOP = 1088;
  const CARD_IMAGE_WAIT_TIMEOUT_MS = 900;
  const CARD_PUBLICATION_DELAY_MS = 200;
  const CARD_PUBLICATION_WATCHDOG_MS = 1500;
  const MAX_BATCH_PUBLICATION_RETRIES = 1;
  const PROGRESS_STORAGE_KEY = "revelation-memory-game:chapter-04:progress";
  const COLORS = [
    "rgb(3, 126, 219)",
    "rgb(156, 113, 219)",
    "rgb(240, 144, 187)",
    "rgb(5, 198, 198)",
    "rgb(5, 165, 138)",
  ];
  const MOBILE_SLOT_TEMPLATE = [
    [303, 2], [153, 1], [453, 3], [453, 1], [153, 3],
    [153, 0], [453, 4], [453, 0], [153, 4], [153, 5],
    [453, 5],
  ];
  const MOBILE_DECORATION_TEMPLATE = [
    ["left", 0.04, 160, 0.72], ["right", 0.06, 160, 0.72],
    ["left", 0.32, 164, 0.74], ["right", 0.34, 164, 0.74],
    ["left", 0.61, 160, 0.72], ["right", 0.63, 160, 0.72],
    ["left", 0.9, 156, 0.7], ["right", 0.92, 156, 0.7],
  ];

  // User-authored final card data. Keep every card boundary and spelling intact.
  const verseChunks = [
    ["이 일 후에", "내가 보니", "하늘에 열린", "문이 있는데", "내가 들은바", "처음에", "내게 말하던", "나팔소리 같은", "그 음성이", "가로되", "이리로 올라오라", "이 후에", "마땅히 될 일을", "내가 네게", "보이리라", "하시더라"],
    ["내가 곧", "성령에", "감동하였더니", "보라", "하늘에 보좌를", "베풀었고", "그 보좌 위에", "앉으신", "이가 있는데"],
    ["앉으신 이의", "모양이", "벽옥과", "홍보석 같고", "또 무지개가", "있어", "보좌에", "둘렸는데", "그 모양이", "녹보석", "같더라"],
    ["또", "보좌에 둘려", "24 보좌들이", "있고", "그 보좌들", "위에", "24 장로들이", "흰 옷을 입고", "머리에", "금 면류관을", "쓰고 앉았더라"],
    ["보좌로부터", "번개와", "음성과", "뇌성이 나고", "보좌 앞에", "일곱 등불", "켠것이 있으니", "이는", "하나님의", "일곱 영이라"],
    ["보좌 앞에", "수정과 같은", "유리 바다가 있고", "보좌 가운데와", "보좌 주위에", "네 생물이", "있는데", "앞뒤에 눈이", "가득하더라"],
    ["그 첫째 생물은", "사자 같고", "그 둘째 생물은", "송아지 같고", "그 세째 생물은", "얼굴이", "사람 같고", "그 네째 생물은", "날아가는 독수리", "같은데"],
    ["네 생물이", "각각", "여섯 날개가", "있고", "그 안과 주위에", "눈이", "가득하더라", "그들이", "밤낮", "쉬지 않고", "이르기를", "거룩하다 거룩하다 거룩하다", "주 하나님", "곧", "전능하신 이여", "전에도 계셨고", "이제도 계시고", "장차 오실", "자라 하고"],
    ["그 생물들이", "영광과", "존귀와", "감사를", "보좌에 앉으사", "세세토록", "사시는 이에게", "돌릴 때에"],
    ["24 장로들이", "보좌에", "앉으신 이", "앞에", "엎드려", "세세토록", "사시는 이에게", "경배하고", "자기의 면류관을", "보좌 앞에", "던지며", "가로되"],
    ["우리 주", "하나님이여", "영광과", "존귀와", "능력을", "받으시는 것이", "합당하오니", "주께서", "만물을 지으신지라", "만물이", "주의 뜻대로", "있었고", "또 지으심을", "받았나이다", "하더라"],
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
  const gameCanvas = document.getElementById("game-canvas");
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
    batchTimers: new Set(),
    staleBatchCallbacksIgnored: 0,
    staleTimerMutationCount: 0,
    cardVisibilityRepairCount: 0,
    angelVisibilityRepairCount: 0,
    batchPublished: false,
    batchSettled: false,
    publishedBatchToken: 0,
    batchPublicationStartedToken: 0,
    batchPublicationRetryStreak: 0,
    batchPublicationRetryCount: 0,
    batchPublicationInvocationCount: 0,
    batchPublicationSuccessCount: 0,
    batchPublicationFailureCount: 0,
    batchPublicationWatchdogCount: 0,
    batchImageWaitTimeoutCount: 0,
    batchImageDecodeFailureCount: 0,
    batchEmergencyPublishCount: 0,
    postPublishContentMutationCount: 0,
    postPublishGeometryMutationCount: 0,
  };

  const bgm = new Audio("/assets/audio/Revelation4BGM.mp3");
  bgm.loop = true;
  bgm.preload = "auto";
  bgm.volume = 0.22;

  const audioBank = Object.fromEntries(Object.entries(audioFiles).map(([name, src]) => {
    const sound = new Audio();
    sound.preload = "auto";
    sound.src = src;
    return [name, sound];
  }));

  function loadSavedAnswerIndex() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) || "null");
      if (
        saved?.chapter !== 4
        || !Number.isInteger(saved.answerIndex)
        || saved.answerIndex < 0
        || saved.answerIndex > answerCards.length
      ) {
        return 0;
      }
      return saved.answerIndex;
    } catch {
      return 0;
    }
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
        chapter: 4,
        answerIndex: state.answerIndex,
        updatedAt: Date.now(),
      }));
    } catch {
      // Storage can be unavailable in privacy modes; gameplay must continue.
    }
  }

  function clearSavedProgress() {
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in privacy modes; reset gameplay regardless.
    }
  }

  function usesMobileLayout() {
    return stage.dataset.mobileLayout === "true";
  }

  function clearBatchTimers() {
    state.batchTimers.forEach((timerId) => window.clearTimeout(timerId));
    state.batchTimers.clear();
  }

  function setBatchTimeout(callback, delay, token = state.batchToken) {
    const timerId = window.setTimeout(() => {
      state.batchTimers.delete(timerId);
      if (token !== state.batchToken) {
        state.staleBatchCallbacksIgnored += 1;
        return;
      }
      callback();
    }, delay);
    state.batchTimers.add(timerId);
    return timerId;
  }

  function getMobileLayoutBounds() {
    const logicalWidth = gameCanvas?.clientWidth || W;
    const logicalHeight = gameCanvas?.clientHeight || 1198;
    const canvasRect = gameCanvas?.getBoundingClientRect();
    const renderedScale = canvasRect?.width
      ? canvasRect.width / logicalWidth
      : 1;
    const toLogicalY = (physicalY) => (
      (physicalY - (canvasRect?.top || 0)) / renderedScale
    );
    const topCloud = gameCanvas?.querySelector(".stage-top-cloud");
    const grass = gameCanvas?.querySelector(".stage-grass");
    const topCloudRect = topCloud?.getBoundingClientRect();
    const grassRect = grass?.getBoundingClientRect();
    const angel = angelZone.querySelector(":scope > .angel-sprite:not(.final-cheer)");
    const angelRect = angel?.getBoundingClientRect();
    const separation = CARD_H * 0.12;
    const topCloudVisibleBottom = topCloudRect?.height
      ? topCloudRect.top + topCloudRect.height * (TOP_CLOUD_OPAQUE_BOTTOM / STAGE_ASSET_HEIGHT)
      : 0;
    const grassVisibleTop = grassRect?.height
      ? grassRect.top + grassRect.height * (GRASS_OPAQUE_TOP / STAGE_ASSET_HEIGHT)
      : 0;
    let topEdge = topCloudRect?.height
      ? toLogicalY(topCloudVisibleBottom) + separation
      : CARD_H * 0.75;
    const bottomBoundaries = [
      angelRect?.height ? toLogicalY(angelRect.top) - separation : Infinity,
      grassRect?.height ? toLogicalY(grassVisibleTop) - separation : Infinity,
    ];
    let bottomEdge = Math.min(...bottomBoundaries);
    if (!Number.isFinite(bottomEdge)) bottomEdge = logicalHeight - CARD_H * 1.2;

    topEdge = Math.max(CARD_H / 2, topEdge);
    bottomEdge = Math.min(logicalHeight - CARD_H / 2, bottomEdge);
    const minimumCardRegion = CARD_H * 6;
    if (bottomEdge - topEdge < minimumCardRegion) {
      topEdge = Math.max(CARD_H / 2, bottomEdge - minimumCardRegion);
    }

    return { logicalWidth, logicalHeight, topEdge, bottomEdge };
  }

  function getMobileSlots() {
    const { logicalWidth, topEdge, bottomEdge } = getMobileLayoutBounds();
    // Keep the idle-float transform inside the live card region as well. The
    // padding is expressed in card units so it remains stable at every scale.
    const motionPadding = CARD_H * 0.08;
    const firstRow = topEdge + CARD_H / 2 + motionPadding;
    const lastRow = bottomEdge - CARD_H / 2 - motionPadding;
    const rowGap = (lastRow - firstRow) / 5;
    const leftCenter = logicalWidth * 0.2525;
    const rightCenter = logicalWidth * 0.7475;
    const center = logicalWidth / 2;
    return MOBILE_SLOT_TEMPLATE.map(([templateX, row]) => [
      templateX === 303 ? center : (templateX < 303 ? leftCenter : rightCenter),
      firstRow + row * rowGap,
    ]);
  }

  function getMobileDecorations() {
    const { logicalWidth, topEdge, bottomEdge } = getMobileLayoutBounds();
    const decorationTravel = Math.max(0, bottomEdge - topEdge - CARD_H);
    return MOBILE_DECORATION_TEMPLATE.map(([side, progress, width, stretch]) => [
      side === "left" ? -width * 0.7 : logicalWidth - width * 0.3,
      topEdge + progress * decorationTravel,
      width,
      stretch,
    ]);
  }

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
      slotIndex: id,
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
      width: CARD_W,
      animating: false,
      selected: false,
    };
    button.addEventListener("animationend", (event) => {
      if (event.target !== button || event.animationName !== "fixed-cloud-enter") return;
      if (!card.selected && !card.animating) forceActiveCardVisible(card);
    });
    button.addEventListener("click", () => handleCard(card));
    return card;
  }

  function resetCardVisualState(card) {
    card.el.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    card.el.className = "cloud-card fixed-card";
    card.el.disabled = false;
    card.el.style.opacity = "0";
    card.el.style.visibility = "visible";
    card.el.style.display = "block";
    card.el.style.pointerEvents = "auto";
    card.el.style.transform = "none";
    card.el.style.removeProperty("animation");
    card.el.style.removeProperty("transition");
    card.el.style.zIndex = "2";
    const visual = card.el.querySelector(".cloud-visual");
    const whiteCloud = card.el.querySelector(".cloud-art.white");
    const darkCloud = card.el.querySelector(".cloud-art.dark");
    [visual, whiteCloud, darkCloud, card.wordEl].forEach((element) => {
      element?.getAnimations().forEach((animation) => animation.cancel());
      element?.style.removeProperty("animation");
      element?.style.removeProperty("transition");
      element?.style.removeProperty("transform");
      element?.style.removeProperty("display");
      element?.style.removeProperty("visibility");
      element?.style.removeProperty("opacity");
    });
  }

  function forceActiveCardVisible(card) {
    if (!card.el.isConnected || card.selected || card.animating) return false;
    card.el.classList.remove("entering", "exiting", "correct", "wrong", "batch-storm", "batch-exit", "respawn");
    const target = answerCards[state.answerIndex];
    const isCurrentTarget = Boolean(
      target && card.targetId === target.id && card.targetIndex === target.sourceIndex,
    );
    card.el.classList.add("fixed-card", "idle", "visibility-ready");
    card.el.classList.toggle("current-target", isCurrentTarget);
    card.el.disabled = false;
    card.el.style.opacity = "1";
    card.el.style.visibility = "visible";
    card.el.style.display = "block";
    card.el.style.pointerEvents = "auto";
    card.el.style.zIndex = isCurrentTarget ? "4" : "2";
    const visual = card.el.querySelector(".cloud-visual");
    const whiteCloud = card.el.querySelector(".cloud-art.white");
    [visual, whiteCloud, card.wordEl].forEach((element) => {
      if (!element) return;
      element.style.opacity = "1";
      element.style.visibility = "visible";
      element.style.removeProperty("display");
    });
    return true;
  }

  function cardVisibilityIssue(card) {
    if (!card.el.isConnected || card.selected || card.animating) return null;
    const rect = card.el.getBoundingClientRect();
    const style = getComputedStyle(card.el);
    const visual = card.el.querySelector(".cloud-visual");
    const whiteCloud = card.el.querySelector(".cloud-art.white");
    const word = card.wordEl;
    const visibleViewport = window.visualViewport;
    const left = visibleViewport?.offsetLeft ?? 0;
    const top = visibleViewport?.offsetTop ?? 0;
    const right = left + (visibleViewport?.width ?? window.innerWidth);
    const bottom = top + (visibleViewport?.height ?? window.innerHeight);
    const visible = style.display !== "none"
      && style.visibility === "visible"
      && Number(style.opacity) >= 0.99
      && rect.width > 0
      && rect.height > 0
      && rect.left >= left - 1
      && rect.right <= right + 1
      && rect.top >= top - 1
      && rect.bottom <= bottom + 1
      && Boolean(visual)
      && Boolean(whiteCloud)
      && normalizeText(word?.textContent).length > 0;
    return visible ? null : { cardId: card.id, word: card.word };
  }

  function enforceActiveCardVisibility() {
    if (state.final || state.locked) return [];
    const activeCards = state.cards.filter((card) => !card.selected && !card.animating);
    const issues = activeCards.map(cardVisibilityIssue).filter(Boolean);
    if (issues.length > 0) {
      state.cardVisibilityRepairCount += issues.length;
      activeCards.forEach((card) => {
        if (cardVisibilityIssue(card)) forceActiveCardVisible(card);
      });
    }
    ensureCurrentAnswerCard();
    stage.dataset.hiddenActiveCardCount = String(
      activeCards.map(cardVisibilityIssue).filter(Boolean).length,
    );
    return issues;
  }

  function enforceAngelVisibility() {
    if (state.final) return false;
    const angel = angelZone.querySelector(":scope > .angel-sprite:not(.final-cheer)");
    const image = angel?.querySelector("img");
    const style = angel ? getComputedStyle(angel) : null;
    const imageStyle = image ? getComputedStyle(image) : null;
    const visible = Boolean(
      angel
      && image
      && angel.isConnected
      && style.display !== "none"
      && style.visibility === "visible"
      && Number(style.opacity) >= 0.99
      && imageStyle.display !== "none"
      && imageStyle.visibility === "visible"
      && Number(imageStyle.opacity) >= 0.99
    );
    if (visible) return false;
    state.angelVisibilityRepairCount += 1;
    if (!angel || !image) {
      setAngel("idle");
      return true;
    }
    angel.style.display = "block";
    angel.style.visibility = "visible";
    angel.style.opacity = "1";
    angel.style.zIndex = "21";
    image.style.display = "block";
    image.style.visibility = "visible";
    image.style.opacity = "1";
    return true;
  }

  function getCardPlayfieldBounds() {
    const canvasRect = gameCanvas.getBoundingClientRect();
    const logicalWidth = gameCanvas?.clientWidth || W;
    const scale = canvasRect.width / logicalWidth;
    const topCloud = gameCanvas.querySelector(".stage-top-cloud");
    const grass = gameCanvas.querySelector(".stage-grass");
    const topCloudRect = topCloud?.getBoundingClientRect();
    const grassRect = grass?.getBoundingClientRect();
    const topCloudBottom = topCloudRect?.height
      ? topCloudRect.top + topCloudRect.height * (TOP_CLOUD_OPAQUE_BOTTOM / STAGE_ASSET_HEIGHT)
      : canvasRect.top;
    const grassTop = grassRect?.height
      ? grassRect.top + grassRect.height * (GRASS_OPAQUE_TOP / STAGE_ASSET_HEIGHT)
      : canvasRect.bottom;
    const safetyGap = CARD_H * 0.12 * scale;
    return {
      top: topCloudBottom + safetyGap,
      bottom: grassTop - safetyGap,
      left: canvasRect.left,
      right: canvasRect.right,
      scale,
    };
  }

  function intersectRects(left, right) {
    const width = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
    const height = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
    return { width, height, area: width * height };
  }

  function getActiveCardGeometryReport() {
    const bounds = getCardPlayfieldBounds();
    const idlePaddingX = 4 * bounds.scale;
    const idlePaddingY = 7 * bounds.scale;
    const cards = state.cards.filter((card) => card.el.isConnected && !card.selected);
    const cardRects = cards.map((card) => {
      const rect = card.el.getBoundingClientRect();
      return {
        card,
        rect,
        padded: {
          left: rect.left - idlePaddingX,
          right: rect.right + idlePaddingX,
          top: rect.top - idlePaddingY,
          bottom: rect.bottom + idlePaddingY,
        },
      };
    });
    const boundaryIssues = cardRects.filter(({ padded }) => (
      padded.left < bounds.left - 1
      || padded.right > bounds.right + 1
      || padded.top < bounds.top - 1
      || padded.bottom > bounds.bottom + 1
    )).map(({ card }) => card.id);
    const pairOverlaps = [];
    cardRects.forEach((left, leftIndex) => {
      cardRects.slice(leftIndex + 1).forEach((right) => {
        const intersection = intersectRects(left.padded, right.padded);
        if (intersection.area <= 0) return;
        const smallerArea = Math.min(
          left.rect.width * left.rect.height,
          right.rect.width * right.rect.height,
        );
        pairOverlaps.push({
          leftId: left.card.id,
          rightId: right.card.id,
          overlapRatio: smallerArea > 0 ? intersection.area / smallerArea : 1,
        });
      });
    });
    const target = answerCards[state.answerIndex];
    const targetEntry = cardRects.find(({ card }) => (
      target && card.targetId === target.id && card.targetIndex === target.sourceIndex
    ));
    const targetOverlapRatio = targetEntry
      ? Math.max(0, ...cardRects.filter((entry) => entry !== targetEntry).map((entry) => {
          const intersection = intersectRects(targetEntry.rect, entry.rect);
          const targetArea = targetEntry.rect.width * targetEntry.rect.height;
          return targetArea > 0 ? intersection.area / targetArea : 1;
        }))
      : 1;
    const targetWordRect = targetEntry?.card.wordEl.getBoundingClientRect();
    const targetTextVisible = Boolean(
      targetEntry
      && targetWordRect
      && targetWordRect.left >= bounds.left - 1
      && targetWordRect.right <= bounds.right + 1
      && targetWordRect.top >= bounds.top - 1
      && targetWordRect.bottom <= bounds.bottom + 1
    );
    return {
      bounds,
      cardCount: cards.length,
      boundaryIssues,
      pairOverlaps,
      targetOverlapRatio,
      targetTextVisible,
      targetCardId: targetEntry?.card.id ?? null,
      valid: boundaryIssues.length === 0
        && pairOverlaps.length === 0
        && targetOverlapRatio < 0.2
        && targetTextVisible,
    };
  }

  function cardGeometryScore(report) {
    return report.boundaryIssues.length * 1000
      + report.pairOverlaps.reduce((total, overlap) => total + 100 + overlap.overlapRatio * 100, 0)
      + (report.targetOverlapRatio >= 0.2 ? 500 : 0)
      + (report.targetTextVisible ? 0 : 500);
  }

  function repairCardSlotCollisions({ allowPublished = false } = {}) {
    if (!usesMobileLayout() || state.final || (state.batchPublished && !allowPublished)) {
      return getActiveCardGeometryReport();
    }
    let report = getActiveCardGeometryReport();
    let score = cardGeometryScore(report);
    for (let pass = 0; pass < 4 && score > 0; pass += 1) {
      let bestSwap = null;
      let bestScore = score;
      for (let leftIndex = 0; leftIndex < state.cards.length - 1; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < state.cards.length; rightIndex += 1) {
          const left = state.cards[leftIndex];
          const right = state.cards[rightIndex];
          [left.slotIndex, right.slotIndex] = [right.slotIndex, left.slotIndex];
          applyMobileGeometry();
          const candidateScore = cardGeometryScore(getActiveCardGeometryReport());
          [left.slotIndex, right.slotIndex] = [right.slotIndex, left.slotIndex];
          applyMobileGeometry();
          if (candidateScore < bestScore) {
            bestScore = candidateScore;
            bestSwap = [left, right];
          }
        }
      }
      if (!bestSwap) break;
      [bestSwap[0].slotIndex, bestSwap[1].slotIndex] = [bestSwap[1].slotIndex, bestSwap[0].slotIndex];
      applyMobileGeometry();
      report = getActiveCardGeometryReport();
      score = cardGeometryScore(report);
    }
    state.cards.forEach(forceActiveCardVisible);
    stage.dataset.cardOverlapCount = String(report.pairOverlaps.length);
    stage.dataset.cardBoundaryIssueCount = String(report.boundaryIssues.length);
    return report;
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
    const desktopDecorations = [
      [-118, 188, 185, 0.82], [533, 205, 185, 0.82],
      [-130, 468, 195, 0.88], [540, 505, 182, 0.8],
      [-126, 690, 188, 0.84], [538, 666, 190, 0.84],
      [-118, 890, 176, 0.76], [545, 915, 180, 0.78],
    ];
    (usesMobileLayout() ? getMobileDecorations() : desktopDecorations).forEach(([left, top, width, stretch]) => {
      createDecorativeCloud(left, top, width, stretch);
    });

    const desktopSlots = [
      [303, 570], [160, 420], [446, 720], [446, 420], [160, 720],
      [160, 270], [446, 870], [446, 270], [160, 870], [160, 1020],
      [446, 1020],
    ];
    const selectedSlots = usesMobileLayout() ? getMobileSlots() : desktopSlots;
    const definitions = selectedSlots.map(([centerX, centerY], id) => {
      const bootstrap = bootstrapCards[id];
      return {
          id,
          centerX,
          centerY,
          colorIndex: bootstrap?.colorIndex ?? id % COLORS.length,
          distractorIndex: bootstrap?.distractorIndex ?? id * 11 + 7,
        };
    });
    definitions.forEach((definition) => {
      state.cards.push(createCloudCard(definition));
    });
  }

  function applyMobileGeometry({ allowPublished = false } = {}) {
    if (!usesMobileLayout() || state.final || (state.batchPublished && !allowPublished)) return;
    const slots = getMobileSlots();
    const logicalWidth = gameCanvas?.clientWidth || W;
    const sideGutter = logicalWidth * 0.02;
    state.cards.forEach((card, index) => {
      const [centerX, centerY] = slots[card.slotIndex ?? index];
      const unclampedX = centerX - card.width / 2;
      const x = Math.min(
        logicalWidth - sideGutter - card.width,
        Math.max(sideGutter, unclampedX),
      );
      card.centerX = x + card.width / 2;
      card.centerY = centerY;
      card.x = x;
      card.top = centerY - CARD_H / 2;
      card.el.style.left = `${card.x}px`;
      card.el.style.top = `${card.top}px`;
    });
    const decorations = getMobileDecorations();
    state.decorations.forEach((cloud, index) => {
      const [left, top] = decorations[index];
      cloud.style.left = `${left}px`;
      cloud.style.top = `${top}px`;
    });
  }

  let mobileLayoutFrame = 0;
  function scheduleMobileGeometry(allowPublished = false) {
    if (!usesMobileLayout()) return;
    const mayUpdatePublishedBatch = allowPublished === true;
    window.cancelAnimationFrame(mobileLayoutFrame);
    mobileLayoutFrame = window.requestAnimationFrame(() => {
      mobileLayoutFrame = window.requestAnimationFrame(() => {
        applyMobileGeometry({ allowPublished: mayUpdatePublishedBatch });
        const cardsAreVisible = state.cards.length === 11 && state.cards.every(
          (card) => Number(getComputedStyle(card.el).opacity) > 0,
        );
        if (cardsAreVisible && state.batchPublished && state.batchSettled && !state.final) {
          validateMobileBatch();
        }
      });
    });
  }

  function setCardWord(card, entry, colorIndex) {
    if (state.batchPublished) {
      state.postPublishContentMutationCount += 1;
      return false;
    }
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
    const width = usesMobileLayout()
      ? Math.max(172, Math.min(290, 148 + length * 18))
      : Math.max(164, Math.min(278, 142 + length * 17));
    card.x = card.centerX - width / 2;
    card.top = card.centerY - CARD_H / 2;
    card.width = width;
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
    return true;
  }

  function ensureCurrentAnswerCard() {
    const target = answerCards[state.answerIndex];
    if (!target || state.cards.length === 0) return null;
    let targetCard = state.cards.find((card) => (
      card.targetId === target.id && card.targetIndex === target.sourceIndex
    ));
    if (!targetCard) {
      if (state.batchPublished) return null;
      targetCard = state.cards.find((card) => card.targetId === null) || state.cards[0];
      setCardWord(targetCard, {
        word: target.word,
        targetId: target.id,
        targetIndex: target.sourceIndex,
      }, targetCard.colorIndex);
    }
    targetCard.el.disabled = false;
    if (!state.locked && !targetCard.selected && !targetCard.animating) {
      forceActiveCardVisible(targetCard);
    }
    return targetCard;
  }

  function cardRectIsUsable(card, viewportRect, topLimit, bottomLimit) {
    const rect = card.el.getBoundingClientRect();
    const epsilon = 1;
    return rect.width > 0
      && rect.height > 0
      && rect.left >= viewportRect.left - epsilon
      && rect.right <= viewportRect.right + epsilon
      && rect.top >= topLimit - epsilon
      && rect.bottom <= bottomLimit + epsilon;
  }

  function validateMobileBatch({ repair = true } = {}) {
    const target = answerCards[state.answerIndex];
    const viewportRect = stage.getBoundingClientRect();
    const canvasRect = gameCanvas.getBoundingClientRect();
    const scale = canvasRect.width / (gameCanvas?.clientWidth || W);
    const layoutBounds = getMobileLayoutBounds();
    const topLimit = canvasRect.top + layoutBounds.topEdge * scale;
    const bottomLimit = canvasRect.top + layoutBounds.bottomEdge * scale;
    const currentCards = state.cards.filter((card) => card.el.isConnected);
    const targetCards = target
      ? currentCards.filter((card) => (
          card.targetId === target.id && card.targetIndex === target.sourceIndex
        ))
      : [];
    const targetStyle = targetCards.length === 1 ? getComputedStyle(targetCards[0].el) : null;
    const targetInteractive = !target || (
      targetCards.length === 1
      && !targetCards[0].el.disabled
      && targetStyle.display !== "none"
      && targetStyle.visibility !== "hidden"
      && Number(targetStyle.opacity) > 0
    );
    const wordsValid = currentCards.every((card) => normalizeText(card.word).length > 0);
    const geometryValid = currentCards.every((card) => (
      cardRectIsUsable(card, viewportRect, topLimit, bottomLimit)
    ));
    const rects = currentCards.map((card) => card.el.getBoundingClientRect());
    const nonOverlapping = rects.every((leftRect, leftIndex) => (
      rects.slice(leftIndex + 1).every((rightRect) => !(
        leftRect.left < rightRect.right - 1
        && leftRect.right > rightRect.left + 1
        && leftRect.top < rightRect.bottom - 1
        && leftRect.bottom > rightRect.top + 1
      ))
    ));
    const visibleViewport = window.visualViewport;
    const visibleBounds = {
      left: visibleViewport?.offsetLeft ?? 0,
      top: visibleViewport?.offsetTop ?? 0,
      right: (visibleViewport?.offsetLeft ?? 0) + (visibleViewport?.width ?? window.innerWidth),
      bottom: (visibleViewport?.offsetTop ?? 0) + (visibleViewport?.height ?? window.innerHeight),
    };
    const insideVisibleBounds = (rect) => (
      rect.left >= visibleBounds.left - 1
      && rect.right <= visibleBounds.right + 1
      && rect.top >= visibleBounds.top - 1
      && rect.bottom <= visibleBounds.bottom + 1
    );
    const angel = angelZone.querySelector(":scope > .angel-sprite:not(.final-cheer)");
    const lowerElements = {
      angel: angel ? insideVisibleBounds(angel.getBoundingClientRect()) : false,
      hint: hintWord ? insideVisibleBounds(hintWord.getBoundingClientRect()) : false,
      menu: menuButton ? insideVisibleBounds(menuButton.getBoundingClientRect()) : false,
      grass: false,
    };
    const grassRect = document.querySelector(".stage-grass")?.getBoundingClientRect();
    lowerElements.grass = Boolean(
      grassRect
      && grassRect.bottom >= visibleBounds.bottom - 1
      && grassRect.bottom <= visibleBounds.bottom + 1
      && grassRect.left >= visibleBounds.left - 1
      && grassRect.right <= visibleBounds.right + 1
    );
    const lowerElementsVisible = Object.values(lowerElements).every(Boolean);
    const stageFillsVisibleViewport = (
      Math.abs(viewportRect.left - visibleBounds.left) <= 1
      && Math.abs(viewportRect.right - visibleBounds.right) <= 1
      && Math.abs(viewportRect.top - visibleBounds.top) <= 1
      && Math.abs(viewportRect.bottom - visibleBounds.bottom) <= 1
    );
    const canvasFitsVisibleViewport = (
      canvasRect.left >= visibleBounds.left - 1
      && canvasRect.right <= visibleBounds.right + 1
      && canvasRect.top >= visibleBounds.top - 1
      && canvasRect.bottom <= visibleBounds.bottom + 1
    );
    const valid = state.batchPublished
      && state.batchSettled
      && currentCards.length === 11
      && wordsValid
      && (!target || targetCards.length === 1)
      && targetInteractive
      && geometryValid
      && nonOverlapping
      && lowerElementsVisible
      && stageFillsVisibleViewport
      && canvasFitsVisibleViewport;

    if (!valid && repair && !state.batchPublished) {
      ensureCurrentAnswerCard();
      applyMobileGeometry();
      repairCardSlotCollisions();
      return validateMobileBatch({ repair: false });
    }

    stage.dataset.mobileBatchValid = valid ? "true" : "false";
    stage.dataset.mobileCardCount = String(currentCards.length);
    stage.dataset.mobileTargetVisible = targetInteractive ? "true" : "false";
    stage.dataset.mobileLowerUiVisible = lowerElementsVisible ? "true" : "false";
    return {
      valid,
      cardCount: currentCards.length,
      targetVisible: targetInteractive,
      wordsValid,
      geometryValid,
      nonOverlapping,
      lowerElements,
      stageFillsVisibleViewport,
      canvasFitsVisibleViewport,
      visualViewport: {
        width: visibleBounds.right - visibleBounds.left,
        height: visibleBounds.bottom - visibleBounds.top,
        offsetLeft: visibleBounds.left,
        offsetTop: visibleBounds.top,
      },
    };
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

  function setBatchPreparing(preparing) {
    laneLayer.classList.toggle("batch-preparing", preparing);
    laneLayer.style.removeProperty("display");
    laneLayer.style.removeProperty("visibility");
    laneLayer.style.removeProperty("opacity");
    laneLayer.style.removeProperty("pointer-events");
    if (hintWord) {
      hintWord.style.visibility = preparing ? "hidden" : "visible";
      hintWord.setAttribute("aria-hidden", preparing ? "true" : "false");
    }
  }

  function preparedBatchReport({ allowUndecodedImages = false } = {}) {
    const target = answerCards[state.answerIndex];
    const targetCard = state.cards.find((card) => (
      target && card.targetId === target.id && card.targetIndex === target.sourceIndex
    ));
    const targetStyle = targetCard ? getComputedStyle(targetCard.el) : null;
    const targetImage = targetCard?.el.querySelector(".cloud-art.white");
    const targetImageStyle = targetImage ? getComputedStyle(targetImage) : null;
    const geometry = getActiveCardGeometryReport();
    const hiddenCards = state.cards.map(cardVisibilityIssue).filter(Boolean);
    const targetImagePresent = Boolean(
      targetImage
      && targetImage.getAttribute("src")
      && targetImageStyle
      && targetImageStyle.display !== "none"
      && targetImageStyle.visibility === "visible"
      && Number(targetImageStyle.opacity) >= 0.99
    );
    const targetImageDecoded = Boolean(
      targetImagePresent
      && targetImage.complete
      && targetImage.naturalWidth > 0
    );
    const targetReady = Boolean(
      targetCard
      && targetStyle
      && targetStyle.display !== "none"
      && targetStyle.visibility === "visible"
      && Number(targetStyle.opacity) >= 0.99
      && targetStyle.pointerEvents !== "none"
      && !targetCard.el.disabled
      && normalizeText(targetCard.wordEl.textContent) === normalizeText(target?.word)
      && targetImagePresent
      && (allowUndecodedImages || targetImageDecoded)
    );
    return {
      valid: state.cards.length === 11
        && hiddenCards.length === 0
        && targetReady
        && geometry.valid,
      targetReady,
      targetImagePresent,
      targetImageDecoded,
      hiddenCardCount: hiddenCards.length,
      geometry,
    };
  }

  function waitForCardImages(token, timeoutMs = CARD_IMAGE_WAIT_TIMEOUT_MS) {
    const images = state.cards.flatMap((card) => (
      [...card.el.querySelectorAll("img")]
    ));
    const imageResults = Promise.allSettled(images.map((image) => {
      if (image.complete) return Promise.resolve(image.naturalWidth > 0);
      if (typeof image.decode === "function") {
        return Promise.resolve(image.decode()).then(
          () => image.naturalWidth > 0,
          () => false,
        );
      }
      return new Promise((resolve) => {
        image.addEventListener("load", () => resolve(true), { once: true });
        image.addEventListener("error", () => resolve(false), { once: true });
      });
    })).then((results) => ({
      timedOut: false,
      allReady: results.every((result) => result.status === "fulfilled" && result.value),
      failedCount: results.filter(
        (result) => result.status !== "fulfilled" || !result.value,
      ).length,
    }));

    let timeoutId = 0;
    const timeout = new Promise((resolve) => {
      timeoutId = window.setTimeout(() => resolve({
        timedOut: true,
        allReady: false,
        failedCount: images.filter((image) => !(image.complete && image.naturalWidth > 0)).length,
      }), timeoutMs);
    });
    return Promise.race([imageResults, timeout]).then((result) => {
      window.clearTimeout(timeoutId);
      if (token !== state.batchToken) return { ...result, stale: true };
      return { ...result, stale: false };
    }, () => {
      window.clearTimeout(timeoutId);
      return {
        timedOut: false,
        allReady: false,
        failedCount: images.length,
        stale: token !== state.batchToken,
      };
    });
  }

  function settlePublishedBatch(token, delay) {
    setBatchTimeout(() => {
      state.locked = false;
      state.batchSettled = true;
      const finalReport = preparedBatchReport({ allowUndecodedImages: true });
      stage.dataset.mobileBatchValid = finalReport.valid ? "true" : "false";
      updateHint();
      armIdleReminder();
    }, delay, token);
  }

  function emergencyPublishBatch(token) {
    if (token !== state.batchToken || state.final) return false;
    state.batchEmergencyPublishCount += 1;
    ensureCurrentAnswerCard();
    applyMobileGeometry();
    repairCardSlotCollisions();
    state.cards.forEach(forceActiveCardVisible);
    state.decorations.forEach((cloud) => {
      cloud.style.opacity = "";
      cloud.className = "decorative-cloud show idle";
      cloud.style.removeProperty("animation-delay");
      cloud.style.removeProperty("animation-play-state");
    });
    state.batchPublished = true;
    state.publishedBatchToken = token;
    state.batchPublicationSuccessCount += 1;
    state.batchPublicationRetryStreak = 0;
    setBatchPreparing(false);
    playFx("cloudEntrance", 0, 0.8);
    settlePublishedBatch(token, 0);
    return true;
  }

  function publishPreparedBatch(token, { allowUndecodedImages = false, watchdog = false } = {}) {
    if (token !== state.batchToken || state.final) return false;
    if (state.publishedBatchToken === token || state.batchPublicationStartedToken === token) {
      return state.publishedBatchToken === token;
    }
    state.batchPublicationStartedToken = token;
    state.batchPublicationInvocationCount += 1;
    let retryScheduled = false;
    try {
      const report = preparedBatchReport({ allowUndecodedImages });
      if (!report.valid) {
        if (!watchdog && state.batchPublicationRetryStreak < MAX_BATCH_PUBLICATION_RETRIES) {
          state.batchPublicationRetryStreak += 1;
          state.batchPublicationRetryCount += 1;
          retryScheduled = true;
          setBatchTimeout(populateCards, 80, token);
          return false;
        }
        return emergencyPublishBatch(token);
      }

      const currentTarget = answerCards[state.answerIndex];
      const entranceOrder = [...state.cards].sort((left, right) => {
        const leftIsTarget = left.targetId === currentTarget?.id ? 1 : 0;
        const rightIsTarget = right.targetId === currentTarget?.id ? 1 : 0;
        return rightIsTarget - leftIsTarget || left.id - right.id;
      });
      entranceOrder.forEach((card, index) => {
        card.el.classList.remove("idle", "visibility-ready");
        card.el.classList.add("entering");
        card.el.style.animationDelay = `${index * 50}ms`;
        card.el.style.animationPlayState = "paused";
      });
      state.decorations.forEach((cloud, index) => {
        cloud.style.opacity = "";
        cloud.className = "decorative-cloud show entering";
        cloud.style.animationDelay = `${25 + index * 65}ms`;
        cloud.style.animationPlayState = "paused";
      });

      state.batchPublished = true;
      state.publishedBatchToken = token;
      state.batchPublicationSuccessCount += 1;
      state.batchPublicationRetryStreak = 0;
      setBatchPreparing(false);
      void laneLayer.offsetWidth;
      entranceOrder.forEach((card, index) => {
        card.el.style.animationPlayState = "running";
        setBatchTimeout(() => {
          card.el.classList.remove("entering");
          card.el.style.removeProperty("animation-delay");
          card.el.style.removeProperty("animation-play-state");
          card.el.classList.add("idle", "visibility-ready");
          forceActiveCardVisible(card);
        }, 500 + index * 50, token);
      });
      state.decorations.forEach((cloud, index) => {
        cloud.style.animationPlayState = "running";
        setBatchTimeout(() => {
          cloud.classList.remove("entering");
          cloud.style.removeProperty("animation-delay");
          cloud.style.removeProperty("animation-play-state");
          cloud.classList.add("idle");
        }, 510 + index * 65, token);
      });
      playFx("cloudEntrance", 0, 0.8);

      settlePublishedBatch(
        token,
        Math.max(state.cards.length * 50 + 520, state.decorations.length * 65 + 540),
      );
      return true;
    } catch (error) {
      state.batchPublicationFailureCount += 1;
      console.error("Card batch publication failed; using visible fallback.", error);
      return emergencyPublishBatch(token);
    } finally {
      if (token === state.batchToken && state.publishedBatchToken === token) {
        setBatchPreparing(false);
      } else if (token === state.batchToken && !retryScheduled && watchdog) {
        emergencyPublishBatch(token);
        setBatchPreparing(false);
      }
    }
  }

  function populateCards() {
    clearBatchTimers();
    state.batchPublished = false;
    state.batchSettled = false;
    const token = ++state.batchToken;
    state.batchPublicationStartedToken = 0;
    setBatchPreparing(true);
    setAngel("idle");
    let publicationPipelineScheduled = false;
    try {
      if (usesMobileLayout()) stage.dataset.mobileBatchValid = "false";
      const batch = getBatchWords();
      state.batchTargetCount = batch.targetCount;
      state.batchCorrectCount = 0;
      state.locked = true;
      state.cards.forEach((card, index) => {
        const entry = batch.entries[index];
        card.slotIndex = card.id;
        card.animating = false;
        card.selected = false;
        resetCardVisualState(card);
        setCardWord(card, entry, card.colorIndex);
      });
      ensureCurrentAnswerCard();
      applyMobileGeometry();
      repairCardSlotCollisions();
      state.cards.forEach(forceActiveCardVisible);
      state.decorations.forEach((cloud) => {
        cloud.className = "decorative-cloud";
        cloud.style.opacity = "0";
        cloud.style.removeProperty("animation-delay");
        cloud.style.removeProperty("animation-play-state");
      });
      updateHint();
      publicationPipelineScheduled = true;
      void waitForCardImages(token).then((result) => {
        if (result.stale || token !== state.batchToken) return;
        if (result.timedOut) state.batchImageWaitTimeoutCount += 1;
        state.batchImageDecodeFailureCount += result.timedOut
          ? Math.max(1, result.failedCount)
          : result.failedCount;
        setBatchTimeout(() => publishPreparedBatch(token, {
          allowUndecodedImages: !result.allReady,
        }), CARD_PUBLICATION_DELAY_MS, token);
      }).catch(() => {
        if (token !== state.batchToken) return;
        state.batchImageDecodeFailureCount += 1;
        setBatchTimeout(() => publishPreparedBatch(token, {
          allowUndecodedImages: true,
        }), 0, token);
      });
    } catch (error) {
      state.batchPublicationFailureCount += 1;
      console.error("Card batch preparation failed; retrying with visible fallback.", error);
    } finally {
      setBatchTimeout(() => {
        if (state.publishedBatchToken === token) return;
        state.batchPublicationWatchdogCount += 1;
        publishPreparedBatch(token, {
          allowUndecodedImages: true,
          watchdog: true,
        });
      }, CARD_PUBLICATION_WATCHDOG_MS, token);
      if (!publicationPipelineScheduled) {
        setBatchTimeout(() => publishPreparedBatch(token, {
          allowUndecodedImages: true,
          watchdog: true,
        }), 0, token);
      }
    }
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
      ? [{ parts: [{ text: "요한계시록 4장", intro: true }] }]
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
    if (!wrap) {
      wrap = document.createElement("span");
      const image = document.createElement("img");
      image.alt = "";
      image.draggable = false;
      wrap.appendChild(image);
      angelZone.appendChild(wrap);
    }
    const frameFiles = {
      idle: "angel_idle.png",
      smile: "angel_happy.png",
      heart: "angel_fullbody.png",
      cry: "angel_cry.png",
    };
    wrap.className = "angel-sprite";
    wrap.style.left = "12px";
    wrap.style.opacity = "1";
    wrap.style.visibility = "visible";
    wrap.style.display = "block";
    wrap.style.zIndex = "21";
    const activeFrame = type === "cheer" ? "heart" : type;
    const image = wrap.querySelector("img");
    const nextSource = `/assets/images/${frameFiles[activeFrame] || frameFiles.idle}`;
    image.className = `angel-frame angel-frame-${activeFrame} active`;
    if (image.getAttribute("src") !== nextSource) image.src = nextSource;
    image.style.opacity = "1";
    image.style.visibility = "visible";
    image.style.display = "block";
    if (type === "heart" || type === "cheer") {
      wrap.classList.add("fullbody-heart", "milestone-jump");
    }
    if (duration > 0) {
      const cheerBatchToken = state.batchToken;
      const cheerWrap = wrap;
      state.cheerTimer = window.setTimeout(() => {
        state.cheerTimer = 0;
        if (cheerBatchToken !== state.batchToken || !cheerWrap.isConnected) {
          state.staleBatchCallbacksIgnored += 1;
          return;
        }
        setAngel("idle");
      }, duration);
    }
    if (usesMobileLayout()) scheduleMobileGeometry();
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
    clearBatchTimers();
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
    setBatchTimeout(() => {
      if (state.answerIndex >= answerCards.length) showFinalScreen();
      else {
        state.batchNumber += 1;
        populateCards();
      }
    }, 980, transitionToken);
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
    card.el.classList.remove("idle", "visibility-ready");
    card.el.classList.add("correct");
    card.el.style.pointerEvents = "none";
    card.el.style.zIndex = "10";
    state.answerIndex += 1;
    saveProgress();
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

    setBatchTimeout(() => {
      card.el.style.opacity = "0";
      card.el.disabled = true;
    }, 930, cardBatchToken);

    if (batchFinished) {
      updateHint();
      if (cardBatchToken === state.batchToken) finishBatch();
    } else {
      const next = answerCards[state.answerIndex]?.word;
      updateHint();
      setBatchTimeout(enforceActiveCardVisibility, 0, cardBatchToken);
      if (next) announce(`정답. 다음 말씀은 ${next}`);
    }
  }

  function handleWrong(card) {
    const cardBatchToken = state.batchToken;
    card.animating = true;
    card.el.classList.remove("idle", "visibility-ready");
    card.el.classList.add("wrong");
    card.el.style.pointerEvents = "none";
    card.el.style.zIndex = "9";
    state.consecutiveCorrect = 0;
    state.consecutiveWrong += 1;
    playFx("incorrect");
    setAngel("cry", 860);
    announce("다시 생각해 보세요.");
    setBatchTimeout(() => {
      card.el.classList.remove("wrong");
      card.animating = false;
      forceActiveCardVisible(card);
      enforceActiveCardVisibility();
    }, 820, cardBatchToken);
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

  function restoreSentenceForProgress() {
    if (state.answerIndex <= 0) return;
    const lastCompletedTarget = answerCards[state.answerIndex - 1];
    if (!lastCompletedTarget) return;

    state.introVisible = false;
    state.displayLines = [];
    answerCards
      .slice(0, state.answerIndex)
      .filter((target) => target.verseIndex === lastCompletedTarget.verseIndex)
      .forEach((target) => {
        appendSentenceChunk(target.word, target.verseIndex, target.verseCardIndex === 0);
      });
  }

  function beginGame(resumeAnswerIndex = 0) {
    state.answerIndex = Math.max(0, Math.min(resumeAnswerIndex, answerCards.length));
    syncCurrentTarget();
    state.batchNumber = Math.floor(state.answerIndex / 10);
    state.batchCorrectCount = 0;
    state.batchTargetCount = 0;
    state.locked = true;
    state.consecutiveWrong = 0;
    state.totalCorrect = state.answerIndex;
    state.introVisible = state.answerIndex === 0;
    state.final = false;
    sentenceWindow.style.display = "block";
    laneLayer.style.display = "block";
    resetSentence();
    restoreSentenceForProgress();
    setAngel("idle");

    if (state.answerIndex >= answerCards.length) {
      showFinalScreen();
      announce("요한계시록 4장 완료");
      return;
    }

    populateCards();
    announce(`${state.verseIndex + 1}절 시작. 첫 말씀은 ${answerCards[state.answerIndex].word}`);
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
    const primaryAngel = angelZone.querySelector(":scope > .angel-sprite:not(.final-cheer)");
    const positions = [12, 132, 252, 372, 492];
    const delays = [0, 140, 280, 80, 220];
    if (primaryAngel) {
      primaryAngel.className = "angel-sprite fullbody-heart final-cheer";
      primaryAngel.style.left = `${positions[0]}px`;
      primaryAngel.style.animationDelay = `${delays[0]}ms`;
      const image = primaryAngel.querySelector("img");
      image.src = "/assets/images/angel_fullbody.png";
      image.className = "angel-frame angel-frame-heart active";
      image.style.opacity = "1";
      image.style.visibility = "visible";
      image.style.display = "block";
    }
    const fragment = document.createDocumentFragment();
    positions.slice(primaryAngel ? 1 : 0).forEach((left, offset) => {
      const index = offset + (primaryAngel ? 1 : 0);
      const wrap = document.createElement("span");
      wrap.className = "angel-sprite fullbody-heart final-cheer";
      wrap.style.left = `${left}px`;
      wrap.style.animationDelay = `${delays[index]}ms`;
      const image = document.createElement("img");
      image.src = "/assets/images/angel_fullbody.png";
      image.alt = "";
      image.draggable = false;
      wrap.appendChild(image);
      fragment.appendChild(wrap);
    });
    angelZone.appendChild(fragment);
  }

  function renderAmenPopcorn() {
    const angelCenters = [61, 181, 301, 421, 541];
    const amenBaseTop = Math.max(1012, (gameCanvas?.clientHeight || 1198) - 186);
    const bursts = [
      { x: -32, y: -78, top: amenBaseTop },
      { x: 0, y: -98, top: amenBaseTop + 20 },
      { x: 32, y: -82, top: amenBaseTop + 38 },
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
    clearBatchTimers();
    if (state.cheerTimer) {
      window.clearTimeout(state.cheerTimer);
      state.cheerTimer = 0;
    }
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

  function resetGame({ clearProgress = true } = {}) {
    if (clearProgress) clearSavedProgress();
    clearBatchTimers();
    if (state.cheerTimer) {
      window.clearTimeout(state.cheerTimer);
      state.cheerTimer = 0;
    }
    const endingAngels = [...angelZone.querySelectorAll(":scope > .angel-sprite.final-cheer")];
    const reusableAngel = endingAngels.shift();
    endingAngels.forEach((angel) => angel.remove());
    if (reusableAngel) reusableAngel.className = "angel-sprite";
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
    beginGame(clearProgress ? 0 : loadSavedAnswerIndex());
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
  window.addEventListener("resize", () => scheduleMobileGeometry(true), { passive: true });
  window.visualViewport?.addEventListener("resize", () => scheduleMobileGeometry(true), { passive: true });
  window.setInterval(() => {
    if (!state.paused && !state.final) {
      enforceAngelVisibility();
      if (!state.locked) enforceActiveCardVisibility();
    }
  }, 750);
  window.__REVELATION_GAME_VALIDATE_MOBILE__ = () => validateMobileBatch({ repair: false });
  window.__REVELATION_GAME_VALIDATE_VISIBILITY__ = () => {
    const activeCards = state.cards.filter((card) => !card.selected && !card.animating);
    const cardIssues = activeCards.map(cardVisibilityIssue).filter(Boolean);
    const currentTarget = answerCards[state.answerIndex];
    const currentTargetCard = activeCards.find((card) => (
      currentTarget
      && card.targetId === currentTarget.id
      && card.targetIndex === currentTarget.sourceIndex
    ));
    const currentTargetIssue = currentTargetCard ? cardVisibilityIssue(currentTargetCard) : null;
    const laneStyle = getComputedStyle(laneLayer);
    const angel = angelZone.querySelector(":scope > .angel-sprite:not(.final-cheer)");
    const angelStyle = angel ? getComputedStyle(angel) : null;
    const angelImage = angel?.querySelector("img");
    const angelVisible = Boolean(
      angel
      && angelImage
      && angel.isConnected
      && angelStyle.display !== "none"
      && angelStyle.visibility === "visible"
      && Number(angelStyle.opacity) >= 0.99
      && angel.getBoundingClientRect().width > 0
      && angel.getBoundingClientRect().height > 0
    );
    const geometry = state.final ? null : getActiveCardGeometryReport();
    return {
      batchToken: state.batchToken,
      batchPublished: state.batchPublished,
      batchSettled: state.batchSettled,
      batchPreparing: laneLayer.classList.contains("batch-preparing"),
      laneVisibility: laneStyle.visibility,
      laneOpacity: laneStyle.opacity,
      lanePointerEvents: laneStyle.pointerEvents,
      activeCardCount: activeCards.length,
      hiddenActiveCardCount: cardIssues.length,
      cardIssues,
      currentTargetText: currentTarget?.word || "",
      currentTargetVisible: Boolean(currentTargetCard && !currentTargetIssue),
      currentTargetClickable: Boolean(
        currentTargetCard
        && !currentTargetCard.el.disabled
        && laneStyle.pointerEvents !== "none"
        && getComputedStyle(currentTargetCard.el).pointerEvents !== "none"
      ),
      angelCount: angelZone.querySelectorAll(":scope > .angel-sprite:not(.final-cheer)").length,
      angelVisible,
      staleBatchCallbacksIgnored: state.staleBatchCallbacksIgnored,
      staleTimerMutationCount: state.staleTimerMutationCount,
      cardVisibilityRepairCount: state.cardVisibilityRepairCount,
      angelVisibilityRepairCount: state.angelVisibilityRepairCount,
      pendingBatchTimerCount: state.batchTimers.size,
      batchPublicationRetryCount: state.batchPublicationRetryCount,
      batchPublicationInvocationCount: state.batchPublicationInvocationCount,
      batchPublicationSuccessCount: state.batchPublicationSuccessCount,
      batchPublicationFailureCount: state.batchPublicationFailureCount,
      batchPublicationWatchdogCount: state.batchPublicationWatchdogCount,
      batchImageWaitTimeoutCount: state.batchImageWaitTimeoutCount,
      batchImageDecodeFailureCount: state.batchImageDecodeFailureCount,
      batchEmergencyPublishCount: state.batchEmergencyPublishCount,
      postPublishContentMutationCount: state.postPublishContentMutationCount,
      postPublishGeometryMutationCount: state.postPublishGeometryMutationCount,
      cards: activeCards.map((card) => ({
        id: card.id,
        text: card.wordEl.textContent,
        slotIndex: card.slotIndex,
        left: card.el.style.left,
        top: card.el.style.top,
        opacity: getComputedStyle(card.el).opacity,
        visibility: getComputedStyle(card.el).visibility,
        display: getComputedStyle(card.el).display,
        pointerEvents: getComputedStyle(card.el).pointerEvents,
      })),
      geometry,
    };
  };
  createCards();
  updateMenuLabels();
  resetGame({ clearProgress: false });
  startBgm();
})();

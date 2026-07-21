"use client";

import { useEffect, useState, type CSSProperties } from "react";

const DESIGN_WIDTH = 971.219;
const DESIGN_HEIGHT = 1920;
const MOBILE_DESIGN_WIDTH = 606;
const MOBILE_MIN_LOGICAL_HEIGHT = 1198;
const MOBILE_MAX_WIDTH = 430;

type CloudBootstrap = {
  id: number;
  centerX: number;
  centerY: number;
  colorIndex: number;
  distractorIndex: number;
};

type ViewportMetrics = {
  centerX: number;
  centerY: number;
  height: number;
  left: number;
  mobile: boolean;
  scale: number;
  stageHeight: number;
  stageWidth: number;
  top: number;
  width: number;
};

declare global {
  interface Window {
    __REVELATION_GAME_BOOTSTRAP__?: { cards: CloudBootstrap[] };
    __REVELATION_GAME_STARTED__?: boolean;
    __REVELATION_VIEWPORT_METRICS__?: ViewportMetrics;
  }
}

function createInitialCloudData(): CloudBootstrap[] {
  const fixedSlots = [
    [303, 570], [160, 420], [446, 720], [446, 420], [160, 720],
    [160, 270], [446, 870], [446, 270], [160, 870], [160, 1020],
    [446, 1020],
  ] as const;

  return fixedSlots.map(([centerX, centerY], id) => ({
    id,
    centerX,
    centerY,
    colorIndex: id % 5,
    distractorIndex: id * 11 + 7,
  }));
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [initialCards, setInitialCards] = useState<CloudBootstrap[] | null>(null);
  const [viewport, setViewport] = useState<ViewportMetrics | null>(null);

  useEffect(() => {
    // Hydration guard: the first browser render must match the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Card bootstrap data intentionally exists only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialCards((current) => current ?? createInitialCloudData());
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    let viewportFrame = 0;
    const updateViewport = () => {
      const visualViewport = window.visualViewport;
      const measuredWidth = visualViewport?.width ?? window.innerWidth;
      const measuredHeight = visualViewport?.height ?? window.innerHeight;
      const width = Number.isFinite(measuredWidth) && measuredWidth > 0
        ? measuredWidth
        : document.documentElement.clientWidth;
      const height = Number.isFinite(measuredHeight) && measuredHeight > 0
        ? measuredHeight
        : document.documentElement.clientHeight;
      const left = visualViewport?.offsetLeft ?? 0;
      const top = visualViewport?.offsetTop ?? 0;
      const shell = document.getElementById("viewport-shell");
      const styles = shell ? window.getComputedStyle(shell) : null;
      const safeNumber = (value?: string) => {
        const parsed = Number.parseFloat(value || "0");
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const safeLeft = safeNumber(styles?.paddingLeft);
      const safeRight = safeNumber(styles?.paddingRight);
      const safeTop = safeNumber(styles?.paddingTop);
      const safeBottom = safeNumber(styles?.paddingBottom);
      const horizontalSafeArea = safeLeft + safeRight;
      const verticalSafeArea = safeTop + safeBottom;
      const mobile = width <= MOBILE_MAX_WIDTH;
      // visualViewport already excludes Android Chrome's browser UI. Applying
      // env(safe-area-inset-*) again here creates a second, sky-colored top gap
      // on physical Samsung devices, so mobile uses the visual viewport itself.
      const availableWidth = Math.max(1, mobile ? width : width - horizontalSafeArea);
      const availableHeight = Math.max(1, mobile ? height : height - verticalSafeArea);
      const scale = mobile
        ? Math.min(
            availableWidth / MOBILE_DESIGN_WIDTH,
            availableHeight / MOBILE_MIN_LOGICAL_HEIGHT,
          )
        : Math.min(availableWidth / DESIGN_WIDTH, availableHeight / DESIGN_HEIGHT);

      const nextViewport = {
        centerX: mobile ? availableWidth / 2 : width / 2,
        centerY: mobile ? availableHeight / 2 : height / 2,
        width,
        height,
        left,
        top,
        mobile,
        scale,
        stageHeight: mobile ? availableHeight : DESIGN_HEIGHT,
        stageWidth: mobile ? availableWidth : DESIGN_WIDTH,
      };

      document.documentElement.dataset.mobileViewport = mobile ? "true" : "false";
      document.documentElement.style.setProperty("--visual-viewport-width", `${width}px`);
      document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
      window.__REVELATION_VIEWPORT_METRICS__ = nextViewport;
      setViewport(nextViewport);
    };

    const scheduleViewportUpdate = () => {
      window.cancelAnimationFrame(viewportFrame);
      viewportFrame = window.requestAnimationFrame(updateViewport);
    };

    scheduleViewportUpdate();
    window.addEventListener("resize", scheduleViewportUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleViewportUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", scheduleViewportUpdate, { passive: true });
    window.visualViewport?.addEventListener("scroll", scheduleViewportUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(viewportFrame);
      window.removeEventListener("resize", scheduleViewportUpdate);
      window.removeEventListener("orientationchange", scheduleViewportUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleViewportUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleViewportUpdate);
      delete window.__REVELATION_VIEWPORT_METRICS__;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !initialCards || !viewport || window.__REVELATION_GAME_STARTED__) return;

    window.__REVELATION_GAME_BOOTSTRAP__ = { cards: initialCards };
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-revelation-game="true"]',
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "/game.js";
    script.async = true;
    script.dataset.revelationGame = "true";
    document.body.appendChild(script);

    return () => {
      if (!window.__REVELATION_GAME_STARTED__) script.remove();
    };
  }, [mounted, initialCards, viewport]);

  const shellStyle: CSSProperties | undefined = viewport
    ? {
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
        left: `${viewport.left}px`,
        top: `${viewport.top}px`,
        right: "auto",
        bottom: "auto",
        padding: viewport.mobile ? 0 : undefined,
      }
    : undefined;
  const stageStyle: CSSProperties | undefined = viewport
    ? viewport.mobile
      ? {
          width: `${viewport.stageWidth}px`,
          height: `${viewport.stageHeight}px`,
          left: 0,
          top: 0,
          transform: "none",
        }
      : {
        width: `${viewport.stageWidth}px`,
        height: `${viewport.stageHeight}px`,
        left: `${viewport.centerX}px`,
        top: `${viewport.centerY}px`,
        transform: `translate(-50%, -50%) scale(${viewport.scale})`,
      }
    : undefined;
  const canvasStyle: CSSProperties | undefined = viewport?.mobile
    ? (() => {
        const physicalCanvasWidth = MOBILE_DESIGN_WIDTH * viewport.scale;
        const logicalLeft = Math.max(
          0,
          (viewport.stageWidth - physicalCanvasWidth) / (2 * viewport.scale),
        );
        return {
          width: `${MOBILE_DESIGN_WIDTH}px`,
          height: `${viewport.stageHeight / viewport.scale}px`,
          left: `${logicalLeft}px`,
          top: 0,
          zoom: viewport.scale,
        };
      })()
    : undefined;

  return (
    <main
      id="viewport-shell"
      aria-label="요한계시록 1장 말씀 암송 게임"
      style={shellStyle}
    >
      <section
        id="game-stage"
        aria-live="polite"
        data-mobile-layout={viewport?.mobile ? "true" : "false"}
        style={stageStyle}
      >
        <div id="game-canvas" style={canvasStyle}>
          <img
            className="stage-layer stage-sky"
            src="/assets/images/background_sky.png"
            alt=""
            draggable="false"
          />

          <div id="lane-layer" aria-label="고정된 열한 개의 말씀 구름 카드 슬롯" />

          <img
            className="stage-layer stage-grass"
            src="/assets/images/background_grass.png"
            alt=""
            draggable="false"
          />

          <div id="angel-zone" aria-hidden="true" />
          <div id="word-hint" aria-live="polite">
            <span className="hint-label">현재 단어</span>
            <span id="hint-word" />
          </div>

          <img
            className="stage-layer stage-top-cloud"
            src="/assets/images/top_cloud.png"
            alt=""
            draggable="false"
          />

          <div id="sentence-window" aria-label="완성한 말씀">
            <div id="sentence-lines" />
          </div>

          <div id="flying-word-layer" aria-hidden="true" />
          <div id="final-layer" aria-hidden="true" />

          <button
            id="menu-button"
            className="asset-button"
            type="button"
            aria-label="메뉴 열기"
          >
            <span className="menu-icon-crop" aria-hidden="true">
              <img src="/assets/images/menu_button.png" alt="" draggable="false" />
            </span>
          </button>

          <section id="menu-overlay" aria-label="게임 메뉴" aria-hidden="true">
            <img
              className="stage-layer menu-panel-art"
              src="/assets/images/menu_panel.png"
              alt=""
              draggable="false"
            />
            <div className="menu-content">
              <h1>메뉴</h1>
              <button id="home-button" type="button">처음으로</button>
              <button id="resume-button" type="button">계속하기</button>
              <button id="music-button" className="menu-toggle" type="button">
                <span className="round-icon-crop" aria-hidden="true">
                  <img src="/assets/images/icon_music.png" alt="" draggable="false" />
                </span>
                <span id="music-label">음악 켜짐</span>
              </button>
              <button id="sound-button" className="menu-toggle" type="button">
                <span className="round-icon-crop" aria-hidden="true">
                  <img src="/assets/images/icon_sound.png" alt="" draggable="false" />
                </span>
                <span id="sound-label">효과음 켜짐</span>
              </button>
            </div>
          </section>
        </div>
      </section>
      <p id="screen-reader-status" className="sr-only" aria-live="assertive" />
    </main>
  );
}

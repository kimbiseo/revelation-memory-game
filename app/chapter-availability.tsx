"use client";

import { useEffect } from "react";

const AVAILABLE_CHAPTERS = [
  { label: "3장", url: "/chapter-03/" },
  { label: "4장", url: "/chapter-04/" },
] as const;

function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

export default function ChapterAvailability() {
  useEffect(() => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("button.chapter-button"),
    );
    const currentPath = normalizePath(window.location.pathname);

    AVAILABLE_CHAPTERS.forEach(({ label, url }) => {
      const button = buttons.find(
        (candidate) => candidate.querySelector("span")?.textContent?.trim() === label,
      );
      if (!button) return;

      button.disabled = false;
      button.classList.remove("coming-soon");
      button.classList.add("available");
      button.dataset.chapterUrl = url;

      const status = button.querySelector("small");
      if (status) {
        status.textContent = currentPath === normalizePath(url) ? "현재 장" : "플레이";
      }
    });

    const openAvailableChapter = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const button = event.target.closest<HTMLButtonElement>(
        "button.chapter-button[data-chapter-url]",
      );
      if (!button?.dataset.chapterUrl) return;

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(button.dataset.chapterUrl);
    };

    document.addEventListener("click", openAvailableChapter, true);
    return () => document.removeEventListener("click", openAvailableChapter, true);
  }, []);

  return null;
}

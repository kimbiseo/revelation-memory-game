"use client";

import { useEffect } from "react";

const CHAPTER_03_LABEL = "3장";
const CHAPTER_03_URL = "/chapter-03/";

export default function ChapterAvailability() {
  useEffect(() => {
    const chapter03Button = Array.from(
      document.querySelectorAll<HTMLButtonElement>("button.chapter-button"),
    ).find((button) => button.querySelector("span")?.textContent?.trim() === CHAPTER_03_LABEL);

    if (chapter03Button) {
      chapter03Button.disabled = false;
      chapter03Button.classList.remove("coming-soon");
      chapter03Button.classList.add("available");
      chapter03Button.dataset.chapterUrl = CHAPTER_03_URL;

      const status = chapter03Button.querySelector("small");
      if (status && window.location.pathname !== CHAPTER_03_URL) {
        status.textContent = "플레이";
      }
    }

    const openChapter03 = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const button = event.target.closest<HTMLButtonElement>(
        "button.chapter-button[data-chapter-url]",
      );
      if (!button?.dataset.chapterUrl) return;

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(button.dataset.chapterUrl);
    };

    document.addEventListener("click", openChapter03, true);
    return () => document.removeEventListener("click", openChapter03, true);
  }, []);

  return null;
}

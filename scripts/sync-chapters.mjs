import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptsDirectory, "..");
const chapter02Public = resolve(repositoryRoot, "chapter-02", "public");
const integratedChapter02Public = resolve(repositoryRoot, "public", "chapter-02");

await rm(integratedChapter02Public, { recursive: true, force: true });
await mkdir(integratedChapter02Public, { recursive: true });
await cp(chapter02Public, integratedChapter02Public, { recursive: true });

const integratedGameScript = resolve(integratedChapter02Public, "game.js");
const gameSource = await readFile(integratedGameScript, "utf8");
const namespacedGameSource = gameSource
  .replaceAll('"/assets/', '"/chapter-02/assets/')
  .replaceAll('`/assets/', '`/chapter-02/assets/');

await writeFile(integratedGameScript, namespacedGameSource, "utf8");

console.log("chapter-02 public assets synchronized for /chapter-02/");

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptsDirectory, "..");
for (const chapter of ["chapter-02", "chapter-03", "chapter-04", "chapter-05", "chapter-06", "chapter-07", "chapter-08", "chapter-09", "chapter-10"]) {
  const chapterPublic = resolve(repositoryRoot, chapter, "public");
  const integratedChapterPublic = resolve(repositoryRoot, "public", chapter);

  await rm(integratedChapterPublic, { recursive: true, force: true });
  await mkdir(integratedChapterPublic, { recursive: true });
  await cp(chapterPublic, integratedChapterPublic, { recursive: true });

  const integratedGameScript = resolve(integratedChapterPublic, "game.js");
  const gameSource = await readFile(integratedGameScript, "utf8");
  const namespacedGameSource = gameSource
    .replaceAll('"/assets/', `"/${chapter}/assets/`)
    .replaceAll('`/assets/', `\`/${chapter}/assets/`);

  await writeFile(integratedGameScript, namespacedGameSource, "utf8");
  console.log(`${chapter} public assets synchronized for /${chapter}/`);
}

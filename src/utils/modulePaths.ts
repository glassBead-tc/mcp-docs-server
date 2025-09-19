import { existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

export function moduleDirFromUrl(importMetaUrl?: string): string {
  if (importMetaUrl) {
    try {
      return dirname(fileURLToPath(importMetaUrl));
    } catch (error) {
      // If the URL can't be converted, fall back to process-based heuristics
    }
  }

  if (typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]) {
    return dirname(process.argv[1]);
  }

  return process.cwd();
}

export function moduleFileFromUrl(importMetaUrl?: string): string | undefined {
  if (importMetaUrl) {
    try {
      return fileURLToPath(importMetaUrl);
    } catch (error) {
      // Ignore conversion errors and try other strategies below
    }
  }

  if (typeof process !== "undefined" && Array.isArray(process.argv) && process.argv[1]) {
    return process.argv[1];
  }

  return undefined;
}

export function projectRootFrom(startDir: string): string {
  let currentDir = startDir;
  const visited = new Set<string>();

  while (!visited.has(currentDir)) {
    visited.add(currentDir);

    if (existsSync(join(currentDir, "scraped_docs"))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return startDir;
}

export function docsDirFrom(startDir: string): string {
  return join(projectRootFrom(startDir), "scraped_docs");
}

export function pathsAreEqual(a?: string, b?: string): boolean {
  if (!a || !b) {
    return false;
  }

  return resolve(a) === resolve(b);
}

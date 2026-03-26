import { browser } from "$app/environment";
import { expandedAreas } from "./stores/areas.js";

const STORAGE_KEY_PREFIX = "area-";

export function persistAreaState(areaName: string, isExpanded: boolean): void {
  if (!browser) return;

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${areaName}`, JSON.stringify(isExpanded));
  } catch (error) {
    console.debug("Failed to persist area state to localStorage:", error);
  }
}

export function loadAreaState(): Set<string> {
  if (!browser) return new Set();

  const expanded = new Set<string>();

  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const areaName = key.substring(STORAGE_KEY_PREFIX.length);
          const isExpanded = JSON.parse(localStorage.getItem(key) ?? "false");
          if (isExpanded) {
            expanded.add(areaName);
          }
        } catch (error) {
          console.debug(`Failed to parse localStorage key ${key}:`, error);
        }
      }
    }
  } catch (error) {
    console.debug("Failed to load area states from localStorage:", error);
  }

  return expanded;
}

// Subscribe to expandedAreas store and persist changes
export function initializeAreaPersistence(): void {
  if (!browser) return;

  const savedAreas = loadAreaState();
  expandedAreas.set(savedAreas);

  expandedAreas.subscribe((areas) => {
    // Persist all current state
    const keys = Object.keys(localStorage);
    const areaKeys = keys.filter((k) => k.startsWith(STORAGE_KEY_PREFIX));

    // Clear old area states
    for (const key of areaKeys) {
      localStorage.removeItem(key);
    }

    // Set new area states
    for (const areaName of areas) {
      persistAreaState(areaName, true);
    }
  });
}

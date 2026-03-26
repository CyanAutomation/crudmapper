import { writable } from "svelte/store";

export const expandedAreas = writable<Set<string>>(new Set());

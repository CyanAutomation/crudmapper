import { writable } from "svelte/store";
import type { LoadError, NormalizedRole } from "../types.js";

export const roles = writable<NormalizedRole[]>([]);
export const errors = writable<LoadError[]>([]);

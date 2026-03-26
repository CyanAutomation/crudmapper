import { writable } from "svelte/store";

export const selectedRoleName = writable<string | null>(null);

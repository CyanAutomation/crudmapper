import { writable } from 'svelte/store';
import type { LoadError } from '../types.js';

export const roles = writable<Record<string, unknown>[]>([]);
export const errors = writable<LoadError[]>([]);

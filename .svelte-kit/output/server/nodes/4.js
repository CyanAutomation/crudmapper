import * as server from '../entries/pages/sverdle/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/sverdle/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/sverdle/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.sDCz-Yng.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DoBzxXlY.js","_app/immutable/chunks/B_GNC3pD.js","_app/immutable/chunks/BLqsAuPA.js","_app/immutable/chunks/DBxToHlu.js","_app/immutable/chunks/BnVsT-Dk.js","_app/immutable/chunks/CipvOoOf.js","_app/immutable/chunks/C3Ldch_R.js","_app/immutable/chunks/cVKehmYO.js","_app/immutable/chunks/CKcffN4s.js","_app/immutable/chunks/DivCIhm0.js"];
export const stylesheets = ["_app/immutable/assets/4.Ccxm5Kmf.css"];
export const fonts = [];

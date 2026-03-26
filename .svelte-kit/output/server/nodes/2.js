import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.BmHYXCCR.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BXGOkhxi.js","_app/immutable/chunks/DoBzxXlY.js","_app/immutable/chunks/B_GNC3pD.js","_app/immutable/chunks/BLqsAuPA.js","_app/immutable/chunks/DBxToHlu.js","_app/immutable/chunks/CipvOoOf.js","_app/immutable/chunks/DzbnsNPj.js","_app/immutable/chunks/B_Ll_UJd.js","_app/immutable/chunks/BnVsT-Dk.js","_app/immutable/chunks/C3Ldch_R.js"];
export const stylesheets = ["_app/immutable/assets/2.BQ9elCal.css"];
export const fonts = [];

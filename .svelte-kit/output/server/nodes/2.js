import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.Ba05VqHh.js","_app/immutable/chunks/CWvqgrVH.js","_app/immutable/chunks/CoJmMsIg.js","_app/immutable/chunks/BOGaOpXs.js","_app/immutable/chunks/Cv59Cgqm.js","_app/immutable/chunks/a79il9fV.js","_app/immutable/chunks/DkFCU2hU.js","_app/immutable/chunks/B-7SBQUP.js"];
export const stylesheets = ["_app/immutable/assets/2.BQ9elCal.css"];
export const fonts = [];

import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.BOmOhNPb.js","_app/immutable/chunks/DRykis1H.js","_app/immutable/chunks/v7Wgp0sm.js","_app/immutable/chunks/C3sJ4t0D.js","_app/immutable/chunks/WDFn1l27.js","_app/immutable/chunks/BZN0GaY5.js","_app/immutable/chunks/D1E1RxIV.js","_app/immutable/chunks/oq-BowP6.js"];
export const stylesheets = ["_app/immutable/assets/2.DCgtEIPK.css"];
export const fonts = [];

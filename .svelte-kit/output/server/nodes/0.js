

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.KKtdw87F.js","_app/immutable/chunks/DRykis1H.js","_app/immutable/chunks/v7Wgp0sm.js","_app/immutable/chunks/D1E1RxIV.js"];
export const stylesheets = ["_app/immutable/assets/0.CT4HFtFM.css"];
export const fonts = [];

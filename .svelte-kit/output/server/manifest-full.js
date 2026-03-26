export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","robots.txt"]),
	mimeTypes: {".svg":"image/svg+xml",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.DZOPFlhg.js",app:"_app/immutable/entry/app.Cup50kQF.js",imports:["_app/immutable/entry/start.DZOPFlhg.js","_app/immutable/chunks/B9sTPG8a.js","_app/immutable/chunks/v7Wgp0sm.js","_app/immutable/chunks/WDFn1l27.js","_app/immutable/entry/app.Cup50kQF.js","_app/immutable/chunks/v7Wgp0sm.js","_app/immutable/chunks/oq-BowP6.js","_app/immutable/chunks/DRykis1H.js","_app/immutable/chunks/WDFn1l27.js","_app/immutable/chunks/BZN0GaY5.js","_app/immutable/chunks/D1E1RxIV.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

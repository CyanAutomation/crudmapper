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
		client: {start:"_app/immutable/entry/start.OkbQ5db5.js",app:"_app/immutable/entry/app.DGqX5BIN.js",imports:["_app/immutable/entry/start.OkbQ5db5.js","_app/immutable/chunks/cVKehmYO.js","_app/immutable/chunks/B_GNC3pD.js","_app/immutable/chunks/DoBzxXlY.js","_app/immutable/chunks/CKcffN4s.js","_app/immutable/entry/app.DGqX5BIN.js","_app/immutable/chunks/DoBzxXlY.js","_app/immutable/chunks/B_GNC3pD.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BLqsAuPA.js","_app/immutable/chunks/DBxToHlu.js","_app/immutable/chunks/B_Ll_UJd.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
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
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/sverdle",
				pattern: /^\/sverdle\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/sverdle/how-to-play",
				pattern: /^\/sverdle\/how-to-play\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
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

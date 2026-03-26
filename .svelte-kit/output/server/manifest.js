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
		client: {start:"_app/immutable/entry/start.D_tRhUoW.js",app:"_app/immutable/entry/app.ConRjUSE.js",imports:["_app/immutable/entry/start.D_tRhUoW.js","_app/immutable/chunks/B7DJ8bZo.js","_app/immutable/chunks/CoJmMsIg.js","_app/immutable/chunks/Cv59Cgqm.js","_app/immutable/entry/app.ConRjUSE.js","_app/immutable/chunks/CoJmMsIg.js","_app/immutable/chunks/B-7SBQUP.js","_app/immutable/chunks/CWvqgrVH.js","_app/immutable/chunks/Cv59Cgqm.js","_app/immutable/chunks/a79il9fV.js","_app/immutable/chunks/DkFCU2hU.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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

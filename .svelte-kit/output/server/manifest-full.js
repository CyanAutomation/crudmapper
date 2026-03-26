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
		client: {start:"_app/immutable/entry/start.BiETQTqa.js",app:"_app/immutable/entry/app.CAIm7c61.js",imports:["_app/immutable/entry/start.BiETQTqa.js","_app/immutable/chunks/D8L4ZOQN.js","_app/immutable/chunks/CoJmMsIg.js","_app/immutable/chunks/Cv59Cgqm.js","_app/immutable/entry/app.CAIm7c61.js","_app/immutable/chunks/CoJmMsIg.js","_app/immutable/chunks/B-7SBQUP.js","_app/immutable/chunks/CWvqgrVH.js","_app/immutable/chunks/Cv59Cgqm.js","_app/immutable/chunks/a79il9fV.js","_app/immutable/chunks/DkFCU2hU.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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

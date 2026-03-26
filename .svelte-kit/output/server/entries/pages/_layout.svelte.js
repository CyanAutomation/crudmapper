import "clsx";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(`<div class="app-shell svelte-12qhfyh"><div class="top-header svelte-12qhfyh"><div class="brand-shell svelte-12qhfyh"><p class="brand-eyebrow svelte-12qhfyh">CRUD Permissions</p> <h1 class="brand-title svelte-12qhfyh">Role Mapper</h1></div></div> <div class="app-content svelte-12qhfyh">`);
  children($$renderer);
  $$renderer.push(`<!----></div></div>`);
}
export {
  _layout as default
};

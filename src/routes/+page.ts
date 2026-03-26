import type { PageLoad } from "./$types.js";
import { loadAllRoles } from "$lib/dataLoader.js";

export const load: PageLoad = async () => {
  // Try to load initial config from global window object or environment
  // In SSR, this will be undefined, but client-side it can be set
  const config = typeof window !== "undefined" ? (window as any).ROLE_SOURCE_CONFIG : undefined;

  if (config) {
    const result = await loadAllRoles(config);
    return {
      initialRoles: result.roles,
      initialErrors: result.errors,
    };
  }

  return {
    initialRoles: [],
    initialErrors: [],
  };
};

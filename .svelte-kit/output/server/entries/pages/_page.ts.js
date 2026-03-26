import { l as loadAllRoles } from "../../chunks/dataLoader.js";
const load = async () => {
  const config = typeof window !== "undefined" ? window.ROLE_SOURCE_CONFIG : void 0;
  if (config) {
    const result = await loadAllRoles(config);
    return {
      initialRoles: result.roles,
      initialErrors: result.errors
    };
  }
  return {
    initialRoles: [],
    initialErrors: []
  };
};
export {
  load
};

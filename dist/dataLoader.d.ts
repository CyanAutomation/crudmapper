import type { LoadError, LoadResult, RolesByArea } from "./types.js";
export declare function extractRoles(json: unknown, file: string): {
    roles: unknown[];
} | {
    error: LoadError;
};
export declare function resolveRoleFiles(discoveryInput?: unknown): Promise<string[]>;
export declare function loadAllRoles(discoveryInput?: unknown): Promise<LoadResult>;
export declare function loadRolesFromFiles(files: File[]): Promise<LoadResult>;
export declare function groupByArea(roles: Array<Record<string, unknown>>): RolesByArea;
//# sourceMappingURL=dataLoader.d.ts.map
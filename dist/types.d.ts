/**
 * Core type definitions for crudmapper application
 */
/**
 * Represents a single permission entry
 */
export interface Permission {
    name: string;
    canonicalName: string;
    crud: string;
}
/**
 * Represents a role with its metadata and permissions
 */
export interface Role {
    Name: string;
    FriendlyName?: string;
    Area?: string;
    Rank?: number;
    Permissions: string[];
    Actions?: string[];
    Navigation?: string[];
}
/**
 * Normalized/processed role for display
 */
export interface NormalizedRole extends Role {
    FriendlyName: string;
    Area: string;
    Rank: number;
    normalizedPermissions?: Record<string, Permission>;
    permissionLabels?: Record<string, string>;
}
/**
 * Error object for tracking loading and parsing errors
 */
export interface LoadError {
    source: string;
    type: "schema_mismatch" | "source_resolution_failed" | "fetch_error" | "parse_error";
    message: string;
}
/**
 * Result of loading roles, including any errors encountered
 */
export interface LoadResult {
    roles: Record<string, unknown>[];
    errors: LoadError[];
}
/**
 * Manifest structure - can be either array of files or object with files property
 */
export type ManifestData = string[] | {
    files?: string[];
} | {
    roleFiles?: string[];
} | {
    manifestPath?: string;
};
/**
 * Grouped roles by area
 */
export interface RolesByArea {
    [area: string]: NormalizedRole[];
}
/**
 * Category mapping for permissions
 */
export type CategoryMap = {
    [category: string]: string[];
};
/**
 * Category aliases for permission categorization
 */
export type CategoryAliases = {
    [category: string]: string[];
};
//# sourceMappingURL=types.d.ts.map
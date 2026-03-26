/**
 * Core type definitions for crudmapper application
 */

/**
 * Represents a single permission entry
 */
export interface Permission {
  name: string;
  canonicalName: string;
  crud: string; // Contains any combination of "C", "R", "U", "D"
}

/**
 * Represents a role with its metadata and permissions
 */
export interface Role {
  Name: string;
  FriendlyName?: string;
  Area?: string;
  Rank?: number;
  Permissions: string[]; // Raw permission strings that need parsing
  Actions?: string[];
  Navigation?: string[];
}

/**
 * Normalized/processed role for display
 */
export interface NormalizedRole extends Role {
  FriendlyName: string; // Always present after normalization
  Area: string; // Always present after normalization
  Rank: number; // Always present after normalization
  NormalizedPermissions?: Record<string, Set<string>>;
  PermissionLabels?: Record<string, string>;
  _cachedCategories?: null | unknown;
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
  roles: NormalizedRole[];
  errors: LoadError[];
}

/**
 * Manifest structure - can be either array of files or object with files property
 */
export type ManifestData =
  | string[]
  | { files?: string[] }
  | { roleFiles?: string[] }
  | { manifestPath?: string };

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

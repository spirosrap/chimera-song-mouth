/** Site base path with a trailing slash ("/" at an origin root, "/folder/" when hosted in a subfolder). */
export const BASE_PATH: string = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";

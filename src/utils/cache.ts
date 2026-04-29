import NodeCache from "node-cache";

export const projectCache = new NodeCache()

export function clearAllCache() {
  projectCache.flushAll()
}

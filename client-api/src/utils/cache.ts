import NodeCache from "node-cache";

export const cache = new NodeCache({
  stdTTL: 6000, // cache for 60 seconds
});

export function clearProductCache() {
  cache.flushAll();
}
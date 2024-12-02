import NodeCache from 'node-cache';

class CacheManager {
  cache;
  constructor(ttlSeconds:number) {
    // Initialize NodeCache with a default TTL
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2 });
  }

  // Set a key-value pair with an optional TTL
  set(key:string, value:any, ttl:number) {
    return this.cache.set(key, value, ttl);
  }

  // Get the value for a given key
  get(key:string):any {
    return this.cache.get(key);
  }

  // Check if a key exists in the cache
  has(key:string) {
    return this.cache.has(key);
  }

  // Delete a key from the cache
  delete(key:string) {
    return this.cache.del(key);
  }

  // Flush all cached data
  clear() {
    return this.cache.flushAll();
  }

  // Get statistics of the cache
  stats() {
    return this.cache.getStats();
  }
}

export default CacheManager;

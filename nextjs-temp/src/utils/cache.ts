import { AnalysisResult } from '@/types/api';

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export class Cache {
    private static instance: Cache;
    private storage: Map<string, CacheItem<unknown>>;
    private readonly TTL: number = 1000 * 60 * 60; // 1 hour

    private constructor() {
        this.storage = new Map();
    }

    static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    set<T>(key: string, value: T): void {
        this.storage.set(key, {
            data: value,
            timestamp: Date.now(),
        });
    }

    get<T>(key: string): T | null {
        const item = this.storage.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.TTL) {
            this.storage.delete(key);
            return null;
        }

        return item.data as T;
    }

    delete(key: string): void {
        this.storage.delete(key);
    }

    clear(): void {
        this.storage.clear();
    }
}

// Use a Map with proper typing instead of an object literal with 'any'
const analysisCache = new Map<string, AnalysisResult>();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds
const cacheTimestamps = new Map<string, number>();

export function getCachedAnalysis(id: string): AnalysisResult | null {
    const cached = analysisCache.get(id);
    const timestamp = cacheTimestamps.get(id) || 0;

    // Check if cache exists and is still valid
    if (cached && (Date.now() - timestamp) < CACHE_EXPIRY) {
        return cached;
    }

    // Expired or not found
    if (cached) {
        analysisCache.delete(id);
        cacheTimestamps.delete(id);
    }

    return null;
}

export function cacheAnalysisResult(id: string, result: AnalysisResult): void {
    analysisCache.set(id, result);
    cacheTimestamps.set(id, Date.now());
}

export function clearCache(): void {
    analysisCache.clear();
    cacheTimestamps.clear();
}

export function generateCacheKey(files: File[]): string {
    return files
        .map(file => `${file.name}:${file.size}:${file.lastModified}`)
        .sort()
        .join('|');
}
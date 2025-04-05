import { AnalysisResult } from '@/types/api';

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export class Cache {
    private static instance: Cache;
    private storage: Map<string, CacheItem<any>>;
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

// Analysis-specific cache functions
export function cacheAnalysisResult(id: string, result: AnalysisResult): void {
    const cache = Cache.getInstance();
    cache.set(`analysis:${id}`, result);
}

export function getCachedAnalysis(id: string): AnalysisResult | null {
    const cache = Cache.getInstance();
    return cache.get(`analysis:${id}`);
}

export function generateCacheKey(files: File[]): string {
    return files
        .map(file => `${file.name}:${file.size}:${file.lastModified}`)
        .sort()
        .join('|');
}
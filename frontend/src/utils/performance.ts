export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(name: string) {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => this.endTimer(name));
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      return fn();
    } finally {
      this.endTimer(name);
    }
  }

  static getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  static logPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = this.getMemoryUsage();

    console.group('🚀 Performance Metrics');
    console.log(`📄 Page Load: ${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`);
    console.log(`🎨 DOM Ready: ${Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)}ms`);
    console.log(`🔗 DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`);
    console.log(`📡 Network: ${Math.round(navigation.responseEnd - navigation.requestStart)}ms`);
    
    if (memory) {
      console.log(`🧠 Memory: ${memory.used}MB / ${memory.total}MB (${memory.limit}MB limit)`);
    }
    
    console.groupEnd();
  }
}

// Auto-log performance metrics in development
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => PerformanceMonitor.logPerformanceMetrics(), 1000);
  });
}
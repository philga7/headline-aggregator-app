import { performance, PerformanceObserver, PerformanceEntry } from 'perf_hooks';

interface PerformanceMonitor {
  start: (label: string) => void;
  end: (label: string) => void;
  observe: () => PerformanceObserver;
}

const performanceMonitor: PerformanceMonitor = {
  start: (label: string): void => {
    performance.mark(`${label}-start`);
  },

  end: (label: string): void => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
  },

  observe: (): PerformanceObserver => {
    const obs = new PerformanceObserver((list: PerformanceObserverEntryList) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration}ms`);
      });
    });
    obs.observe({ entryTypes: ['measure'] });
    return obs;
  }
};

export default performanceMonitor;

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

function logMetric(metric: Metric) {
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    const { name, value, rating, delta, id } = metric;
    console.log(
      `[Web Vitals] ${name}: ${value.toFixed(2)}ms (${rating}) - delta: ${delta.toFixed(2)}ms - id: ${id}`
    );
  }
}

export function reportWebVitals() {
  onCLS(logMetric);
  onINP(logMetric);
  onFCP(logMetric);
  onLCP(logMetric);
  onTTFB(logMetric);
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class Analytics {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.PROD && !import.meta.env.VITE_DISABLE_ANALYTICS;
  }

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', event);
      return;
    }

    // Track analysis events
    this.trackToConsole(event);
    
    // TODO: Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
    // Example:
    // gtag('event', event.action, {
    //   event_category: event.category,
    //   event_label: event.label,
    //   value: event.value
    // });
  }

  private trackToConsole(event: AnalyticsEvent) {
    console.log(`[Analytics] ${event.category}:${event.action}`, {
      label: event.label,
      value: event.value,
      timestamp: new Date().toISOString()
    });
  }

  // Predefined events for common actions
  trackAnalysis(language: string, codeLength: number, qualityScore?: number) {
    this.track({
      action: 'code_analyzed',
      category: 'analysis',
      label: language,
      value: codeLength
    });

    if (qualityScore !== undefined) {
      this.track({
        action: 'quality_score',
        category: 'analysis',
        label: language,
        value: Math.round(qualityScore)
      });
    }
  }

  trackError(error: string, context?: string) {
    this.track({
      action: 'error_occurred',
      category: 'error',
      label: context || 'unknown',
      value: 1
    });
  }

  trackUserAction(action: string, details?: string) {
    this.track({
      action,
      category: 'user_interaction',
      label: details
    });
  }

  trackPerformance(metric: string, value: number) {
    this.track({
      action: 'performance_metric',
      category: 'performance',
      label: metric,
      value: Math.round(value)
    });
  }
}

export const analytics = new Analytics();


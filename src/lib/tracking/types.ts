export interface PageviewEvent {
  type: "pageview";
  path: string;
  title?: string;
  timestamp: number;
}

export interface GenericEvent {
  type: "event";
  name: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface ScrollEventPayload {
  type: "scroll";
  path: string;
  depth: number;
  timeToReach: number;
  timestamp: number;
}

export interface CtaEventPayload {
  type: "cta";
  ctaId: string;
  action: "viewed" | "hovered" | "clicked";
  timeBeforeClick?: number;
  timestamp: number;
}

export interface FormEventPayload {
  type: "form";
  formId: string;
  action: "viewed" | "started" | "field_focus" | "field_complete" | "validation_error" | "abandoned" | "submitted";
  fieldName?: string;
  errorMessage?: string;
  timestamp: number;
}

export interface PerformanceEventPayload {
  type: "performance";
  path: string;
  metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

export interface ErrorEventPayload {
  type: "error";
  errorType: "js" | "unhandled_rejection" | "image_load";
  message: string;
  stack?: string;
  path?: string;
  timestamp: number;
}

export interface MouseEventPayload {
  type: "mouse";
  path: string;
  mouseType: "rage_click" | "dead_click" | "double_click";
  x: number;
  y: number;
  targetSelector?: string;
  timestamp: number;
}

export interface HeatmapEventPayload {
  type: "heatmap";
  path: string;
  heatmapType: "click" | "hover";
  xPct: number;
  yPct: number;
  viewportWidth: number;
  timestamp: number;
}

export type TrackedEvent =
  | PageviewEvent
  | GenericEvent
  | ScrollEventPayload
  | CtaEventPayload
  | FormEventPayload
  | PerformanceEventPayload
  | ErrorEventPayload
  | MouseEventPayload
  | HeatmapEventPayload;

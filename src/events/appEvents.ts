import { EventEmitter } from "events";

class AppEvents {
  private static instance?: EventEmitter;

  public static getInstance(): EventEmitter {
    if (!AppEvents.instance) {
      AppEvents.instance = new EventEmitter();
      // Optional: prevent memory leak warning in development
      AppEvents.instance.setMaxListeners(30);
    }
    return AppEvents.instance;
  }
}

export const appEventEmitter = AppEvents.getInstance();

// Optional: Type helper for events
export type AppEventsMap = {
  "order.created": { orderId: string; userId: string };
  "order.status.changed": { orderId: string; newStatus: string };
  // add more events here
};

"use client";

import { useEffect } from "react";

export function AnalyticsTracker() {
  useEffect(() => {
    // Generate or get unique anonymous visitor ID
    let visitorId = localStorage.getItem("chatbot_im_vid");
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now().toString(36);
      localStorage.setItem("chatbot_im_vid", visitorId);
    }

    const trackVisit = async () => {
      try {
        const lastTrack = sessionStorage.getItem("chatbot_im_tracked");
        // Avoid multi-tracking on simple re-renders in the same session tab
        if (!lastTrack) {
          sessionStorage.setItem("chatbot_im_tracked", Date.now().toString());
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              visitor_id: visitorId,
              path: window.location.pathname,
            }),
          });
        }
      } catch (e) {
        // Silent fail for tracking
      }
    };

    trackVisit();
  }, []);

  return null;
}

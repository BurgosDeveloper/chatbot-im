"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface InactivityTrackerProps {
  timeoutMinutes?: number;
  onTimeout?: () => void;
}

export const InactivityTracker: React.FC<InactivityTrackerProps> = ({
  timeoutMinutes = 15,
  onTimeout,
}) => {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error on inactivity:", e);
    }
    if (onTimeout) {
      onTimeout();
    } else {
      router.push("/admin/login?expired=true");
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMinutes]);

  return null;
};

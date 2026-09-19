"use client";

import { useEffect } from "react";

export function PrintAction() {
  useEffect(() => {
    // Small delay to ensure images/fonts load before print dialog opens
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  return null;
}

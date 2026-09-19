"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the actual technical error to the console
    console.error("Dashboard Route Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 rounded-xl border border-dashed mt-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-destructive">Unable to load this data.</h2>
        <p className="text-muted-foreground max-w-[500px]">
          We encountered an issue while communicating with the database or processing the information.
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline">
        Retry
      </Button>
    </div>
  );
}

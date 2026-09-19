"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { swapQuestion } from "../actions";
import { RefreshCw } from "lucide-react";

export function SwapButton({ paperId, sectionId, questionId }: { paperId: string, sectionId: string, questionId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSwap = async () => {
    setLoading(true);
    const res = await swapQuestion(paperId, sectionId, questionId);
    setLoading(false);
    
    if (res.success) {
      toast({ title: "Question Swapped", description: "Successfully replaced with a new random question." });
    } else {
      toast({ title: "Swap Failed", description: res.error || "No alternative questions available.", variant: "destructive" });
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleSwap} disabled={loading} className="h-8 px-2 text-muted-foreground hover:text-indigo-600 no-print" title="Swap for another question">
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
    </Button>
  );
}

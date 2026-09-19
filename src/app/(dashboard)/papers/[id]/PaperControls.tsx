"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { finalizePaper } from "../actions";
import { Lock } from "lucide-react";

export function PaperControls({ paperId, status }: { paperId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFinalize = async () => {
    if (!confirm("Are you sure you want to finalize this paper? This action cannot be undone and will lock the paper from future edits.")) return;
    
    setLoading(true);
    const res = await finalizePaper(paperId);
    setLoading(false);
    
    if (res.success) {
      toast({ title: "Paper Locked", description: "This paper is now finalized and cannot be edited." });
    } else {
      toast({ title: "Error", description: res.error || "Failed to finalize paper", variant: "destructive" });
    }
  };

  if (status === "Finalized") {
    return (
      <Button variant="secondary" disabled className="opacity-100 bg-emerald-50 text-emerald-700 border-emerald-200">
        <Lock className="w-4 h-4 mr-2" />
        Finalized
      </Button>
    );
  }

  return (
    <Button variant="destructive" onClick={handleFinalize} disabled={loading}>
      {loading ? "Locking..." : "Finalize & Lock"}
    </Button>
  );
}

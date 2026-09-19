"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Blueprint, PaperTemplate } from "@/types/paper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { generatePaper } from "./actions";

export function GeneratePaperForm({ blueprints, templates }: { blueprints: Blueprint[], templates: PaperTemplate[] }) {
  const [blueprintId, setBlueprintId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blueprintId || !templateId) {
      toast({ title: "Error", description: "Please select both a Blueprint and a Template.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await generatePaper(blueprintId, templateId);
      if (res.success && res.id) {
        toast({ title: "Success", description: "Paper generated successfully!" });
        router.push(`/paper-history/${res.id}`);
      } else {
        throw new Error(res.error || "Generation failed");
      }
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-lg">1. Select Blueprint</Label>
        {blueprints.length === 0 ? (
          <p className="text-sm text-red-500">No blueprints available. Please create one first.</p>
        ) : (
          <div className="grid gap-3">
            {blueprints.map(bp => (
              <div 
                key={bp.id} 
                onClick={() => setBlueprintId(bp.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${blueprintId === bp.id ? 'border-indigo-600 bg-indigo-50/10' : 'hover:border-slate-400'}`}
              >
                <div className="font-bold text-lg">{bp.name}</div>
                <div className="text-sm text-muted-foreground">{bp.subjectCode} • {bp.totalMarks} Marks • {bp.sections.length} Sections</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-lg">2. Select Template</Label>
        {templates.length === 0 ? (
          <p className="text-sm text-red-500">No templates available. Please create one first.</p>
        ) : (
          <div className="grid gap-3">
            {templates.map(tpl => (
              <div 
                key={tpl.id} 
                onClick={() => setTemplateId(tpl.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${templateId === tpl.id ? 'border-indigo-600 bg-indigo-50/10' : 'hover:border-slate-400'}`}
              >
                <div className="font-bold text-lg">{tpl.name}</div>
                <div className="text-sm text-muted-foreground">{tpl.universityName} • {tpl.examDuration}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={loading || !blueprintId || !templateId}>
        {loading ? "Generating..." : "Generate Paper"}
      </Button>
    </form>
  );
}

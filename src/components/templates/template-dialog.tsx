"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { PaperTemplate } from "@/types/paper";
import { createTemplate, updateTemplate } from "@/app/(dashboard)/templates/actions";

export function TemplateDialog({ template, children }: { template?: PaperTemplate; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState(template?.name || "");
  const [universityName, setUniversityName] = useState(template?.universityName || "");
  const [universityLogoUrl, setUniversityLogoUrl] = useState(template?.universityLogoUrl || "");
  const [examName, setExamName] = useState(template?.examName || "");
  const [examDuration, setExamDuration] = useState(template?.examDuration || "3 Hours");
  
  const [instructions, setInstructions] = useState<string[]>(
    template?.instructions || ["Answer all questions.", "Draw diagrams wherever necessary."]
  );

  const handleAddInstruction = () => setInstructions([...instructions, ""]);
  
  const updateInstruction = (index: number, value: string) => {
    const newInst = [...instructions];
    newInst[index] = value;
    setInstructions(newInst);
  };
  
  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        universityName,
        universityLogoUrl,
        examName,
        examDuration,
        instructions: instructions.filter(i => i.trim() !== ""),
      };

      if (template) {
        const res = await updateTemplate(template.id, payload);
        if (res.success) {
          toast({ title: "Success", description: "Template updated successfully." });
          setOpen(false);
        } else {
          throw new Error(res.error);
        }
      } else {
        const res = await createTemplate(payload);
        if (res.success) {
          toast({ title: "Success", description: "Template created successfully." });
          setOpen(false);
        } else {
          throw new Error(res.error);
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild render={children} />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Template Name (Internal Use)</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VTU Standard Layout" />
          </div>

          <div className="space-y-2">
            <Label>University / Institution Name</Label>
            <Input required value={universityName} onChange={e => setUniversityName(e.target.value)} placeholder="e.g. Visvesvaraya Technological University" />
          </div>

          <div className="space-y-2">
            <Label>University Logo URL (Optional)</Label>
            <Input value={universityLogoUrl} onChange={e => setUniversityLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exam Name</Label>
              <Input required value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. B.E. Degree Examination, Dec 2026" />
            </div>
            <div className="space-y-2">
              <Label>Exam Duration</Label>
              <Input required value={examDuration} onChange={e => setExamDuration(e.target.value)} placeholder="e.g. 3 Hours" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">General Instructions</Label>
            {instructions.map((inst, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-sm text-slate-500 w-4">{idx + 1}.</span>
                <Input value={inst} onChange={e => updateInstruction(idx, e.target.value)} />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeInstruction(idx)}>X</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddInstruction}>+ Add Instruction</Button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

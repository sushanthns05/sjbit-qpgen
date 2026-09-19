"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Blueprint, BlueprintSection } from "@/types/paper";
import { createBlueprint, updateBlueprint } from "@/app/(dashboard)/blueprints/actions";

export function BlueprintDialog({ blueprint, children }: { blueprint?: Blueprint; children: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState(blueprint?.name || "");
  const [subjectCode, setSubjectCode] = useState(blueprint?.subjectCode || "");
  const [totalMarks, setTotalMarks] = useState(blueprint?.totalMarks || 100);

  const [difficulty, setDifficulty] = useState(
    blueprint?.difficultyDistribution || { Easy: 30, Medium: 50, Hard: 20 }
  );

  const [cognitive, setCognitive] = useState(
    blueprint?.cognitiveLevelDistribution || {
      Knowledge: 20,
      Comprehension: 20,
      Application: 20,
      Analysis: 20,
      Synthesis: 10,
      Evaluation: 10,
    }
  );

  const [sections, setSections] = useState<BlueprintSection[]>(
    blueprint?.sections || [
      { id: Date.now().toString(), name: "Section A", questionType: "MCQ", numberOfQuestions: 10, marksPerQuestion: 1 },
    ]
  );

  const handleAddSection = () => {
    setSections([...sections, { id: Date.now().toString(), name: "New Section", questionType: "Descriptive", numberOfQuestions: 5, marksPerQuestion: 5 }]);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: keyof BlueprintSection, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        subjectCode,
        totalMarks: Number(totalMarks),
        sections,
        difficultyDistribution: difficulty,
        cognitiveLevelDistribution: cognitive,
      };

      if (blueprint) {
        const res = await updateBlueprint(blueprint.id, payload);
        if (res.success) {
          toast({ title: "Success", description: "Blueprint updated successfully." });
          setOpen(false);
        } else {
          throw new Error(res.error);
        }
      } else {
        const res = await createBlueprint(payload);
        if (res.success) {
          toast({ title: "Success", description: "Blueprint created successfully." });
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
      <DialogTrigger render={children} />
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blueprint ? "Edit Blueprint" : "Create Blueprint"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Blueprint Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Midterm 2026" />
            </div>
            <div className="space-y-2">
              <Label>Subject Code</Label>
              <Input required value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="e.g. CS101" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Total Marks</Label>
            <Input required type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Sections</Label>
            {sections.map((section, idx) => (
              <div key={section.id} className="p-4 border rounded-md space-y-4 relative">
                <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => handleRemoveSection(section.id)}>Remove</Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Section Name</Label>
                    <Input value={section.name} onChange={e => updateSection(section.id, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Question Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={section.questionType} 
                      onChange={e => updateSection(section.id, 'questionType', e.target.value)}>
                      <option value="MCQ">MCQ</option>
                      <option value="Descriptive">Descriptive</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Number of Questions</Label>
                    <Input type="number" value={section.numberOfQuestions} onChange={e => updateSection(section.id, 'numberOfQuestions', Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Marks per Question</Label>
                    <Input type="number" value={section.marksPerQuestion} onChange={e => updateSection(section.id, 'marksPerQuestion', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddSection}>+ Add Section</Button>
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Difficulty Distribution (%)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Easy</Label>
                <Input type="number" value={difficulty.Easy} onChange={e => setDifficulty({...difficulty, Easy: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <Label>Medium</Label>
                <Input type="number" value={difficulty.Medium} onChange={e => setDifficulty({...difficulty, Medium: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <Label>Hard</Label>
                <Input type="number" value={difficulty.Hard} onChange={e => setDifficulty({...difficulty, Hard: Number(e.target.value)})} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Cognitive Level Distribution (%)</Label>
            <div className="grid grid-cols-3 gap-4">
              {Object.keys(cognitive).map(level => (
                <div key={level} className="space-y-1">
                  <Label>{level}</Label>
                  <Input type="number" value={(cognitive as any)[level]} onChange={e => setCognitive({...cognitive, [level]: Number(e.target.value)})} />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Blueprint"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

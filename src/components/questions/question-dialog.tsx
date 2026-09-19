"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createQuestionAI } from "@/app/(dashboard)/questions/actions";
import { Bot, Sparkles, Loader2 } from "lucide-react";

interface QuestionDialogProps {
  onQuestionGenerated: () => void;
}

export function QuestionDialog({ onQuestionGenerated }: QuestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [cognitiveLevel, setCognitiveLevel] = useState<any>("Application");
  const [type, setType] = useState<"MCQ" | "Descriptive">("Descriptive");

  const handleGenerate = async () => {
    if (!subject || !topic) {
      alert("Please enter subject and topic.");
      return;
    }

    setIsGenerating(true);
    const res = await createQuestionAI({
      subject,
      topic,
      difficulty,
      cognitiveLevel,
      type
    });
    
    setIsGenerating(false);

    if (res.success) {
      setIsOpen(false);
      onQuestionGenerated();
    } else {
      alert(res.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button className="flex items-center gap-2" />}>
        <Sparkles className="h-4 w-4" /> Generate Question
      </DialogTrigger>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            AI Question Generator
          </DialogTitle>
          <DialogDescription>
            Provide the context and parameters, and our AI will generate a high-quality question.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input placeholder="e.g., Data Structures" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Topic</Label>
              <Input placeholder="e.g., Binary Search Trees" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={type} 
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="Descriptive">Descriptive</option>
                <option value="MCQ">MCQ</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Bloom's Level</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={cognitiveLevel} 
                onChange={(e) => setCognitiveLevel(e.target.value)}
              >
                <option value="Knowledge">Knowledge</option>
                <option value="Comprehension">Comprehension</option>
                <option value="Application">Application</option>
                <option value="Analysis">Analysis</option>
                <option value="Synthesis">Synthesis</option>
                <option value="Evaluation">Evaluation</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !subject || !topic}>
            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

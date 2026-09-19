"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updateQuestionContent, updateQuestionStatus } from "@/app/(dashboard)/questions/actions";
import { Bot, Save, CheckCircle, Clock } from "lucide-react";

interface EditQuestionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  question: any;
  onUpdated: () => void;
}

export function EditQuestionDialog({ isOpen, setIsOpen, question, onUpdated }: EditQuestionDialogProps) {
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setText(question.text || "");
      setExplanation(question.explanation || "");
    }
  }, [question]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateQuestionContent(question.id, text, question.options, explanation);
    setIsSaving(false);
    
    if (res.success) {
      onUpdated();
      setIsOpen(false);
    } else {
      alert(res.message);
    }
  };

  const handleStatusUpdate = async (status: "Draft" | "Review" | "Approved") => {
    setIsSaving(true);
    const res = await updateQuestionStatus(question.id, status);
    setIsSaving(false);
    
    if (res.success) {
      onUpdated();
      setIsOpen(false);
    } else {
      alert(res.message);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Edit Question
            </span>
            <span className={`px-2 py-1 text-xs border rounded-full font-medium ${
              question.status === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
              question.status === "Review" ? "bg-amber-100 text-amber-700 border-amber-200" :
              "bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}>
              {question.status}
            </span>
          </DialogTitle>
          <DialogDescription>
            {question.subject} - {question.topic} | {question.difficulty} | {question.cognitiveLevel}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Question Text</Label>
            <RichTextEditor value={text} onChange={setText} disabled={isSaving} />
          </div>
          
          {question.type === "MCQ" && question.options && (
            <div className="grid gap-2">
              <Label>Options</Label>
              <div className="grid gap-2">
                {question.options.map((opt: any, index: number) => (
                  <div key={opt.id || index} className={`p-2 border rounded-md text-sm flex gap-2 items-center ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <span className="font-medium bg-zinc-100 text-zinc-500 px-2 py-1 rounded">
                      {opt.id?.toUpperCase() || String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {opt.isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Options editing will be supported in future versions.</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Explanation / Rubric</Label>
            <RichTextEditor value={explanation} onChange={setExplanation} disabled={isSaving} />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <div className="flex gap-2">
            {question.status === "Draft" && (
              <Button variant="outline" onClick={() => handleStatusUpdate("Review")} disabled={isSaving} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                <Clock className="h-4 w-4 mr-2" /> Send to Review
              </Button>
            )}
            {question.status === "Review" && (
              <Button variant="outline" onClick={() => handleStatusUpdate("Approved")} disabled={isSaving} className="text-green-600 border-green-200 hover:bg-green-50">
                <CheckCircle className="h-4 w-4 mr-2" /> Approve Question
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

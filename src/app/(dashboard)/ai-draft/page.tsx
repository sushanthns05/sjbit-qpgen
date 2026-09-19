"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export default function AIDraftPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("gemini");
  
  const [syllabusText, setSyllabusText] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  
  const [difficulty, setDifficulty] = useState("Medium");
  const [cognitiveLevel, setCognitiveLevel] = useState("Application");
  const [questionType, setQuestionType] = useState("Descriptive");
  const [count, setCount] = useState("1");
  
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  
  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({ title: "Warning", description: "API Key not provided. Server will attempt to use ENV vars." });
      return;
    }
    toast({ title: "Configured", description: "API Key set for this session." });
  };

  const handleSyllabusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSyllabusText(event.target?.result as string);
        toast({ title: "Success", description: "Syllabus loaded successfully" });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!subject || !topic) {
      toast({ title: "Error", description: "Subject and Topic are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          count: parseInt(count, 10),
          subject,
          topic,
          difficulty,
          cognitiveLevel,
          type: questionType,
          context: syllabusText.substring(0, 5000), // send max 5000 chars of syllabus context
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedQuestions(data.questions);
        toast({ title: "Success", description: `Generated ${data.questions.length} questions.` });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate questions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Question Generator</h2>
        <p className="text-muted-foreground">Configure AI provider and extract questions directly from the syllabus.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. AI Provider Configuration</CardTitle>
            <CardDescription>Select and configure your AI model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(val) => val && setProvider(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini 2.5 Flash (Default)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>API Key (Optional if configured on Server)</Label>
              <Input 
                type="password" 
                placeholder="*************" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <Button onClick={handleTestConnection} variant="secondary">Save API Key</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Syllabus Context</CardTitle>
            <CardDescription>Upload course syllabus to guide generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input 
                placeholder="e.g. Data Structures" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Upload Syllabus Extract (.txt)</Label>
              <Input type="file" accept=".txt" onChange={handleSyllabusUpload} />
            </div>
            
            {syllabusText && (
              <div className="text-xs text-emerald-600 font-bold border border-emerald-200 bg-emerald-50 p-2 rounded">
                Syllabus loaded ({syllabusText.length} characters)
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>3. Question Generation Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Specific Topic</Label>
              <Input 
                placeholder="e.g. Binary Search Trees" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(val) => val && setDifficulty(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Cognitive Level (Bloom's)</Label>
              <Select value={cognitiveLevel} onValueChange={(val) => val && setCognitiveLevel(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Knowledge">Knowledge</SelectItem>
                  <SelectItem value="Comprehension">Comprehension</SelectItem>
                  <SelectItem value="Application">Application</SelectItem>
                  <SelectItem value="Analysis">Analysis</SelectItem>
                  <SelectItem value="Synthesis">Synthesis</SelectItem>
                  <SelectItem value="Evaluation">Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={(val) => val && setQuestionType(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="Descriptive">Descriptive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Number of Questions to Generate</Label>
              <Select value={count} onValueChange={(val) => val && setCount(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate AI Questions"}
          </Button>
        </CardContent>
      </Card>
      
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>Review and edit before saving to Question Bank.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedQuestions.map((q, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-slate-50 relative">
                <div className="font-bold mb-2">Question {idx + 1} ({difficulty} - {cognitiveLevel})</div>
                <div dangerouslySetInnerHTML={{ __html: q.text }} className="mb-4 bg-white p-3 border rounded" />
                
                {q.options && (
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Options:</div>
                    <ul className="list-disc pl-5">
                      {q.options.map((o: any) => (
                        <li key={o.id} className={o.isCorrect ? "text-green-700 font-bold" : ""}>
                          {o.text} {o.isCorrect && "(Correct)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded border border-blue-100">
                  <span className="font-bold">Explanation: </span> {q.explanation}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">Save to Question Bank (Placeholder)</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

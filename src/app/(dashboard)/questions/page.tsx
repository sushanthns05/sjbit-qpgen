"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Edit, FileText } from "lucide-react";
import { getQuestions } from "./actions";
import { QuestionDialog } from "@/components/questions/question-dialog";
import { EditQuestionDialog } from "@/components/questions/edit-question-dialog";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    const res = await getQuestions();
    if (res.success && res.data) {
      setQuestions(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEditClick = (question: any) => {
    setSelectedQuestion(question);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700 border-green-200";
      case "Review": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Question Bank</h1>
          <p className="text-zinc-500">Manage and generate examination questions.</p>
        </div>

        <QuestionDialog onQuestionGenerated={fetchQuestions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>Generated and approved questions for your courses.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search questions by subject or topic..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-75">Subject & Topic</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Bloom's</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    Loading questions...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8 flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-zinc-300 mb-2" />
                    <p>No questions found in the bank.</p>
                    <p className="text-sm">Click "Generate Question" to use AI to create one.</p>
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <div className="font-medium text-zinc-900">{q.subject}</div>
                      <div className="text-xs text-zinc-500">{q.topic}</div>
                    </TableCell>
                    <TableCell>{q.type}</TableCell>
                    <TableCell>{q.difficulty}</TableCell>
                    <TableCell>{q.cognitiveLevel}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs border rounded-full font-medium ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleEditClick(q)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedQuestion && (
        <EditQuestionDialog 
          isOpen={isEditDialogOpen} 
          setIsOpen={setIsEditDialogOpen} 
          question={selectedQuestion} 
          onUpdated={fetchQuestions} 
        />
      )}
    </div>
  );
}

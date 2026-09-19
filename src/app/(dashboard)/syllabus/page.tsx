"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Search, Plus } from "lucide-react";
import { uploadAndParseSyllabus, getSyllabi } from "./actions";

export default function SyllabusPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const fetchSyllabi = async () => {
    const res = await getSyllabi();
    if (res.success && res.data) {
      setSyllabi(res.data);
    }
  };

  const handleUpload = async () => {
    if (!file || !subjectCode || !subjectName) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectCode", subjectCode);
    formData.append("subjectName", subjectName);

    const res = await uploadAndParseSyllabus(formData);
    
    setIsUploading(false);
    if (res.success) {
      setIsOpen(false);
      setSubjectCode("");
      setSubjectName("");
      setFile(null);
      fetchSyllabi();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Syllabus Management</h1>
          <p className="text-zinc-500">Upload and manage course syllabi for question generation.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Syllabus
            </Button>
          } />
          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>Upload New Syllabus</DialogTitle>
              <DialogDescription>
                Upload a PDF of the syllabus or enter the details manually.
                Our AI will automatically extract modules, topics, and course outcomes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input id="subjectCode" placeholder="e.g., 21CS51" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input id="subjectName" placeholder="e.g., Software Engineering" value={subjectName} onChange={e => setSubjectName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Syllabus Document (PDF)</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${file ? 'bg-blue-50 border-blue-300' : 'bg-zinc-50 border-zinc-300 hover:bg-zinc-100'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className={`w-8 h-8 mb-2 ${file ? 'text-blue-500' : 'text-zinc-500'}`} />
                      <p className="mb-2 text-sm text-zinc-500">
                        {file ? <span className="font-semibold">{file.name}</span> : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                      </p>
                      <p className="text-xs text-zinc-500">PDF (MAX. 10MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={e => e.target.files && setFile(e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={isUploading || !file || !subjectCode || !subjectName}>
                {isUploading ? "Uploading & Parsing..." : "Upload & Parse"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Syllabi</CardTitle>
          <CardDescription>All uploaded and processed syllabi.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search syllabi..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syllabi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                    No syllabi found. Upload one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                syllabi.map((syllabus) => (
                  <TableRow key={syllabus.id}>
                    <TableCell className="font-medium">{syllabus.subjectCode}</TableCell>
                    <TableCell>{syllabus.subjectName}</TableCell>
                    <TableCell>{syllabus.department}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        syllabus.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {syllabus.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-zinc-500 text-sm">
                      {new Date(syllabus.uploadedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

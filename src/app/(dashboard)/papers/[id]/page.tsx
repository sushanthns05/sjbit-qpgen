import { adminDb } from "@/lib/firebase-admin";
import { GeneratedPaper, PaperTemplate, Blueprint } from "@/types/paper";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaperControls } from "./PaperControls";
import { SwapButton } from "./SwapButton";

export const dynamic = "force-dynamic";

export default async function PaperPage({ params }: { params: { id: string } }) {
  // 1. Fetch Paper
  const paperDoc = await adminDb.collection("papers").doc(params.id).get();
  if (!paperDoc.exists) notFound();
  const paper = { id: paperDoc.id, ...paperDoc.data() } as GeneratedPaper;

  // 2. Fetch Template
  const tplDoc = await adminDb.collection("templates").doc(paper.templateId).get();
  const template = tplDoc.exists ? (tplDoc.data() as PaperTemplate) : null;
  
  // 3. Fetch Blueprint for comparative analysis
  const bpDoc = await adminDb.collection("blueprints").doc(paper.blueprintId).get();
  const blueprint = bpDoc.exists ? (bpDoc.data() as Blueprint) : null;

  const isFinalized = paper.status === "Finalized";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Paper Preview */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Paper Preview</h2>
            {isFinalized && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded uppercase">
                Finalized
              </span>
            )}
          </div>
          <div className="space-x-2 flex items-center">
            <PaperControls paperId={paper.id} status={paper.status} />
            <Link href={`/papers/${paper.id}/print`} target="_blank">
              <Button variant="outline">Export PDF</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white text-black p-8 rounded-xl shadow-sm border min-h-264 font-serif">
          {/* Header Template */}
          {template && (
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold uppercase">{template.universityName}</h1>
              <h2 className="text-xl font-semibold mt-2">{template.examName}</h2>
              <div className="flex justify-between mt-4 font-bold text-sm">
                <span>Duration: {template.examDuration}</span>
                <span>Subject: {paper.subjectCode}</span>
                <span>Total Marks: {blueprint?.totalMarks || "N/A"}</span>
              </div>
              {template.instructions && template.instructions.length > 0 && (
                <div className="mt-4 text-left text-sm italic">
                  <strong>Instructions:</strong>
                  <ul className="list-decimal pl-5 mt-1">
                    {template.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Paper Content */}
          <div className="space-y-8">
            {paper.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-center font-bold text-lg underline">
                  {section.name}
                </div>
                {section.description && (
                  <p className="text-sm text-center italic">{section.description}</p>
                )}
                
                <div className="space-y-6 mt-4">
                  {section.questions.map((q, qIdx) => (
                    <div key={qIdx} className="flex gap-4 relative group">
                      <div className="font-bold">{qIdx + 1}.</div>
                      <div className="flex-1">
                        <div dangerouslySetInnerHTML={{ __html: q.text }} />
                        
                        {/* Options for MCQ */}
                        {q.type === "MCQ" && q.options && (
                          <ol className="list-[lower-alpha] pl-5 mt-2 space-y-1">
                            {q.options.map((opt, oIdx) => (
                              <li key={oIdx}>{opt.text}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-bold">[{q.marks}]</div>
                        {!isFinalized && (
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <SwapButton paperId={paper.id} sectionId={section.sectionId} questionId={q.questionId} />
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <h3 className="text-xl font-bold">Paper Analysis</h3>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase">Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(paper.analytics.difficulty).map(([level, percentage]) => (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{level}</span>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {blueprint && (
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                      Target: {(blueprint.difficultyDistribution as any)[level]}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase">Cognitive Levels (Bloom's)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(paper.analytics.cognitiveLevel).map(([level, percentage]) => (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{level}</span>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {blueprint && (
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                      Target: {(blueprint.cognitiveLevelDistribution as any)[level]}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

import { adminDb } from "@/lib/firebase-admin";
import { GeneratedPaper, PaperTemplate } from "@/types/paper";
import { notFound } from "next/navigation";
import { PrintAction } from "./PrintAction";

export const dynamic = "force-dynamic";

export default async function PrintPaperPage({ params }: { params: { id: string } }) {
  const paperDoc = await adminDb.collection("papers").doc(params.id).get();
  if (!paperDoc.exists) notFound();
  const paper = { id: paperDoc.id, ...paperDoc.data() } as GeneratedPaper;

  const tplDoc = await adminDb.collection("templates").doc(paper.templateId).get();
  const template = tplDoc.exists ? (tplDoc.data() as PaperTemplate) : null;
  
  const bpDoc = await adminDb.collection("blueprints").doc(paper.blueprintId).get();
  const blueprintData = bpDoc.exists ? bpDoc.data() : null;

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto font-serif print-only">
      <PrintAction />
      
      {/* Header Template */}
      {template && (
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase">{template.universityName}</h1>
          <h2 className="text-2xl font-semibold mt-2">{template.examName}</h2>
          <div className="flex justify-between mt-4 font-bold text-lg">
            <span>Duration: {template.examDuration}</span>
            <span>Subject: {paper.subjectCode}</span>
            <span>Total Marks: {blueprintData?.totalMarks || "N/A"}</span>
          </div>
          {template.instructions && template.instructions.length > 0 && (
            <div className="mt-6 text-left text-base italic">
              <strong>Instructions:</strong>
              <ul className="list-decimal pl-6 mt-2 font-normal">
                {template.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Paper Content */}
      <div className="space-y-8 mt-8">
        {paper.sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="text-center font-bold text-xl underline uppercase mt-8">
              {section.name}
            </div>
            {section.description && (
              <p className="text-base text-center italic">{section.description}</p>
            )}
            
            <div className="space-y-6 mt-6">
              {section.questions.map((q, qIdx) => (
                <div key={qIdx} className="flex gap-4 avoid-break text-lg">
                  <div className="font-bold w-6">{qIdx + 1}.</div>
                  <div className="flex-1">
                    <div dangerouslySetInnerHTML={{ __html: q.text }} />
                    
                    {/* Options for MCQ */}
                    {q.type === "MCQ" && q.options && (
                      <ol className="list-[lower-alpha] pl-6 mt-2 space-y-1">
                        {q.options.map((opt, oIdx) => (
                          <li key={oIdx}>{opt.text}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                  <div className="font-bold whitespace-nowrap">[{q.marks} Marks]</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center text-sm font-bold uppercase no-print text-red-500">
        If the print dialog does not open automatically, press Ctrl+P or Cmd+P to print.
      </div>
    </div>
  );
}

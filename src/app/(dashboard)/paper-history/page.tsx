import { adminDb } from "@/lib/firebase-admin";
import { GeneratedPaper } from "@/types/paper";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getPapers(): Promise<GeneratedPaper[]> {
  try {
    const snapshot = await adminDb.collection("papers").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as GeneratedPaper[];
  } catch (error) {
    console.error("Error fetching papers:", error);
    return [];
  }
}

export default async function PaperHistoryPage() {
  const papers = await getPapers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paper History</h2>
          <p className="text-muted-foreground">View previously generated question papers.</p>
        </div>
        <Link href="/generate-paper">
          <Button>Generate New Paper</Button>
        </Link>
      </div>

      {papers.length === 0 ? (
        <div className="flex h-112.5 shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-105 flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No papers generated</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't generated any question papers yet.
            </p>
            <Link href="/generate-paper">
              <Button size="sm" className="relative">Generate Paper</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <div key={paper.id} className="rounded-xl border bg-card text-card-foreground shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{paper.subjectName || "Subject"}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{paper.subjectCode}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded ${paper.status === "Finalized" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {paper.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Generated: {new Date(paper.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link href={`/paper-history/${paper.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Paper</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

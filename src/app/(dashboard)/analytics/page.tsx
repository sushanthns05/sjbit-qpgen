import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

async function getAnalyticsData() {
  try {
    const questionsSnapshot = await adminDb.collection("questions").count().get();
    const papersSnapshot = await adminDb.collection("papers").count().get();
    const templatesSnapshot = await adminDb.collection("templates").count().get();
    const blueprintsSnapshot = await adminDb.collection("blueprints").count().get();

    return {
      totalQuestions: questionsSnapshot.data().count,
      totalPapers: papersSnapshot.data().count,
      totalTemplates: templatesSnapshot.data().count,
      totalBlueprints: blueprintsSnapshot.data().count,
    };
  } catch (error) {
    console.error("Failed to load analytics:", error);
    return null;
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">System-wide statistics and reporting.</p>
        </div>
        <div className="flex h-64 shrink-0 items-center justify-center rounded-md border border-dashed">
          <p className="text-muted-foreground">No analytics data available yet. Please generate some content first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">System-wide statistics and reporting.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Approved questions in bank</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Papers Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPapers}</div>
            <p className="text-xs text-muted-foreground">Finalized examination papers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Available formatting templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blueprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBlueprints}</div>
            <p className="text-xs text-muted-foreground">Defined exam blueprints</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

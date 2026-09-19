import { getBlueprints, deleteBlueprint } from "./actions";
import { BlueprintDialog } from "@/components/blueprints/blueprint-dialog";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BlueprintsPage() {
  const blueprints = await getBlueprints();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blueprints</h2>
          <p className="text-muted-foreground">Define constraints and structures for your question papers.</p>
        </div>
        <BlueprintDialog>
          <Button>Create Blueprint</Button>
        </BlueprintDialog>
      </div>

      {blueprints.length === 0 ? (
        <div className="flex h-112.5 shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-105 flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No blueprints created</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't created any blueprints yet. Start by defining the structure for an exam.
            </p>
            <BlueprintDialog>
              <Button size="sm" className="relative">Create Blueprint</Button>
            </BlueprintDialog>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((bp) => (
            <div key={bp.id} className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-xl font-bold">{bp.name}</h3>
                <span className="text-sm font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded">
                  {bp.subjectCode}
                </span>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{bp.totalMarks} Marks</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {bp.sections.length} Section{bp.sections.length !== 1 ? 's' : ''}
                </p>
                
                <div className="mt-4 flex gap-2">
                  <BlueprintDialog blueprint={bp}>
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </BlueprintDialog>
                  <form action={async () => {
                    "use server";
                    await deleteBlueprint(bp.id);
                  }}>
                    <Button variant="destructive" size="sm" type="submit">Delete</Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

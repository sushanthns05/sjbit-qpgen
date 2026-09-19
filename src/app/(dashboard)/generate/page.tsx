import { getBlueprints } from "@/app/(dashboard)/blueprints/actions";
import { getTemplates } from "@/app/(dashboard)/templates/actions";
import { GeneratePaperForm } from "./GeneratePaperForm";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  const blueprints = await getBlueprints();
  const templates = await getTemplates();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Generate Paper</h2>
        <p className="text-muted-foreground">Select a Blueprint and Template to automatically generate a question paper.</p>
      </div>

      <div className="bg-card border shadow rounded-xl p-6">
        <GeneratePaperForm blueprints={blueprints} templates={templates} />
      </div>
    </div>
  );
}

import { getTemplates, deleteTemplate } from "./actions";
import { TemplateDialog } from "@/components/templates/template-dialog";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">Manage the visual header and instructions for question papers.</p>
        </div>
        <TemplateDialog>
          <Button>Create Template</Button>
        </TemplateDialog>
      </div>

      {templates.length === 0 ? (
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No templates created</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't created any paper templates yet. Start by defining the header layout for an exam.
            </p>
            <TemplateDialog>
              <Button size="sm" className="relative">Create Template</Button>
            </TemplateDialog>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div key={tpl.id} className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-xl font-bold truncate pr-2">{tpl.name}</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="text-sm font-semibold truncate">{tpl.universityName}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {tpl.examName}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Duration: {tpl.examDuration}
                </p>
                
                <div className="mt-4 flex gap-2">
                  <TemplateDialog template={tpl}>
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </TemplateDialog>
                  <form action={async () => {
                    "use server";
                    await deleteTemplate(tpl.id);
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

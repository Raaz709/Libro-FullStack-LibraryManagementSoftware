import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageState } from "@/components/ui/page-state";
import { MessageBanner } from "@/components/ui/message-banner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
  useEmailTemplates,
  useUpdateEmailTemplate,
} from "@/features/email-templates/hooks/useEmailTemplates";
import type { EmailTemplate } from "@/types/email-templates.types";

const templateSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .regex(/^[A-Z_]+$/, "Use uppercase letters and underscores (e.g. WELCOME_EMAIL)."),
  subject: z.string().trim().min(1, "Subject is required."),
  bodyHtml: z.string().trim().min(1, "Body HTML is required."),
  description: z.string().trim().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function EmailTemplatesPage() {
  const { data: templates = [], isLoading, isError, error } = useEmailTemplates();
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState<EmailTemplate | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(q) ||
        template.code.toLowerCase().includes(q) ||
        template.subject.toLowerCase().includes(q),
    );
  }, [templates, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setEditing(template);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteTemplate.mutateAsync(deleting.id);
      setMessage({ text: "Email template deleted.", kind: "success" });
      setDeleting(null);
    } catch {
      setMessage({ text: "Failed to delete email template.", kind: "error" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Admin"
          title="Email Templates"
          description="Manage the emails sent to users across the library."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates..."
            aria-label="Search email templates"
            className="h-9 w-64 text-xs"
          />
          <Button onClick={openCreate}>+ New Template</Button>
        </PageHeader>

        <MessageBanner message={message} />

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading email templates...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">
            Failed to load email templates: {(error as Error).message}
          </p>
        ) : filteredTemplates.length === 0 ? (
          <PageState
            icon={<Mail className="h-7 w-7 text-camel" />}
            title={templates.length === 0 ? "No email templates yet." : "No templates match your search."}
            description={
              templates.length === 0
                ? "Create your first template to start customizing emails."
                : "Try adjusting your search."
            }
            action={
              templates.length === 0 ? (
                <Button onClick={openCreate}>+ New Template</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex flex-col rounded-card border border-line bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-camel hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                    <Mail className="h-4 w-4 text-camel-dark" />
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {template.code}
                  </Badge>
                </div>
                <h2 className="mt-4 text-base font-bold tracking-tight text-ink">{template.name}</h2>
                <p className="mt-0.5 truncate text-sm text-muted">{template.subject}</p>
                {template.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{template.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-4">
                  <p className="text-xs text-muted">Updated {formatDate(template.updatedAt)}</p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setPreviewing(template)} aria-label="Preview template">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => openEdit(template)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-red-600 hover:text-red-600"
                      onClick={() => setDeleting(template)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TemplateDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        isSubmitting={createTemplate.isPending || updateTemplate.isPending}
        onSubmit={async (values) => {
          try {
            const payload = {
              name: values.name,
              code: values.code,
              subject: values.subject,
              bodyHtml: values.bodyHtml,
              description: values.description || null,
            };
            if (editing) {
              await updateTemplate.mutateAsync({ id: editing.id, payload });
              setMessage({ text: "Email template updated.", kind: "success" });
            } else {
              await createTemplate.mutateAsync(payload);
              setMessage({ text: "Email template created.", kind: "success" });
            }
            setFormOpen(false);
          } catch {
            setMessage({ text: "Failed to save email template.", kind: "error" });
          }
        }}
      />

      <Dialog open={Boolean(previewing)} onOpenChange={(next) => !next && setPreviewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewing?.name}</DialogTitle>
            <DialogDescription>
              Subject: {previewing?.subject}
            </DialogDescription>
          </DialogHeader>
          <div
            className="max-h-80 overflow-auto rounded-soft border border-line bg-white p-4 text-sm leading-6 text-ink"
            dangerouslySetInnerHTML={{ __html: previewing?.bodyHtml ?? "" }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this email template?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{deleting?.name}". Emails using it will fall back to defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TemplateDialog({
  open,
  onOpenChange,
  editing,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: EmailTemplate | null;
  isSubmitting: boolean;
  onSubmit: (values: TemplateFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { code: "", name: "", subject: "", bodyHtml: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? "",
        code: editing?.code ?? "",
        subject: editing?.subject ?? "",
        bodyHtml: editing?.bodyHtml ?? "",
        description: editing?.description ?? "",
      });
    }
  }, [open, editing, reset]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit email template" : "New email template"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update this template's content." : "Create a new reusable email template."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Welcome email" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="WELCOME_EMAIL" className="font-mono" {...register("code")} />
              {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Welcome to the library!" {...register("subject")} />
            {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="bodyHtml">Body HTML</Label>
            <Textarea
              id="bodyHtml"
              rows={8}
              placeholder={"<p>Hi {{Name}},</p><p>Welcome!</p>"}
              className="font-mono text-xs"
              {...register("bodyHtml")}
            />
            {errors.bodyHtml && <p className="text-xs text-red-500">{errors.bodyHtml.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Optional notes about when this template is used."
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
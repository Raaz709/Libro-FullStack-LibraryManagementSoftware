import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useSettings, useUpdateSetting, useDeleteSetting } from "@/features/settings/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageState } from "@/components/ui/page-state";

export default function SettingsPage() {
  const { data: settings = [], isLoading, isError, error } = useSettings();
  const update = useUpdateSetting();
  const remove = useDeleteSetting();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const draftValue = (key: string) => drafts[key] ?? settings.find((s) => s.key === key)?.value ?? "";
  const hasChange = (key: string) => draftValue(key) !== (settings.find((s) => s.key === key)?.value ?? "");

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Administration"
          title="Settings"
          description="System-wide configuration keys stored in the database."
        />

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading settings...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">Failed to load settings: {(error as Error).message}</p>
        ) : settings.length === 0 ? (
          <PageState
            icon={<KeyRound className="h-7 w-7 text-camel" />}
            title="No settings configured."
            description="Add settings to customize library behaviour."
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {settings.map((setting) => {
              const dirty = hasChange(setting.key);
              return (
                <li key={setting.key} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-camel-dark">
                        {setting.key}
                      </p>
                      {setting.description && (
                        <p className="mt-0.5 text-xs text-muted">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <Input
                        value={draftValue(setting.key)}
                        onChange={(event) =>
                          setDrafts((prev) => ({ ...prev, [setting.key]: event.target.value }))
                        }
                        className="h-9 flex-1 text-xs sm:w-64"
                        aria-label={`Value for ${setting.key}`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 px-3 text-xs"
                        disabled={!dirty || update.isPending}
                        onClick={() =>
                          update.mutate({ key: setting.key, payload: { value: draftValue(setting.key) } })
                        }
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-xs text-red-600 hover:text-red-700"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(setting.key)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
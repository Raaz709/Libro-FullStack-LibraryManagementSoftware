import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { emailTemplatesApi } from "@/api/emailTemplates.api";
import type { EmailTemplatePayload } from "@/types/email-templates.types";

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-templates"],
    queryFn: emailTemplatesApi.getAll,
    retry: false,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmailTemplatePayload) => emailTemplatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmailTemplatePayload }) =>
      emailTemplatesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => emailTemplatesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}
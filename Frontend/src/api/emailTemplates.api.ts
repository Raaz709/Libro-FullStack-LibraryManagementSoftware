import { axiosClient } from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/api.types";
import type {
  EmailTemplate,
  EmailTemplatePayload,
} from "@/types/email-templates.types";

export const emailTemplatesApi = {
  getAll: async (): Promise<EmailTemplate[]> => {
    const response = await axiosClient.get<ApiResponse<EmailTemplate[]>>("/emailtemplates");
    return response.data.data ?? [];
  },

  create: async (payload: EmailTemplatePayload): Promise<EmailTemplate> => {
    const response = await axiosClient.post<ApiResponse<EmailTemplate>>("/emailtemplates", payload);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create template.");
    }
    return response.data.data;
  },

  update: async (id: number, payload: EmailTemplatePayload): Promise<void> => {
    const response = await axiosClient.put<ApiResponse<null>>(`/emailtemplates/${id}`, payload);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update template.");
    }
  },

  remove: async (id: number): Promise<void> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/emailtemplates/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete template.");
    }
  },
};
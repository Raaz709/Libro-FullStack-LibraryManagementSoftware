export interface EmailTemplate {
  id: number;
  name: string;
  code: string;
  subject: string;
  bodyHtml: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplatePayload {
  name: string;
  code: string;
  subject: string;
  bodyHtml: string;
  description?: string | null;
}
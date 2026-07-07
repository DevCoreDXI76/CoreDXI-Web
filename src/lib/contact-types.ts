import type { ContactStatus } from "@/lib/contact-status";

export type ContactRecord = {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: ContactStatus;
  created_at: string;
};

export type ContactFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  message: string;
};

export type ContactSubmitResult =
  | { success: true }
  | { success: false; error: string };

export type ContactListResult =
  | { success: true; data: ContactRecord[] }
  | { success: false; error: string };

export type UpdateContactNotificationEmailResult =
  | { success: true; email: string }
  | { success: false; error: string };

export type UpdateContactStatusResult =
  | { success: true }
  | { success: false; error: string };

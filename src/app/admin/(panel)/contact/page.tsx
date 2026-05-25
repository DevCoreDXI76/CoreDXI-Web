import {
  getContactNotificationEmail,
  listContacts,
} from "@/actions/contact";
import { AdminContactManager } from "./AdminContactManager";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const [result, notificationEmail] = await Promise.all([
    listContacts(),
    getContactNotificationEmail(),
  ]);

  return (
    <AdminContactManager
      initialContacts={result.success ? result.data : []}
      loadError={result.success ? undefined : result.error}
      initialNotificationEmail={notificationEmail}
    />
  );
}

import { getContactNotificationEmail } from "@/actions/contact";
import { ContactPageClient } from "./ContactPageClient";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const notificationEmail = await getContactNotificationEmail();

  return <ContactPageClient notificationEmail={notificationEmail} />;
}

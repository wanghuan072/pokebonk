import LegalPage, { legalMetadata } from "./LegalPage";
export const metadata = legalMetadata("contact");
export default function ContactPage() {
  return <LegalPage slug="contact" />;
}

import LegalPage, { legalMetadata } from "@/page/legal/LegalPage";
export const metadata = legalMetadata("privacy-policy");
export default function Page() {
  return <LegalPage slug="privacy-policy" />;
}

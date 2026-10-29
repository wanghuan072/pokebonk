import LegalPage, { legalMetadata } from "@/page/legal/LegalPage";
export const metadata = legalMetadata("terms");
export default function Page() {
  return <LegalPage slug="terms" />;
}

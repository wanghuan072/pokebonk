import LegalPage, { legalMetadata } from "@/page/legal/LegalPage";
export const metadata = legalMetadata("copyright");
export default function Page() {
  return <LegalPage slug="copyright" />;
}

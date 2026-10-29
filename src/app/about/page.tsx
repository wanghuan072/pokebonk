import LegalPage, { legalMetadata } from "@/page/legal/LegalPage";
export const metadata = legalMetadata("about");
export default function Page() {
  return <LegalPage slug="about" />;
}

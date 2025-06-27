import dynamic from "next/dynamic";

const DiseaseDetailsClient = dynamic(() => import("./DiseaseDetailsClient"), { ssr: false });

export default function DiseaseDetailsPage() {
  return <DiseaseDetailsClient />;
}
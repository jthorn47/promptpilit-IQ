import { ACHProcessing } from "@/services/ach-processing/ui/ACHProcessing";
import { StandardLayout } from "@/components/layouts/StandardLayout";

export const ACHProcessingPage = () => {
  return (
    <StandardLayout 
      title="ACH Processing"
      subtitle="Manage NACHA-compliant ACH file generation and bank transmission"
      showBreadcrumbs={false}
    >
      <ACHProcessing />
    </StandardLayout>
  );
};
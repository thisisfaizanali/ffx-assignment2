import { TODAY } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle={formatDate(TODAY)} />
      <div className="flex-1 overflow-y-auto p-8">
        <DashboardContent />
      </div>
    </>
  );
}

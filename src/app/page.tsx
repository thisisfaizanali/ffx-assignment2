import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="At-a-glance invoice health." />
      <div className="flex-1 overflow-y-auto p-8" />
    </>
  );
}

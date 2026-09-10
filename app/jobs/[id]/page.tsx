import ProtectedRoute from "@/src/components/ProtectedRoute";
import JobDetail from "@/src/views/JobDetail";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <JobDetail jobId={params.id} />
    </ProtectedRoute>
  );
}

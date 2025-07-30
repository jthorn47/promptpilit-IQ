import { VimeoVideoExporter } from "@/components/admin/VimeoVideoExporter";

export default function AdminVimeoVideos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10">
      <div className="container mx-auto p-6">
        <VimeoVideoExporter />
      </div>
    </div>
  );
}
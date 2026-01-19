import { ErrorSection } from "#root/components/dashboard/ErrorSection";

// Single-shop mode: Vendor shop pages are not available
export default function BrandDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorSection
        error="Vendor shop pages are not available in single-shop mode"
      />
    </div>
  );
}

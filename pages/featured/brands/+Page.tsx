import { useState, useEffect, useCallback } from "react";
import { trpc } from "#root/shared/trpc/client";
import useTemplate from "#root/frontend/components/template/useTemplate";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  logoImagePath: string | null;
}

export default function BrandsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeTemplate } = useTemplate('brands');

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all active vendors with products, not just those marked as featured
      const result = await trpc.vendor.featured.query({ featured: false });
      if (result.success) {
        setVendors(result.result || []);
      } else {
        setError("Failed to fetch vendors");
        console.error("Failed to fetch vendors:", result.error);
      }
    } catch (err) {
      setError("Error fetching vendors");
      console.error("Error fetching vendors:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Prepare data for template
  const templateData = {
    vendors,
    isLoading,
    error
  };

  return (
    <TemplateRenderer
      category="brands"
      templateId={activeTemplate}
      data={templateData}
    />
  );
}

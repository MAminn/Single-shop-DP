import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";
import useTemplate from "#root/frontend/components/template/useTemplate";

const Page = () => {
  const data = useData<Data>();
  const { activeTemplate } = useTemplate('products');

  // Prepare template data
  const templateData = {
    products: data.success ? data.products : [],
    isLoading: false,
    error: data.success ? null : data.error
  };

  return (
    <TemplateRenderer
      category="products"
      templateId={activeTemplate}
      data={templateData}
    />
  );
};

export default Page;

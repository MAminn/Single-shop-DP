import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import TemplateRenderer from "#root/frontend/components/template/TemplateRenderer";
import useTemplate from "#root/frontend/components/template/useTemplate";

const Page: React.FC = () => {
  const fetchData = useData<Data>();
  const { activeTemplate } = useTemplate('women');

  // Prepare template data
  const templateData = {
    subcategories: fetchData.success ? fetchData.subcategories : [],
    isLoading: false,
    error: fetchData.success ? null : fetchData.error
  };

  return (
    <TemplateRenderer
      category="women"
      templateId={activeTemplate}
      data={templateData}
    />
  );
};

export default Page;

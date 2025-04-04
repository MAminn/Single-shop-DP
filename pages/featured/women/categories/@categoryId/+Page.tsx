import { ErrorSection } from "#root/components/error-section";
import Sorting from "#root/components/sorting";
import { usePageContext } from "vike-react/usePageContext";

const Page = () => {
  const ctx = usePageContext();

  const categoryId = ctx.routeParams.categoryId;

  if (!categoryId) {
    return <ErrorSection error="Invalid category id" />;
  }

  return (
    <div className="flex flex-col justify-center items-center h-full w-full pr-6">
      <Sorting categoryId={categoryId} />
    </div>
  );
};

export default Page;

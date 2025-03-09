import Navbar from "#root/components/globals/Navbar.jsx";
import "./style.css";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}
function Content({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="page-content"
      className=" bg-background h-full text-foreground w-full font-poppins"
    >
      <Navbar />
      {children}
    </main>
  );
}

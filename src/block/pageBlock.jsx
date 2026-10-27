import Background from "./background";
import Footer from "./footer";
import Header from "./header";

function PageBlock({ children }) {
  return (
    <div className="relative flex flex-col min-h-screen font-[Dos] text-[15px] overflow-hidden">
      <Background />
      <Header />
      <div className="w-full max-w-400 mx-auto flex-1">{children}</div>
      <Footer />
    </div>
  );
}
export default PageBlock;

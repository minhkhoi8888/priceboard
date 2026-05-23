import { Toaster } from "sonner";

import Footer from "./components/Footer";
import Header from "./components/Header";
import TradePage from "./pages/TradePage";

function App() {
  return (
    <div className="min-h-screen bg-[#EDF0F5] text-foreground transition-colors dark:bg-[#0a0a12]">
      <Toaster richColors position="top-center" />
      <Header />
      <TradePage />
      <Footer />
    </div>
  );
}

export default App;

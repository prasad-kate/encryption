import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";

function App() {
  // TODO: setup for tanstack query
  // const queryClient = new QueryClient();
  return (
    <>
      {/* <QueryClientProvider client={queryClient}> */}
      <BrowserRouter>
        <Routes>
          {/* fallback page */}
          <Route path="*" element={<>Page not found...</>} />

          {/* routes start */}
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
      {/* </QueryClientProvider> */}
    </>
  );
}

export default App;

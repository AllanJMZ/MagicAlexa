import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import ScrollToTop from './components/ScrollToTop'
import SiteBackground from './components/SiteBackground'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Shipping from './pages/Shipping'
import Admin from './pages/Admin'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <main key={location.pathname} className="flex-1">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </main>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300 relative">
          <SiteBackground />
          <ScrollProgress />
          <Navbar />
          <Banner />
          <AnimatedRoutes />
          <Footer />
          <ScrollToTop />
        </div>
      </HashRouter>
    </ThemeProvider>
  )
}

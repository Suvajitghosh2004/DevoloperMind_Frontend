import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './lib/authStore'

// Public pages
import HomePage from './pages/public/HomePage'
import PostPage from './pages/public/PostPage'
import CategoryPage from './pages/public/CategoryPage'
import SearchPage from './pages/public/SearchPage'
import ToolsPage from './pages/public/ToolsPage'
import AiNewsPage from './pages/public/AiNewsPage'
import SeriesPage from './pages/public/SeriesPage'
import SeriesDetailPage from './pages/public/SeriesDetailPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPage from './pages/public/PrivacyPage'
import AdvertisePage from './pages/public/AdvertisePage'
import NotFoundPage from './pages/public/NotFoundPage'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPosts from './pages/admin/AdminPosts'
import AdminPostEditor from './pages/admin/AdminPostEditor'
import AdminCategories from './pages/admin/AdminCategories'
import AdminComments from './pages/admin/AdminComments'
import AdminSubscribers from './pages/admin/AdminSubscribers'
import AdminTools from './pages/admin/AdminTools'
import AdminNews from './pages/admin/AdminNews'
import AdminSeries from './pages/admin/AdminSeries'
import AdminMedia from './pages/admin/AdminMedia'

// Auth guard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  const { fetchMe } = useAuthStore()

  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/post/:slug" element={<PostPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/ai-news" element={<AiNewsPage />} />
      <Route path="/series" element={<SeriesPage />} />
      <Route path="/series/:slug" element={<SeriesDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/advertise" element={<AdvertisePage />} />

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protected */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="subscribers" element={<AdminSubscribers />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="series" element={<AdminSeries />} />
        <Route path="media" element={<AdminMedia />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

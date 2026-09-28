import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-graphite-950 bg-grid text-graphite-100 font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  )
}

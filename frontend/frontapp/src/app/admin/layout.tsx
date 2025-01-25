import React from 'react'
import SideNav from '../../components/SideNav'
import Header from '../../components/Header' // Importamos el Header
import { SIDENAV_ITEMS_ADMIN } from '../../constants'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header /> {/* Componente de cabecera */}

      <div className="flex flex-1">
        {/* Sidebar */}
        <SideNav list={SIDENAV_ITEMS_ADMIN} admin={true} />

        {/* Main content */}
        <div className="flex-1 p-10 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout

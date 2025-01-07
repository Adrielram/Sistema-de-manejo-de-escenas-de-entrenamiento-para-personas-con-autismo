import React from 'react'
import SideNav from '../../components/SideNav'
import { SIDENAV_ITEMS_ADMIN } from '../../constants'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <SideNav list={SIDENAV_ITEMS_ADMIN} admin={true} />
      
      {/* Main content */}
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
import React from 'react'
import WorkspaceProvider from './provider'

function workspaceLayout({children}) {
  return (
    <WorkspaceProvider>
        {children}
    </WorkspaceProvider>
   
  )
}

export default workspaceLayout

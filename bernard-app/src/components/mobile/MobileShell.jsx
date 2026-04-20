import React from 'react'
import { mobilePageStyle } from './MobilePrimitives'

export function MobileShell({ children, style }) {
  return (
    <div style={{ ...mobilePageStyle, ...(style || {}) }}>
      {children}
    </div>
  )
}

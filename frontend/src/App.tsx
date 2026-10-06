import { MotionConfig } from 'framer-motion'
import { useState } from 'react'
import { RouterProvider } from 'react-router/dom'
import { createRouter } from '@/router'

/** Application root: the router owns everything else (layouts, providers, pages). */
export default function App() {
  const [router] = useState(createRouter)
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}

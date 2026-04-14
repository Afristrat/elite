'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export type TourStep = {
  element?: string
  popover: {
    title: string
    description: string
    side?: 'top' | 'bottom' | 'left' | 'right' | 'over'
    align?: 'start' | 'center' | 'end'
  }
}

type TourSegmentProps = {
  steps: TourStep[]
  nextUrl: string | null
  totalSegments?: number
  currentSegment?: number
}

export function TourSegment({
  steps,
  nextUrl,
  totalSegments,
  currentSegment,
}: TourSegmentProps): null {
  const router = useRouter()

  const start = useCallback(() => {
    const progressText =
      totalSegments && currentSegment
        ? `Page ${currentSegment} / ${totalSegments}`
        : '{{current}} / {{total}}'

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(0,0,0,0.8)',
      stagePadding: 10,
      stageRadius: 12,
      progressText,
      nextBtnText: 'Suivant →',
      prevBtnText: '← Retour',
      doneBtnText: nextUrl ? 'Page suivante →' : 'Terminer le tour ✓',
      onDestroyStarted: () => {
        driverObj.destroy()
        if (nextUrl) {
          router.push(nextUrl)
        }
      },
      steps,
    })

    driverObj.drive()
  }, [steps, nextUrl, router, totalSegments, currentSegment])

  useEffect(() => {
    const t = setTimeout(start, 400)
    return () => clearTimeout(t)
  }, [start])

  return null
}

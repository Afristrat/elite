'use client'

import dynamic from 'next/dynamic'
import type { TourStep } from './tour-segment'

// Chargé uniquement côté client — driver.js n'est pas compatible SSR
const TourSegmentDynamic = dynamic(
  () => import('./tour-segment').then((m) => m.TourSegment),
  { ssr: false },
)

type TourWidgetProps = {
  steps: TourStep[]
  nextUrl: string | null
  totalSegments?: number
  currentSegment?: number
}

export function TourWidget(props: TourWidgetProps): React.JSX.Element {
  return <TourSegmentDynamic {...props} />
}

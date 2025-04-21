'use client'

import React, { useState, Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, MapControls, PointerLockControls, Html, useGLTF } from '@react-three/drei'
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftRightIcon } from 'lucide-react'

interface ModelCarouselProps {
  models: string[]  // Array of filenames (e.g. ['chair.glb','car.glb']) in /public/models
}

// Loader component: renders the GLTF scene as a Three.js primitive
function ModelDisplay({ url }: { url: string }) {
  const { scene } = useGLTF(url, true)
  return <primitive object={scene} />
}

export function ModelCarousel({ models }: ModelCarouselProps) {
  const [index, setIndex] = useState(0)
  const count = models.length
  const next = () => setIndex((i) => (i + 1) % count)
  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const current = `/models/${models[index]}`
  const upcoming = `/models/${models[(index + 1) % count]}`

  // Clamp devicePixelRatio for mobile performance
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1

  // Preload the next model in background
  useGLTF.preload(upcoming)

  return (
    <div className="relative w-full h-[450px] md:h-[450px] rounded-lg" style={{ paddingBottom: '0%' }}>
      {/* Responsive container: 16:9 aspect via padding-bottom hack */}
      <Canvas
      className="absolute top-0 left-0 w-full min-h-fit"
      shadows
      dpr={dpr}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [0, 2, 5], fov: 80 }} // default fov:50
      >
      {/* Basic ambient + directional lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight
        castShadow
        position={[5, 5, 5]}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      <Suspense
        fallback={
        <Html center>
          <div className="w-8 h-8 border-4 border-amber-500 border-dashed rounded-full animate-spin" />
        </Html>
        }
      >
        <ModelDisplay url={current} />
      </Suspense>

      {/* OrbitControls: rotate + zoom, no panning */}
      {/* TrackballControls: rotate + zoom + pan */}
      {/* FlyControls: first-person flying */}
      {/* PointerLockControls: first-person with pointer lock */}
      {/* MapControls: similar to OrbitControls but with panning */}
      {/* <MapControls /> */}
      <OrbitControls enablePan={false} enableZoom enableRotate />
      </Canvas>

      {/* Prev/Next overlay buttons */}
      <button
      type="button"
      onClick={prev}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full focus:outline-none"
      >
      <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
      type="button"
      onClick={next}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full focus:outline-none"
      >
      <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

// Usage example in app/page.tsx:
// import dynamic from 'next/dynamic'
// const ModelCarousel = dynamic(() => import('@/components/ModelCarousel'), { ssr: false })
//
// export default function HomePage() {
//   return <ModelCarousel models={[ 'chair.glb', 'car.glb', 'lamp.glb' ]} />
// }

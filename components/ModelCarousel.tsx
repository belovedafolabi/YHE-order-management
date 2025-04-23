'use client'

import { useFrame } from '@react-three/fiber'
import { useSpring, a } from '@react-spring/three'
import React, { useState, Suspense, useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, MapControls, PointerLockControls, Html, useGLTF } from '@react-three/drei'
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftRightIcon } from 'lucide-react'

interface ModelCarouselProps {
  models: string[]  // Array of filenames (e.g. ['chair.glb','car.glb']) in /public/models
}

// Loader component: renders the GLTF scene as a Three.js primitive
/* function ModelDisplay({ url }: { url: string }) {
  const { scene } = useGLTF(url, true)
  return <primitive object={scene} />
} */
/* V1 Workingn fine */
/* function ModelDisplay({ url }: { url: string }) {
  const { scene } = useGLTF(url, true)
  const ref = React.useRef<THREE.Group>(null)

  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current)
      const size = new THREE.Vector3()
      box.getSize(size)

      // Optional: Normalize the size if too big/small
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim // Or any other base size like 1.5 / maxDim
      ref.current.scale.setScalar(scale)

      // Center the object
      const center = new THREE.Vector3()
      box.getCenter(center)
      ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    }
  }, [scene])

  return <group ref={ref} dispose={null}>
    <primitive object={scene} />
  </group>
} */

  /* V2 Works */

/* function ModelDisplay({ url, baseSize = 6 }: { url: string; baseSize?: number }) {
  const { scene } = useGLTF(url, true)
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!ref.current) return

    // Compute bounding box of the model
    const box = new THREE.Box3().setFromObject(ref.current)
    const size = box.getSize(new THREE.Vector3())
    // baseSize controls how 'zoomed in' the model appears:
    // larger baseSize => model appears bigger (closer)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = baseSize / maxDim

    // Apply scaling
    ref.current.scale.setScalar(scale)

    // Center the model
    const center = box.getCenter(new THREE.Vector3())
    ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  }, [scene, baseSize])

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
    </group>
  )
} */
/* V3 Working but next loads to different position */
/* function ModelDisplay({ url, baseSize = 6, verticalOffset = 0 }: { url: string; baseSize?: number; verticalOffset?: number }) {
  const { scene } = useGLTF(url, true)
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!ref.current) return

    // Compute bounding box of the model
    const box = new THREE.Box3().setFromObject(ref.current)
    const size = box.getSize(new THREE.Vector3())

    // baseSize controls how 'zoomed in' the model appears:
    // larger baseSize => model appears bigger (closer)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = baseSize / maxDim

    // Apply uniform scaling
    ref.current.scale.setScalar(scale)

    // Center the model and apply vertical offset
    const center = box.getCenter(new THREE.Vector3())
    ref.current.position.set(
      -center.x * scale,
      -center.y * scale + verticalOffset,  // <--- second parameter controls vertical positioning
      -center.z * scale
    )
  }, [scene, baseSize, verticalOffset])

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
    </group>
  )
} */

  /* Best workingn version with perfect zoom and positioning on all devices */
/* function ModelDisplay({ url, baseSize = 6, verticalOffset = 0 }: { url: string; baseSize?: number; verticalOffset?: number }) {
  const { scene } = useGLTF(url, true)
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!ref.current) return

    // Reset any previous transforms
    ref.current.scale.setScalar(1)
    ref.current.position.set(0, 0, 0)

    // Compute bounding box of the raw model
    const box = new THREE.Box3().setFromObject(ref.current)
    const size = box.getSize(new THREE.Vector3())

    // Determine uniform scale so largest dimension matches baseSize
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = baseSize / maxDim

    // Apply uniform scaling
    ref.current.scale.setScalar(scale)

    // Recompute center after scaling
    const center = box.getCenter(new THREE.Vector3())
    ref.current.position.set(
      -center.x * scale,
      -center.y * scale + verticalOffset,
      -center.z * scale
    )
  }, [scene, baseSize, verticalOffset])

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
    </group>
  )
} */

/* Fully working with all features */
/* function ModelDisplay({
  url,
  baseSize = 6,
  verticalOffset = 0
}: {
  url: string
  baseSize?: number
  verticalOffset?: number
}) {
  const { scene } = useGLTF(url, true)
  const ref = useRef<THREE.Group>(null)
  const [opacity, setOpacity] = useState(0)
  const fadeSpeed = 0.05 // Increase for faster fade-in

  useEffect(() => {
    if (!ref.current) return

    // Reset transform
    ref.current.scale.setScalar(1)
    ref.current.position.set(0, 0, 0)

    const box = new THREE.Box3().setFromObject(ref.current)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = baseSize / maxDim
    ref.current.scale.setScalar(scale)

    const center = box.getCenter(new THREE.Vector3())
    ref.current.position.set(
      -center.x * scale,
      -center.y * scale + verticalOffset,
      -center.z * scale
    )

    // Reset opacity to 0 for fresh fade-in
    setOpacity(0)

    // Apply transparent material to all meshes
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.transparent = true
        child.material.opacity = 0
      }
    })
  }, [scene, baseSize, verticalOffset])

  // Gradually increase opacity per frame
  useFrame(() => {
    if (!ref.current) return
    const nextOpacity = Math.min(opacity + fadeSpeed, 1)
    if (nextOpacity !== opacity) {
      setOpacity(nextOpacity)
      ref.current.traverse((child: any) => {
        if (child.isMesh) {
          child.material.opacity = nextOpacity
        }
      })
    }
  })

  return (
    <group ref={ref} dispose={null}>
      <primitive object={scene} />
    </group>
  )
} */

function ModelDisplay({
  url,
  baseSize = 6,
  verticalOffset = 0
}: {
  url: string
  baseSize?: number
  verticalOffset?: number
}) {
  const { scene, animations } = useGLTF(url, true)
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [opacity, setOpacity] = useState(0)
  const fadeSpeed = 0.05

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    group.scale.setScalar(1)
    group.position.set(0, 0, 0)

    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = baseSize / maxDim
    group.scale.setScalar(scale)

    const center = box.getCenter(new THREE.Vector3())
    group.position.set(
      -center.x * scale,
      -center.y * scale + verticalOffset,
      -center.z * scale
    )

    setOpacity(0)

    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.transparent = true
        child.material.opacity = 0
        child.material.depthWrite = true
      }
    })

    if (animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene)
      mixerRef.current = mixer

      animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.enabled = true
        action.setLoop(THREE.LoopRepeat, Infinity)
        action.clampWhenFinished = false
        action.fadeIn(0.5)
        action.play()
      })
    }

    return () => {
      mixerRef.current?.stopAllAction()
      mixerRef.current?.uncacheRoot(scene)
    }
  }, [scene, animations, baseSize, verticalOffset])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const nextOpacity = Math.min(opacity + fadeSpeed, 1)
    if (nextOpacity !== opacity) {
      setOpacity(nextOpacity)
      group.traverse((child: any) => {
        if (child.isMesh) {
          child.material.opacity = nextOpacity
        }
      })
    }

    // Update animation mixer
    mixerRef.current?.update(delta)
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  )
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
      className="absolute top-0 left-0 w-full min-h-fit hover:cursor-grab active:cursor-grabbing"
      shadows
      dpr={dpr}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
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
      {/* TrackballControls: rot
        ate + zoom + pan */}
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        autoRotate autoRotateSpeed={4}
        />
      {/* FlyControls: first-person flying */}
      {/* PointerLockControls: first-person with pointer lock */}
      {/* MapControls: similar to OrbitControls but with panning */}
      {/* <MapControls /> */}
      {/* <OrbitControls enablePan={false} enableZoom enableRotate /> */}
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

import { animate } from "framer-motion"

export function smoothScrollTo(targetId: string) {
  const target = document.querySelector(targetId)
  if (!target) return

  const targetPosition = target.getBoundingClientRect().top + window.scrollY
  const start = window.scrollY
  const duration = 0.6

  animate(start, targetPosition, {
    duration,
    onUpdate(latest) {
      window.scrollTo(0, latest)
    },
    ease: [0.42, 0, 0.58, 1],
  })
}
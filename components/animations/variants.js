// Durasi dan easing disesuaikan untuk animasi yang lebih smooth
const SMOOTH_EASE = [0.25, 1, 0.5, 1];
const DURATION_SLOW = 2.2;
const DURATION_MEDIUM = 1.8;

export const section = {
  hidden: { opacity: 0, y: 24 },
  visible: (stagger = 0.08) => ({
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: stagger,
      duration: 1.2, // section fade in
      ease: [0.25, 0.8, 0.25, 1]
    }
  }),
};

export const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.8, 0.25, 1]
    }
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_MEDIUM,
      ease: SMOOTH_EASE
    }
  },
};

export const fadeRight = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION_MEDIUM,
      ease: SMOOTH_EASE
    }
  },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION_MEDIUM,
      ease: SMOOTH_EASE
    }
  },
};

export const zoomIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.25, 0.8, 0.25, 1]
    }
  }
};

export const viewportOnce = {
  once: true,
  amount: 0.25
};

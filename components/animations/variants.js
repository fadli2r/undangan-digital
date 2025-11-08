export const section = {
  hidden: { opacity: 0, y: 24 },
  visible: (stagger = 0.12) => ({
    opacity: 1,
    y: 0,
    transition: { when: 'beforeChildren', staggerChildren: stagger }
  }),
};

export const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export const fadeRight = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export const zoomIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export const viewportOnce = { once: true, amount: 0.25 };
let direction: 'left' | 'right' = 'left'

export const getNavDirection = () => direction
export const setNavDirection = (d: 'left' | 'right') => { direction = d }

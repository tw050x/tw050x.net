import { Component } from '@kitajs/html'

/**
 * The `<Cross />` SVG component.
 *
 * @returns
 */
const Cross: Component = () => {
  return (
    <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
export default Cross;

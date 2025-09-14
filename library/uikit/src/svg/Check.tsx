import { Component } from '@kitajs/html'

/**
 * The `<Check />` SVG component.
 *
 * @returns
 */
const Check: Component = () => {
  return (
    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  )
}
export default Check;

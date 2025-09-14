import { Component } from '@kitajs/html'

/**
 * The `<Products />` SVG component.
 *
 * @returns
 */
const Products: Component = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9H21V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" fill="currentColor" />
      <rect x="3" y="7" width="18" height="2" fill="currentColor" />
      <path d="M8 7V3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3V7" stroke="white" stroke-width="2.5" fill="none" />
    </svg>
  )
}
export default Products;

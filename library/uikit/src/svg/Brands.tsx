import { Component } from '@kitajs/html'

/**
 * The `<Products />` SVG component.
 *
 * @returns
 */
const Products: Component = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5858 2.58579L21.4142 11.4142C22.1953 12.1953 22.1953 13.4587 21.4142 14.2398L14.2398 21.4142C13.4587 22.1953 12.1953 22.1953 11.4142 21.4142L2.58579 12.5858C2.21071 12.2107 2 11.7022 2 11.1716V4C2 2.89543 2.89543 2 4 2H11.1716C11.7022 2 12.2107 2.21071 12.5858 2.58579Z M7 5C8.10457 5 9 5.89543 9 7C9 8.10457 8.10457 9 7 9C5.89543 9 5 8.10457 5 7C5 5.89543 5.89543 5 7 5Z"
        fill="currentColor"
        fill-rule="evenodd"
      />
    </svg>
  )
}
export default Products;

import { Component } from '@kitajs/html'

/**
 * The `<Users />` SVG component.
 *
 * @returns
 */
const Users: Component = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="5" fill="currentColor"/>
      <path d="M4 19a8 8 0 0 1 16 0v2H4v-2z" fill="currentColor"/>
    </svg>
  )
}
export default Users;

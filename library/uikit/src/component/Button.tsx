import { Component } from "@kitajs/html";

type Props = {
  variant?: 'contained' | 'outlined' | 'text';
  type?: 'button' | 'submit' | 'reset';
};

/**
 * The `<Button />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Button: Component<Props> = ({ children, type = 'button', variant = 'text' }) => {
  let classes = [
    'px-12', 'py-4',
    'cursor-pointer',
    'rounded-lg',
    'focus:outline-none'
  ];
  switch (variant) {
    case 'contained':
      classes.push(...[
        'bg-blue-700 active:bg-blue-800',
        'active:scale-98',
        'text-white',
        'transition-transform duration-50'
      ]);
      break;
    case 'outlined':
      classes.push(...[
        'border border-blue-500',
        'text-blue-500'
      ]);
      break;
    case 'text':
      classes.push(...[
        'text-blue-500'
      ]);
      break;
  }

  return (
    <button class={classes} data-component="button" type={type}>
      {children}
    </button>
  )
}
export default Button;

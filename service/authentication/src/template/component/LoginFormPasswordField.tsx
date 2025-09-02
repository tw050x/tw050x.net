import { Component } from "@kitajs/html";

/**
 * Props for the `<LoginFormPasswordField />` component.
 */
type Props = {};

/**
 * The `<LoginFormPasswordField />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginFormPasswordField: Component<Props> = ({}) => {
  const containerClasses = [
    'relative',
    'border border-gray-600',
    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
    'rounded-lg',
    'p-2',
  ]
  const labelClasses = [
    'absolute',
    'bg-white',
    'px-2',
    'text-gray-600',
    'top-0 left-2',
    'transform -translate-y-1/2',
  ]
  const inputClasses = [
    'focus:outline-none',
    'p-2',
    'text-xl',
    'w-full',
  ]
  return (
    <div class={containerClasses}>
      <label for="password" class={labelClasses}>
        Password
      </label>
      <input type="password" id="password" name="password" required class={inputClasses} />
    </div>
  );
};

export default LoginFormPasswordField;

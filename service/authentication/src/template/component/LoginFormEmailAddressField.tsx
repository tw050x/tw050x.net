import { Component } from "@kitajs/html";

/**
 * Props for the `<LoginFormEmailAddressField />` component.
 */
type Props = {
  value: string;
};

/**
 * The `<LoginFormEmailAddressField />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginFormEmailAddressField: Component<Props> = ({ value }) => {
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
      <label for="email-address" class={labelClasses}>Email Address</label>
      <input type="text" id="email-address" name="email-address" value={value} required class={inputClasses} />
    </div>
  );
};

export default LoginFormEmailAddressField;

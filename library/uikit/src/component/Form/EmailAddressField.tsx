import { Component } from "@kitajs/html";

/**
 * Props for the `<EmailAddressField />` component.
 */
type Props = {
  autocomplete?: 'off' | 'email';
  value: string;
};

/**
 * The `<EmailAddressField />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const EmailAddressField: Component<Props> = ({ autocomplete = 'email', value }) => {
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
      <label class={labelClasses} for="email">
        Email Address
      </label>
      <input
        autocomplete={autocomplete}
        class={inputClasses}
        id="email"
        name="email"
        novalidate
        type="text"
        value={value}
      />
    </div>
  );
};

export default EmailAddressField;

import { Component } from "@kitajs/html";

/**
 * Props for the `<PasswordField />` component.
 */
type Props = {
  autocomplete: 'new-password' | 'current-password';
  id: string;
  label: string;
  name: string;
  onClickHandler?: string;
};

/**
 * The `<PasswordField />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const PasswordField: Component<Props> = ({ autocomplete: safeAutocomplete, id: safeId, label: safeLabel = 'Password', name: safeName, onClickHandler: safeOnClickHandler }) => {
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
  const iconClasses = [
    'absolute',
    'right-4',
    'top-1/2',
    'transform -translate-y-1/2',
    'cursor-pointer',
    'text-gray-600',
  ]

  const EyeClosedIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
    </svg>
  )

  const EyeOpenIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
    </svg>
  )

  return (
    <div class={containerClasses} id={safeId}>
      <label for={`${safeId}-input`} class={labelClasses}>
        {safeLabel}
      </label>
      <input
        autocomplete={safeAutocomplete}
        class={inputClasses}
        id={`${safeId}-input`}
        name={safeName}
        novalidate
        type="password"
      />
      <div class={iconClasses} hx-on:click={`${safeOnClickHandler}()`}>
        <span id="eye-closed-icon">
          {EyeClosedIcon}
        </span>
        <span id="eye-open-icon" class="hidden">
          {EyeOpenIcon}
        </span>
      </div>
    </div>
  );
};

export default PasswordField;

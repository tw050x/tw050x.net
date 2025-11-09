import { Component } from "@kitajs/html";

type Props = {};

/**
 * The `<LoginWithPasswordButton />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginWithPasswordButton: Component<Props> = () => {
  let classes = [
    'px-12', 'py-4',
    'cursor-pointer',
    'rounded-lg',
    'focus:outline-none',
    'border border-blue-500',
    'text-blue-500',
  ];

  return (
    <>
      <button
        class={classes}
        data-component="login-with-password-button"
        hx-inherit="hx-get hx-target hx-swap"
        type="button"
      >
        <div class="gsi-material-button-content-wrapper">
          <span class="gsi-material-button-contents">Login with password</span>
        </div>
      </button>
    </>
  )
}
export default LoginWithPasswordButton;

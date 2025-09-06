import { Component, escapeHtml } from "@kitajs/html";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as RegisterForm, Props as RegisterFormProps } from "./RegisterForm";

/**
 * Props for the `<RegisterAside />` component.
 */
export type Props =
| {
  registerFormProps: RegisterFormProps
}
| {
  disabled: true;
  message: string;
}

/**
 * The `<RegisterAside />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const RegisterAside: Component<Props> = (props) => {
  const headerClassOverrides = {
    container: ['mb-12'],
  }

  let safeRegisterForm;
  registerFormGuard: {
    if (('registerFormProps' in props) === false) break registerFormGuard;
    safeRegisterForm = (
      <div class="mb-12">
        <RegisterForm {...props.registerFormProps} />
      </div>
    );
  }

  let safeDisabledRegisterMessage;
  disabledRegisterMessageGuard: {
    if (('disabled' in props) === false) break disabledRegisterMessageGuard;
    safeDisabledRegisterMessage = (
      <Header classOverrides={headerClassOverrides} lead="Register" tier="h1">
        {escapeHtml(props.message)}
      </Header>
    )
  }

  return (
    <div>
      <div class="p-8">
        {safeDisabledRegisterMessage ?? (
          <>
            <Header classOverrides={headerClassOverrides} lead="Register" tier="h1">
              Create an account
            </Header>
            {safeRegisterForm}
            <div>
              <span class="text-gray-500">
                Already have an account? <a class="underline" href="/login">Login</a>.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default RegisterAside;

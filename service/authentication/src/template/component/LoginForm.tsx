import { Component } from "@kitajs/html";

/**
 * Props for the login document.
 */
type Props = {
  email?: string;
  nonce: string;
  validationErrors?: Array<{ message: string }>;
}

/**
 * The dashboard document.
 *
 * @param props
 */
const LoginForm: Component<Props> = ({ email = '', nonce, validationErrors = [] }) => {
  console.log('email', email);
  console.log('nonce', nonce);
  console.log('validationErrors', validationErrors);
  return (
    <div class="pt-8 px-8">
      <h1 class="text-4xl">Login</h1>
      <form>
        <label class="block mt-4">
          Email Address:
          <input type="email" name="email" value={email} />
        </label>

        <label class="block mt-4">
          Password:
          <input type="password" name="password" />
        </label>
      </form>
    </div>
  );
}
export default LoginForm;

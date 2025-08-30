import { Component } from "@kitajs/html";

/**
 * Props for the login document.
 */
type Props = {
  email?: string;
  validationErrors: Array<{ message: string }>;
}

/**
 * The dashboard document.
 *
 */
const LoginForm: Component<Props> = ({ email, validationErrors }) => {
  console.log('email', email);
  console.log('validationErrors', validationErrors);
  return (
    <form>
      <div>
        hello world
      </div>
    </form>
  );
}
export default LoginForm;

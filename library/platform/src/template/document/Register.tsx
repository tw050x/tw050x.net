import { Component } from "@kitajs/html";
import { default as Head } from "../component/Head.js";
import { default as RegisterAside, Props as RegisterAsideProps } from "../component/RegisterAside.js";

/**
 * Props for the `<Register />` component.
 */
type Props = {
  registerAsideProps: RegisterAsideProps;
}

/**
 * The `<Register />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Register: Component<Props> = ({ registerAsideProps }) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Register" />
        <body>
          <main class="bg-gray-800 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <aside>
              <RegisterAside {...registerAsideProps} />
            </aside>
          </div>
        </body>
      </html>
    </>
  );
}
export default Register;

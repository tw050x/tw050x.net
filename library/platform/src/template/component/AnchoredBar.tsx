import { Component } from "@kitajs/html";
import { readScript } from "@tw050x.net.library/static";
import { assertUnreachable } from "../../utility/assert-unreachable.js";

/**
 * Props for the `<AnchoredBar />` component.
 */
export type Props = {
  id: string;
  position: 'top' | 'bottom';
}

/**
 * The `<AnchoredBar />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const AnchoredBar: Component<Props> = (props) => {
  let positionalClasses;

  switch (props.position) {
    case 'top':
      positionalClasses = "fixed top-0 left-0 right-0 border-b";
      break;
    case 'bottom':
      positionalClasses = "fixed bottom-0 left-0 right-0 border-t";
      break;
    default:
      assertUnreachable(props.position);
  }

  //
  let anchoredBarEventListenerScript;
  try {
    anchoredBarEventListenerScript = readScript("anchored-bar-event-listener", {
      ID: props.id
    });
  }
  catch (error) {
    console.debug("Failed to load anchored-bar-event-listener script");
    console.error(error);
  }

  return (
    <div
      class={["bg-white border-gray-200 z-30 px-4 py-4", positionalClasses]}
      data-component="anchored-bar"
      id={props.id}
    >
      <div>
        {props.children}
      </div>
      <script>
        {anchoredBarEventListenerScript}
      </script>
    </div>
  )
}
export default AnchoredBar;

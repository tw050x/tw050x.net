import { Component } from "@kitajs/html";
import { assertUnreachable } from "@tw050x.net.library/utility/assert-unreachable";
import { default as readScript } from "../read-script.js";

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
    anchoredBarEventListenerScript = readScript("anchored-bar-event-listener");
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
        {anchoredBarEventListenerScript?.replace('{{ID_TO_REPLACE}}', props.id)}
      </script>
    </div>
  )
}
export default AnchoredBar;

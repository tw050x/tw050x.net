import { Component } from "@kitajs/html";
import { assertUnreachable } from "../../utility/assert-unreachable.js";
import { default as InfoIcon } from "../svg/Info.js";
import { default as ThankfulIcon } from "../svg/Thankful.js";
import { default as WarningIcon } from "../svg/Warning.js";

type Props = {
  classOverrides?: {
    container?: string | Array<string>;
  };
  type: "error" | "info" | "thankful" | "warning";
}

/**
 * The `<Notice />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Notice: Component<Props> = ({ children, classOverrides, type }) => {
  const containerClasses = [
    "rounded-lg",
    "flex",
    "items-center",
    "p-4",
    "text-sm",
  ]
  switch (type) {
    case "error":
      containerClasses.push("bg-red-100");
      containerClasses.push("border border-red-400");
      containerClasses.push("text-red-700");
      break;
    case "info":
      containerClasses.push("bg-blue-100");
      containerClasses.push("border border-blue-400");
      containerClasses.push("text-blue-700");
      break;
    case "thankful":
      containerClasses.push("bg-pink-100");
      containerClasses.push("border border-pink-400");
      containerClasses.push("text-pink-700");
      break;
    case "warning":
      containerClasses.push("bg-yellow-100");
      containerClasses.push("border border-yellow-400");
      containerClasses.push("text-yellow-700");
      break;
    default:
      assertUnreachable(type);
  }

  let Icon;
  switch (type) {
    case "error":
      Icon = (
        <svg class="w-6 h-6 text-red-500 mt-0.5 shrink-0" style="margin-right: .5rem;" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L22 20H2L12 2Z" fill="currentColor" rx="2" />
          <path d="M12 8V13M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      );
      break;
    case "info":
      Icon = <InfoIcon />;
      break;
    case "thankful":
      Icon = <ThankfulIcon />;
      break;
    case "warning":
      Icon = <WarningIcon />;
      break;
    default:
      assertUnreachable(type);
  }

  return (
    <div class={[...containerClasses, ...(classOverrides?.container ?? [])]} data-component="notice" data-component-type={type}>
      <div class="mr-4">
        {Icon}
      </div>
      <div class="flex-1">
        <span>{children}</span>
      </div>
    </div>
  );
}
export default Notice;

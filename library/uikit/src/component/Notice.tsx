import { Component } from "@kitajs/html";

type Props = {
  classOverrides?: {
    container?: string | Array<string>;
  };
  type: "error" | "info";
}

/**
 * The `<Notice />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Notice: Component<Props> = ({ children, classOverrides }) => {
  const containerClasses = [
    "errors",
    "bg-red-100",
    "border border-red-400 rounded-lg",
    "flex",
    "items-center",
    "p-4",
    "text-sm",
  ]
  return (
    <div class={[...containerClasses, ...(classOverrides?.container ?? [])]} data-component="notice">
      <svg class="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" style="margin-right: .5rem;" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L22 20H2L12 2Z" fill="currentColor" rx="2" />
        <path d="M12 8V13M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
      <div class="flex-1">
        <span>{children}</span>
      </div>
    </div>
  );
}
export default Notice;

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
    "bg-red-100",
    "border border-red-400 rounded-lg",
    "flex",
    "p-4",
    "text-sm",
  ]

  return (
    <div class={[...containerClasses, ...(classOverrides?.container ?? [])]}>
      <svg
        class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
        style="margin-right: .5rem; margin-top: 0.125rem;"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <div class="flex-1">
        {children}
      </div>
    </div>
  );
}
export default Notice;

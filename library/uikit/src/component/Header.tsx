import { Component } from "@kitajs/html";
import { assertUnreachable } from "@tw050x.net/utility/assert-unreachable";

type Props = {
  classOverrides?: {
    container?: string | Array<string>;
    follow?: string | Array<string>;
    lead?: string | Array<string>;
    main?: string | Array<string>;
  };
  follow?: string;
  lead?: string;
  tier: "h1" | "h2" | "h3" | "h4"
}

/**
 * The `<Header />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Header: Component<Props> = ({ children, classOverrides, follow, lead, tier }) => {
  let leadClasses = [
    "text-xl font-normal"
  ];
  let mainClasses: Array<string> = [];
  switch (tier) {
    case "h1":
      mainClasses = [
        "text-4xl font-bold"
      ];
      break;
    case "h2":
      mainClasses = [
        "text-3xl font-bold"
      ];
      break;
    case "h3":
      mainClasses = [
        "text-2xl font-bold"
      ];
      break;
    case "h4":
      mainClasses = [
        "text-xl font-bold"
      ];
      break;
    default:
      assertUnreachable(tier);
  }
  let followClasses = [
    "text-xl font-normal"
  ];

  let MainComponent = (
    <tag class={[...mainClasses, ...(classOverrides?.main ?? [])]} of={tier}>
      {children}
    </tag>
  )

  let LeadComponent;
  leadGuard: {
    if (lead === undefined) break leadGuard;
    if (lead === '') break leadGuard;
    LeadComponent = (
      <div class="mb-2">
        <span class={[...leadClasses, ...(classOverrides?.lead ?? [])]}>
          {lead}
        </span>
      </div>
    );
  }

  let FollowComponent;
  followGuard: {
    if (follow === undefined) break followGuard;
    if (follow === '') break followGuard;
    FollowComponent = (
      <div class="mb-4">
        <span class={[...followClasses, ...(classOverrides?.follow ?? [])]}>
          {follow}
        </span>
      </div>
    );
  }

  return (
    <div class={[...(classOverrides?.container ?? [])]}>
      {LeadComponent}
      {MainComponent}
      {FollowComponent}
    </div>
  );
}
export default Header;

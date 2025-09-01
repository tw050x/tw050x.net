// import { Component } from "@kitajs/html";
// import { assertUnreachable } from "@tw050x.net/utility/assert-unreachable"

// type Props = {
//   tier: "h1" | "h2" | "h3" | "h4"
// }

// /**
//  *
//  */
// const Header: Component<Props> = ({ children, tier }) => {
//   let classes;
//   switch (tier) {
//     case "h1":
//       classes = "text-4xl font-bold";
//       break;
//     case "h2":
//       classes = "text-3xl font-bold";
//       break;
//     case "h3":
//       classes = "text-2xl font-bold";
//       break;
//     case "h4":
//       classes = "text-xl font-bold";
//       break;
//     default:
//       assertUnreachable(tier);
//   }
//   return (
//     <tag class={classes} of={tier}>
//       {children}
//     </tag>
//   );
// }
// export default Header;

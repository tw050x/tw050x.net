
# JSX Copilot Instructions
This repo uses a JSX syntax embeded into .tsx files. JSX is provided by `@kitajs/html`. THIS IS NOT REACT. Do not suggest React code such as React imports or React hooks, or React attributes like className as none of these will work.

# HTMX Copilot Instructions
This repo uses HTMX for interactivity. Do not suggest code that uses other frameworks or libraries such as React, Vue, Angular, jQuery, etc. Do not suggest code that uses fetch or XMLHttpRequest. Use HTMX attributes such as hx-get, hx-post, hx-target, hx-swap, etc. Do not suggest code that uses event listeners or other JavaScript methods to handle interactivity. Use HTMX attributes to handle interactivity declaratively in the HTML.

# TypeScript Copilot Instructions
This repo uses TypeScript. Ensure all code suggestions are valid TypeScript. Use appropriate types and interfaces. Ensure type safety and avoid using any type unless absolutely necessary. Do not suggest using the "any" type.

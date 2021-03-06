// Elix is a JavaScript project, but we use TypeScript as an internal tool to
// confirm our code is type safe.

/// <reference path="shared.d.ts"/>

declare const ArrowDirectionMixin: Mixin<{}, {}> & {
  wrap: symbol;
};

export default ArrowDirectionMixin;

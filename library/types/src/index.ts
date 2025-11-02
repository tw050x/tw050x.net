
/**
 * Utility type that makes all properties in T deeply optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Helper type to extract new properties from OC, handling deep nesting
 */
export type NewPropertiesOnly<InputContext, OutputContext> = {
  [K in keyof OutputContext as K extends keyof InputContext
    ? InputContext[K] extends object
      ? OutputContext[K] extends object
        ? K
        : never
      : never
    : K
  ]?: K extends keyof InputContext
    ? InputContext[K] extends object
      ? OutputContext[K] extends object
        ? NewPropertiesOnly<InputContext[K], OutputContext[K]>
        : never
      : never
    : OutputContext[K];
};


export interface DatabaseDocument {
  createdAt: Date;
  updatedAt?: Date;
}

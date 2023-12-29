
export const BackendSchema = {
  name: {
    type: 'string',
    required: true,
    get() {
      let result = (this as any).$name
      if (!result) {
        const ctor = (this as any).constructor
        result = ctor.formatNameFromClass(ctor)
      }
      return result;
    },
    set(value: string) {
      if (value) {(this as any).$name = value}
    },
    description: 'the unique name of the backend',
  },
  url: {
    type: 'string',
    description: 'the backend url',
  },
  enabled: {
    type: 'boolean',
    // the default value is true
    value: true,
    description: 'enable the backend or not',
  },
  icon: {
    type: 'string',
    description: 'the icon name of the backend',
  },
  displayName: {
    type: 'string',
    description: 'the backend display name',
  },
  alias: {
    type: ['string', 'array'],
    items: {
      type: 'string',
    },
    description: 'the another unique name of the backend',
  },
  description: {
    type: 'string',
    description: 'the optional description of the backend',
  }
}


export interface BackendProps {
  name: string,
  /**
   * the backend whether is enabled, defaults to true
   */
  enabled: boolean,
  icon?: boolean,
  displayName?: string,
  alias?: string|string[],
  description?: string,
  url?: string,
  [k: string]: any,
}


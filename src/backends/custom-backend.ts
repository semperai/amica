import type { JSONSchemaType } from 'ajv';
import { addFactoryAbility, CustomFactory, ICustomFactoryOptions, isString } from 'custom-factory';
import { PropDescriptors, Properties, PropertyAbility } from 'property-manager';
import type { RJSFSchema } from '@rjsf/utils';

const CUstomBackendSchema = {
  name: {
    type: 'string',
    required: true,
    get() {
      let result = (this as any).$name
      if (!result) {
        const ctor = (this as any).constructor
        result = CustomBackend.formatNameFromClass(ctor)
      }
      return result;
    },
    set(value: string) {
      if (value) {(this as any).$name = value}
    },
    description: 'the unique name of the backend',
  },
  enabled: {
    type: 'boolean',
    // the default value is true
    value: true,
    description: 'enable the backend or not',
  },
  icon: {
    type: 'string',
    configurable: true,
    description: 'the icon name of the backend',
  },
  displayName: {
    type: 'string',
    configurable: true,
    description: 'the backend display name',
  },
  alias: {
    type: ['string', 'array'],
    items: {
      type: 'string',
    },
    configurable: true,
    description: 'the another unique name of the backend',
  },
  description: {
    type: 'string',
    configurable: true,
    description: 'the optional description of the backend',
  }
}


export interface CustomBackendProps {
  name: string,
  /**
   * the backend whether is enabled, defaults to true
   */
  enabled: boolean,
  icon?: boolean,
  displayName?: string,
  alias?: string|string[],
  description?: string,
  [k: string]: any,
}

export declare namespace CustomBackend {
  let isDir: boolean;
  let _children: {[name: string]:any|typeof CustomBackend};
  // function register(aClass: typeof CustomBackend | undefined, aParentClass?: typeof CustomBackend, aOptions?: (ICustomFactoryOptions | any) | undefined): boolean;
  // function register(aClass: typeof CustomBackend | undefined, aOptions?: (ICustomFactoryOptions | any) | undefined): boolean;
  function formatNameFromClass(aClass: Function, aBaseNameOnly?: number): string;
  function _register(aClass: Function, aOptions?: (ICustomFactoryOptions | any) | undefined): boolean;
  function _registerWithParent(aClass: typeof CustomBackend, aParentClass: typeof CustomBackend, aOptions?: ICustomFactoryOptions): boolean;
  function registeredClass(aName?: string): false | typeof CustomBackend;
  function _findRootFactory(aClass: typeof CustomBackend): typeof CustomBackend|undefined;
  function forEach(cb: (ctor: typeof CustomBackend, name: string) => 'brk' | string | undefined): typeof CustomBackend;

  function defineProperties(aTarget: Function, aProperties: PropDescriptors, recreate?:boolean): Properties;
  function toJSON(): CustomBackendProps;
}

export declare interface CustomBackend extends CustomBackendProps {
  initialize(args?: any): void;
}

export class CustomBackend {
  static schema: RJSFSchema;
  static ROOT_NAME = 'Backend';
  static enabled = true;
  static _baseNameOnly = 1;
  static findRootFactory() {
    return this._findRootFactory(CustomBackend);
  }

  /**
   * registered items
   */
  static get items() {
    return this._children as {[key: string]: typeof CustomBackend}
  }

  static registerBackend(aBackend: typeof CustomBackend, aOptions?: ICustomFactoryOptions) {
    if (!aOptions) {aOptions = {}}
    aOptions.isFactory = true;
    aBackend.isDir = true;
    const result = this._registerWithParent(aBackend, this, aOptions);
    if (result && !aBackend.hasOwnProperty('_children')) {aBackend._children = {}};
    return result;
  }

  static register(aBackend: Function, aOptions?: ICustomFactoryOptions) {
    if (!aOptions) {aOptions = {}}
    aOptions.isFactory = false;
    if ((aBackend as any).isDir === true){
      (aBackend as any).isDir = false;
    }
    return this._register(aBackend, aOptions);
  }

  declare private $name: string|undefined;

  constructor(args?: any, BackendType?: string|typeof CustomBackend|false) {
    if (typeof BackendType === 'string') {
      BackendType = CustomBackend.registeredClass(BackendType)
    }
    if (this.constructor === CustomBackend) {
      if (!BackendType) throw new TypeError('can not determine the value type.')
      if (BackendType !== CustomBackend) return new BackendType(args)
    }
    this.initialize(args);
    if (this.enabled === undefined) {
      this.enabled = true;
    }
    // this.name
  }
}

CustomBackend.prototype.name = 'Backend';

addFactoryAbility(CustomBackend, {exclude: ['@register']})
PropertyAbility(CustomBackend)

CustomBackend.defineProperties(CustomBackend, CUstomBackendSchema)

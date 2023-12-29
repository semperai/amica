import type { JSONSchemaType } from 'ajv';
import { addFactoryAbility, CustomFactory, isString } from 'custom-factory';
import { PropDescriptors, Properties, PropertyAbility as addPropertyAbility } from 'property-manager';
import type { RJSFSchema } from '@rjsf/utils';
import type { ICustomFactoryOptions } from 'custom-factory';
import { BackendProps, BackendSchema } from './backend-options';

type BackendClassForEachFn = (ctor: typeof Backend, name: string) => 'brk' | string | undefined;

export declare namespace Backend {
  let isDir: boolean;
  // ------ properties and methods injected via custom-factory
  let _children: {[name: string]:any|typeof Backend};
  /**
   * format(transform) the name to be registered for the aClass
   * @param {*} aClass
   * @param {number} [aBaseNameOnly]
   * @returns {string} the name to register
   */
  function formatNameFromClass(aClass: Function, aBaseNameOnly?: number): string;
  /**
   * register the aClass to the factory
   * @internal
   * @param {Function} aClass the class to register the Factory
   * @param {ICustomFactoryOptions|any} [aOptions] the options for the class and the factory
   * @returns {boolean} return true if successful.
   */
  function _register(aClass: Function, aOptions?: (ICustomFactoryOptions | any) | undefined): boolean;
  function _registerWithParent(aClass: typeof Backend, aParentClass: typeof Backend, aOptions?: ICustomFactoryOptions): boolean;
  /**
   * Check the name, alias or itself whether registered.
   * @param name the registered item name or alias
   * @returns the registered class if registered, otherwise returns false
   */
  function registeredClass(name: string|undefined): false|typeof Backend;
  /**
   * find the real root factory
   *
   * @internal
   */
  function _findRootFactory(aClass: typeof Backend): typeof Backend|undefined;
  /**
   * executes a provided callback function once for each registered element.
   * @param {BackendClassForEachFn} cb the forEach callback function
   * @returns {this}
   */
  function forEach(cb: BackendClassForEachFn): typeof Backend;
  /**
   * unregister this class in the factory
   * @param {string|Function|undefined} aName the registered name or class, no name means unregister itself.
   * @returns {boolean} true means successful
   */
  function unregister(aName: string|Function|undefined): boolean;

  // ------ properties and methods injected via property-manager
  /**
   *  Define the attributes of the target class.
   * @param aTarget the target class to define attributes
   * @param {PropDescriptors} aProperties the attribute descriptors
   * @param {boolean} [recreate] Whether recreating the $attributes
   */
  function defineProperties(aTarget: Function, aProperties: PropDescriptors, recreate?:boolean): Properties;
  /**
   * Get the attribute descriptors of the class
   */
  function getProperties(): any;
  function toJSON(): BackendProps;
}

export declare interface Backend extends BackendProps {
  initialize(args?: any): void;
}

export class Backend {
  static schema: RJSFSchema;
  // static ROOT_NAME = 'Backend';
  static enabled = true;
  static _baseNameOnly = 1;
  // overwrite it to specify the root factory class
  static findRootFactory() {
    return this._findRootFactory(Backend);
  }

  /**
   * registered items
   */
  static get items() {
    return this._children as {[key: string]: typeof Backend}
  }

  /**
   * register the aClass as sub-factory item to the factory
   * @param aBackend the class to register the Factory
   * @param {ICustomFactoryOptions|any} [aOptions] the options for the class and the factory
   * @returns {boolean} return true if successful.
   */
  static register(aBackend: typeof Backend, aOptions?: ICustomFactoryOptions|any) {
    if (!aOptions) {aOptions = {}}
    aOptions.isFactory = true;
    aBackend.isDir = true;
    const result = this._registerWithParent(aBackend, this, aOptions);
    if (result && !aBackend.hasOwnProperty('_children')) {aBackend._children = {}};
    return result;
  }

  /**
   * register a class as product item to the current factory
   * @param {Function} aBackend the class to register the Factory
   * @param {ICustomFactoryOptions|any} [aOptions] the options for the class and the factory
   * @returns {boolean} return true if successful.
   */
  static registerItem(aBackend: Function, aOptions?: ICustomFactoryOptions|any) {
    if (!aOptions) {aOptions = {}}
    aOptions.isFactory = false;
    if ((aBackend as any).isDir === true){
      (aBackend as any).isDir = false;
    }
    return this._register(aBackend, aOptions);
  }

  declare private $name: string|undefined;

  constructor(args?: any, BackendType?: string|typeof Backend|false) {
    if (typeof BackendType === 'string') {
      BackendType = Backend.registeredClass(BackendType);
    }
    if (this.constructor === Backend) {
      if (!BackendType) throw new TypeError('can not determine the backend type.')
      if (BackendType !== Backend) return new BackendType(args)
    }
    this.initialize(args);
    if (this.enabled === undefined) {
      this.enabled = true;
    }
    // this.name
  }
}

addFactoryAbility(Backend, {exclude: ['@register']})
addPropertyAbility(Backend)

Backend.defineProperties(Backend, BackendSchema)

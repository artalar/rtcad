declare const UniqueSymbol: unique symbol
type UniqueType<T, Name extends string> = T &
  (Name extends string ? { [UniqueSymbol]: Name } : never)

type OR<T extends any[]> = T[number]

type AND<T extends any[]> = {
  step: ((...args: T) => any) extends ((x: infer X, ...xs: infer Xs) => any)
    ? Xs extends []
      ? X
      : X & AND<Xs>
    : never
  end: never
}[T extends [] ? 'end' : 'step']
// https://github.com/Microsoft/TypeScript/issues/29594#issuecomment-507701193

type Validator<T> =
  | ((thing: unknown) => thing is T)
  | ((thing: unknown) => string)

class ValidationError extends TypeError {
  data: Runtype<any>

  constructor(message: string, data: Runtype<any>) {
    super(`[rtcad] ${message}`)

    this.data = data
  }
}

// @ts-ignore
const noopPositive: Validator<any> = () => true

const IS = {
  undefined: (thing: unknown): thing is undefined =>
    typeof thing === 'undefined',
  null: (thing: unknown): thing is null => thing === null,
  boolean: (thing: unknown): thing is boolean => typeof thing === 'boolean',
  number: (thing: unknown): thing is number => typeof thing === 'number',
  string: (thing: unknown): thing is string => typeof thing === 'string',
  symbol: (thing: unknown): thing is symbol => typeof thing === 'symbol',
  function: (thing: unknown): thing is (...a: any[]) => any =>
    typeof thing === 'function',
  object: (thing: unknown): thing is object =>
    typeof thing === 'object' && thing !== null,
  array: (thing: unknown): thing is Array<any> => Array.isArray(thing),
}

export class Runtype<Type = unknown> {
  name: string
  description: string | null
  refinementStack: string[]
  validator: Validator<Type>

  constructor(
    options:
      | Validator<Type>
      | {
          name?: string
          description?: string
          refinementStack?: string[]
          validator?: Validator<Type>
        },
  ) {
    if (IS.function(options)) options = { validator: options }
    else if (!IS.object(options))
      throw new TypeError('Unexpected Runtype options')

    const {
      name = 'unnamed runtype',
      description = null,
      refinementStack = [name],
      validator = noopPositive,
    } = options

    if (
      !IS.string(name) ||
      !(IS.null(description) || IS.string(description)) ||
      !IS.array(refinementStack) ||
      !IS.function(validator)
    )
      throw new TypeError('Unexpected Runtype options')

    this.name = name
    this.description = description
    this.validator = validator
    this.refinementStack = refinementStack
  }

  validate<T>(thing: T): T extends Type ? null : ValidationError {
    const result = this.validator(thing)
    // @ts-ignore
    return result === true
      ? null
      : new ValidationError(result || `Invalid type; in: ${this.name}`, this)
  }
  guard(thing: unknown): thing is Type {
    return this.validator(thing) === true ? true : false
  }
  ensure(thing: unknown): Type {
    const result = this.validate(thing)
    if (result === null) return thing as Type
    throw result
  }
  // https://medium.com/@gcanti/refinements-with-flow-9c7eeae8478b
  refine<
    RefinementType extends Type = Type,
    RefinementTypeName extends string | null = null
  >(
    ...a:
      | [(thingTyped: Type) => boolean | string]
      | [RefinementTypeName, (thingTyped: Type) => boolean | string]
  ): Runtype<
    RefinementTypeName extends string
      ? UniqueType<RefinementType, RefinementTypeName>
      : RefinementType
  > {
    const validator = a.pop() as (thingTyped: Type) => boolean | string
    const name = (a.pop() || this.name) as string
    const refinementStack =
      this.refinementStack[0] === name
        ? this.refinementStack
        : [name, ...this.refinementStack]
    const parentValidator = this.validator

    return new Runtype({
      name,
      refinementStack,
      validator: ((value: unknown) => {
        const parentValidationResult = parentValidator(value)
        if (parentValidationResult !== true) return parentValidationResult

        const validationResult = validator(value as Type)

        if (validationResult === true) return true

        return (
          (validationResult || `Invalid type`) +
          `; in: ` +
          refinementStack.join('; in: ')
        )
      }) as any,
    })
  }
}

export type Static<T extends Runtype<any>> = T extends Runtype<infer t>
  ? t
  : never

export const t = {
  Undefined: new Runtype({
    name: 'undefined',
    validator: (thing: unknown): thing is undefined =>
      IS.undefined(thing) || ((`Invalid undefined` as any) as false),
  }),
  Null: new Runtype({
    name: 'null',
    validator: (thing: unknown): thing is null =>
      IS.null(thing) || ((`Invalid null` as any) as false),
  }),
  Boolean: new Runtype({
    name: 'boolean',
    validator: (thing: unknown): thing is boolean =>
      IS.boolean(thing) || ((`Invalid boolean` as any) as false),
  }),
  Number: new Runtype({
    name: 'number',
    validator: (thing: unknown): thing is number =>
      IS.number(thing) || ((`Invalid number` as any) as false),
  }),
  String: new Runtype({
    name: 'string',
    validator: (thing: unknown): thing is string =>
      IS.string(thing) || ((`Invalid string` as any) as false),
  }),
  Symbol: new Runtype({
    name: 'symbol',
    validator: (thing: unknown): thing is symbol =>
      IS.symbol(thing) || ((`Invalid symbol` as any) as false),
  }),
  Function: new Runtype({
    name: 'function',
    validator: (thing: unknown): thing is (...a: any[]) => any =>
      IS.function(thing) || ((`Invalid function` as any) as false),
  }),
  Object: new Runtype({
    name: 'object',
    validator: (thing: unknown): thing is object =>
      IS.object(thing) || ((`Invalid object` as any) as false),
  }),
  Array: new Runtype({
    name: 'array',
    validator: (thing: unknown): thing is Array<any> =>
      IS.array(thing) || ((`Invalid array` as any) as false),
  }),
}

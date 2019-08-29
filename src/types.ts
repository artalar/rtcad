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

export class ValidationError extends TypeError {
  data: Runtype<any>

  constructor(message: string, data: Runtype<any>) {
    super(`[rtcad] ${message}`)

    this.data = data
  }
}

// @ts-ignore
const noopPositive: Validator<any> = () => true

const IS = {
  never: (thing: unknown): thing is never => true,
  undefined: (thing: unknown): thing is undefined =>
    typeof thing === 'undefined',
  null: (thing: unknown): thing is null => thing === null,
  boolean: (thing: unknown): thing is boolean => typeof thing === 'boolean',
  number: (thing: unknown): thing is number => typeof thing === 'number',
  bigint: (thing: unknown): thing is bigint => typeof thing === 'bigint',
  string: (thing: unknown): thing is string => typeof thing === 'string',
  symbol: (thing: unknown): thing is symbol => typeof thing === 'symbol',
  function: (thing: unknown): thing is (...a: any[]) => any =>
    typeof thing === 'function',
  object: (thing: unknown): thing is object =>
    typeof thing === 'object' && thing !== null,
  array: (thing: unknown): thing is Array<any> => Array.isArray(thing),
  map: (thing: unknown): thing is Map<any, any> =>
    thing && thing instanceof Map,
  set: (thing: unknown): thing is Set<any> => thing && thing instanceof Set,
}

export class Runtype<Type = unknown> {
  title: string
  description: string | null
  refinementStack: string[]
  validator: Validator<Type>

  constructor(
    options:
      | Validator<Type>
      | {
          title?: string
          description?: string
          refinementStack?: string[]
          validator?: Validator<Type>
        },
  ) {
    if (IS.function(options)) options = { validator: options }
    else if (!IS.object(options))
      throw new TypeError('Unexpected Runtype options')

    const {
      title = 'unnamed runtype',
      description = null,
      refinementStack = [title],
      validator = noopPositive,
    } = options

    if (
      !IS.string(title) ||
      !(IS.null(description) || IS.string(description)) ||
      !IS.array(refinementStack) ||
      !IS.function(validator)
    )
      throw new TypeError('Unexpected Runtype options')

    this.title = title
    this.description = description
    this.validator = validator
    this.refinementStack = refinementStack
  }

  validate<T>(thing: T): T extends Type ? null : ValidationError {
    const result = this.validator(thing)
    // @ts-ignore
    return result === true
      ? null
      : new ValidationError(result || `Invalid type; in: ${this.title}`, this)
  }
  guard(thing: unknown): thing is Type {
    return this.validator(thing) === true
  }
  /** Ensure that payload is valid type and return it or throw ValidationError */
  ensure(thing: unknown): Type {
    const result = this.validate(thing)
    if (!result) return thing as Type
    throw result
  }
  // https://medium.com/@gcanti/refinements-with-flow-9c7eeae8478b
  /**
   * Statically (and runtime) constrict type.
   *
   * If first argument is string return unique static type
   * binded to the type title
   * */
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
    const title = (a.pop() || this.title) as string
    const refinementStack =
      this.refinementStack[0] === title
        ? this.refinementStack
        : [title].concat(this.refinementStack)
    const parentValidator = this.validator

    // `title` ensures by new Runtype
    if (!IS.function(validator))
      throw new TypeError('Unexpected Runtype.refine validator')

    return new Runtype({
      title,
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

  toJSON() {
    // TODO: add `rtcad` prefix?
    return this.title
  }
}

export type Static<T extends Runtype<any>> = T extends Runtype<infer t>
  ? t
  : never

const ObjectRT = new Runtype({
  title: 'object',
  validator: IS.object,
})

export type LiteralBase = undefined | null | boolean | number | string

// TODO: https://github.com/pelotom/runtypes/tree/master/src/types
export const t = {
  Never: new Runtype({
    title: 'never',
    validator: IS.never,
  }),
  Undefined: new Runtype({
    title: 'undefined',
    validator: IS.undefined,
  }),
  Null: new Runtype({
    title: 'null',
    validator: IS.null,
  }),
  Boolean: new Runtype({
    title: 'boolean',
    validator: IS.boolean,
  }),
  Number: new Runtype({
    title: 'number',
    validator: IS.number,
  }),
  Bigint: new Runtype({
    title: 'bigint',
    validator: IS.bigint,
  }),
  String: new Runtype({
    title: 'string',
    validator: IS.string,
  }),
  Symbol: new Runtype({
    title: 'symbol',
    validator: IS.symbol,
  }),
  Function: new Runtype({
    title: 'function',
    validator: IS.function,
  }),
  Object: Object.assign(
    <T extends { [key: string]: Runtype<any> }>(
      shape: T,
    ): Runtype<
      { [key in keyof T]: T[key] extends Runtype<infer RT> ? RT : never }
    > => {
      const title = JSON.stringify(shape)
      const keys = Object.keys(shape)

      if (title === '{}') console.log('wat?', shape.data.toJSON)

      return new Runtype({
        title,
        validator: ((thing: unknown) => {
          const isObject = t.Object.validator(thing)
          if (!IS.object(thing)) return `Invalid object`

          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const runtype = shape[key]
            const result = runtype.validator((thing as any)[key])
            if (result !== true) {
              const error = result || `Invalid type`
              return `Invalid type "${runtype.title}" of "${key}": ${error}; in ${title}`
            }
          }

          return true
        }) as any,
      })
    },
    ObjectRT,
  ),
  Array: new Runtype({
    title: 'array',
    validator: IS.array,
  }),
  Map: new Runtype({
    title: 'map',
    validator: IS.map,
  }),
  Set: new Runtype({
    title: 'set',
    validator: IS.set,
  }),
  Literal: <T extends LiteralBase>(literal: T) =>
    new Runtype({
      title: 'literal',
      validator: (thing: unknown): thing is T =>
        thing === literal || ((`Payload is not "${literal}"` as any) as false),
    }),
  And: <T extends Runtype<any>[]>(
    ...runtypes: T
  ): Runtype<
    AND<{ [key in keyof T]: T[key] extends Runtype<infer RT> ? RT : never }>
  > =>
    new Runtype({
      title: runtypes.map(runtype => runtype.title).join(' & '),
      validator: ((thing: unknown) => {
        for (let i = 0; i < runtypes.length; i++) {
          const runtype = runtypes[i]
          const result = runtype.validator(thing)
          if (result !== true)
            return result || `Invalid type; in: ${runtype.title}`
        }
        return true
      }) as any,
    }),
  Or: <T extends Runtype<any>[]>(
    ...runtypes: T
  ): Runtype<
    OR<{ [key in keyof T]: T[key] extends Runtype<infer RT> ? RT : never }>
  > =>
    new Runtype({
      title: runtypes.map(runtype => runtype.title).join(' | '),
      validator: ((thing: unknown) => {
        const errors: (string)[] = []
        for (let i = 0; i < runtypes.length; i++) {
          const runtype = runtypes[i]
          const result = runtype.validator(thing)
          if (result !== true)
            errors.push(result || `Invalid type; in: ${runtype.title}`)
        }
        return errors.length !== runtypes.length || errors.join(' |\n')
      }) as any,
    }),
}

// FIXME: WAT? tests is fail without it
t.Object.toJSON = ObjectRT.toJSON

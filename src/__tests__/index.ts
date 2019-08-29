import { Static, t } from '../index'

describe('rtcad', () => {
  describe('refine', () => {
    test('basic example', () => {
      const Email = t.String.refine(
        'email',
        str => str.includes('@') || 'Is not email',
      )
      const Password = t.String.refine(
        'password',
        str => str.length >= 8 || 'To short password',
      )

      function send(
        email: Static<typeof Email>,
        password: Static<typeof Password>,
      ) {
        /* ... */
      }

      var email = Email.ensure('a@b.c')
      var password = Password.ensure('12345678')

      // static type ok
      send(email, password)

      // static type error
      send('a@b.c', '12345678')

      // static type error
      send(password, email)
    })
    // test('real world example', () => {
    //   // https://englishfull.ru/znat/inn-po-angliyski.html
    // })
    test('nested', () => {
      const topPasswords = ['12345678a']

      const Password = t.String.refine(
        'password',
        str => str.length >= 8 || 'To short password',
      )
        .refine(
          str =>
            Boolean(str.match(/[^0-9]/)) ||
            'Password can not contains only numbers',
        )
        .refine(
          'real password',
          str => !topPasswords.includes(str) || 'Unsafe password',
        )

      expect(() => Password.ensure('1234567')).toThrowError(
        '[rtcad] To short password; in: password; in: string',
      )
      expect(() => Password.ensure('12345678')).toThrowError(
        '[rtcad] Password can not contains only numbers; in: password; in: string',
      )
      expect(() => Password.ensure('12345678a')).toThrowError(
        '[rtcad] Unsafe password; in: real password; in: password; in: string',
      )
      expect(Password.ensure('12345678a!')).toBe('12345678a!')
    })
  })
  describe('types', () => {
    test('Object', () => {
      const User = t.Object({
        id: t.Number,
        name: t.String,
      })

      expect(() => User.ensure(null)).toThrowError('[rtcad] Invalid object')
      expect(() => User.ensure({})).toThrowError(
        '[rtcad] Invalid type "number" of "id": Invalid type; in {"id":"number","name":"string"}',
      )
      expect(() => User.ensure({ id: 1 })).toThrowError(
        '[rtcad] Invalid type "string" of "name": Invalid type; in {"id":"number","name":"string"}',
      )
      expect(User.guard({ id: 1, name: 'Joe' })).toBe(true)
    })
  })
  describe('And', () => {
    const One = t.And(t.Literal(1))

    expect(() => One.ensure(2)).toThrowError('[rtcad] Payload is not "1"')
    expect(One.guard(1)).toBe(true)

    const Password = t.And(
      t.String.refine(str => str.length >= 8 || 'To short password'),
      t.String.refine(
        str =>
          Boolean(str.match(/[^0-9]/)) ||
          'Password can not contains only numbers',
      ),
    )

    expect(() => Password.ensure('1234567')).toThrowError(
      '[rtcad] To short password; in: string',
    )
    expect(() => Password.ensure('12345678')).toThrowError(
      '[rtcad] Password can not contains only numbers; in: string',
    )
    expect(Password.guard('12345678a')).toBe(true)
  })
  describe('Or', () => {
    const Role = t.Or(t.Literal('user'), t.Literal('admin'))

    expect(() => Role.ensure('developer')).toThrowError(
      '[rtcad] Payload is not "user" |\n' + 'Payload is not "admin"',
    )
    expect(Role.guard('user')).toBe(true)
    expect(Role.guard('admin')).toBe(true)

    const NetworkResponse = t.Or(
      t.Object({
        error: t.String,
      }),
      t.Object({
        data: t.Object,
      }),
    )

    expect(() => NetworkResponse.ensure({})).toThrowError(
      '[rtcad] Invalid type "string" of "error": Invalid type; in {"error":"string"} |\n' +
        'Invalid type "object" of "data": Invalid type; in {"data":"object"}',
    )
    expect(NetworkResponse.guard({ error: 'error' })).toBe(true)
    expect(NetworkResponse.guard({ data: [] })).toBe(true)
  })
})

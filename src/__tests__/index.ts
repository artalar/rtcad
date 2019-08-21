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
})

## WORK IN PROGRESS

Current status: proof of concept

# rtcad
> runtime type checking and documentation

### Motivation

- friendly api for **type definition** and **documentation** (both in one place)
- friendly api for design by contract (optionally remove in production)
- **type inference** for TypeScript and Flow **without use it** manually
- easy automatically documentation by **MD** syntax (GitBook / Docusaurus)
- useful suggestions in IDE and error description
- [hopefully] automatically generated autotests

> "friendly" / "easy" / "useful" - because of its most important target of this project

### [target] Example

> source code in this repo implements diferent version of API. You can look tests, but it is legacy.

```javascript
// declare type with description
const Email = t`simple e-mail validation ${email => email.contains('@')}`;
const Password = t`password ${password => password.length >= 6}`;
// declare type without description
const ErrorApi = t(e => e instanceof Error);

const User = t`user data ${t.shape({
  id: t.number,
  name: t.string,
  avatar: t(url => url.startsWith('http')),
})}`;

/*[1]*/export const authUser = t`
  # Return detailed user data from auth service
  > set auth token to cookies
  - ${[Email, Password]}
  - ${t.async(User, ErrorApi)}
`(
  (email, password) => api.get(`/user`, { email, password })
);

// Equal

/*[2]*/export const authUser = t`
  # Return detailed user data from auth service
  > set auth token to cookies
  - ${[
    t`simple e-mail validation ${email => email.contains('@')}`,
    t`password ${password => password.length >= 6}`
  ]}
  - ${t.async(
      t`user data ${t.shape({
        id: t.number,
        name: t.string,
        avatar: t(url => url.startsWith('http')),
      })}`,
      t(e => e instanceof Error)
  )}
`(
  (email, password) => api.get(`/user`, { email, password })
);

// Equal

/*[3]*/export const authUser = t([],
  [email => email.contains('@'), password => password.length >= 6],
  t.async(
    t.shape({ id: t.number, name: t.string, avatar: t(url => url.startsWith('http')) }),
    t(e => e instanceof Error)
  )
)(
  (email, password) => api.get(`/user`, { email, password })
);

// Equal

/*[4]*/export const authUser = t([],
  [Email, Password],
  t.async(User, ErrorApi)
)(
  (email, password) => api.get(`/user`, { email, password })
);
```

<!--
TODO:
* study
    * http://usejsdoc.org 
      > https://code-examples.net/ru/docs/jsdoc
    * https://en.wikipedia.org/wiki/Design_by_contract
* write needed functionality on a road map
    * description syntax
      > MD (reason - convert to gitbook)
    * checks native types
    * checks user types (+ API for that)
    * API for literals range
    * IDE extensions for tips
    * documentation generator
    * codemon for convert JSDoc to rtcad
    * write autotests core
    * write autotests UI-manager
    * ...
-->

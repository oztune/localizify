# localizify

Browserify plugin that takes as input a file:

```
// file.js
require('./file.json')
...
```

And browserify options:

```
browserify(..., {
  transform: ['localizify'],
  localizify: {
    locale: 'es'
  }
})
```

And outputs:

```
require('./file.es.json')
```

But only if `file.es.json` actually exists.

TODO:
- Merge string files with the base file.
- How to handle base language being different in different libraries?

# cerebral-falcor-module [experimental]

Transparently syncs your [cerebral](http://www.cerebraljs.com/) model with [falcor](http://netflix.github.io/falcor/)'s cache, intelligently caching client data.

Whenver a change is fired by falcor, `cererbral-falcor` diffs falcor's cache with your cererbral model's current state. It calculates the difference, patching the changed data to cerebral. This happens in the background, allowing your components to synchronosly bind to cerebral and update the UI.

Install
------------
`npm install cerebral-falcor-modules`

*Note*: only works with `cerebral v0.28.0`, not currently published on npm

Usage
------------
- Register the module in cerebral:

```js
// main.js
import FalcorModule from 'cerebral-falcor-module';

controller.register({
  falcor: FalcorModule({
    source: '/model.json',
    model: model
  })
});
```
- falcor will now be available to your actions as a `service`:
 
```js
const getTodosLength = ({output, services}) => {
  services.falcor.get(['todosLength']).
    then(response => output(response.json)).
    catch(response => output.error);
}
``` 

API (Incomplete)
--------
- `get(path)`
- `call(functionPath, args, refPaths, thisPaths)`

TODO
---------
- expose `set`
- accept falcor initialization options `{}`
- perf audit
- tests

Thanks
--------
- @ekosz for his `falcor-expand-cache` package, which makes the diff and patch strategy possible. Also for `redux-falcor` for the general approach.

# cerebral-falcor-module [experimental]

Transparently syncs your [cerebral](http://www.cerebraljs.com/) model with [falcor](http://netflix.github.io/falcor/)'s cache, intelligently caching client data.

Whenver a change is fired by falcor, `cererbral-falcor` diffs falcor's cache with your cererbral model's current state. It calculates the difference, patching the changed data to cerebral. This happens in the background, allowing your components to synchronosly bind to cerebral and update the UI.

*Note*: `falcor --> cerebral` data synchronization is *unidirectional*, meaning updates to the falcor cache are pushed to cerebral, but not vice-versa. All changes to falcor data are through the exposed falcor API (get, set, call).

Falcor's data is namespaced in your model to prevent overwriting cerebral only data. The defalut namespace for retreiving falcor data is falcor: `{ falcor: {} }`.

**Basic Todo Demo:** https://github.com/bfitch/cerebral-falcor-todos

Install
------------
`npm install cerebral-falcor-module`

Usage
------------
- Register the module in cerebral:

```js
// main.js
import FalcorModule from 'cerebral-falcor-module';

controller.register({
  falcor: FalcorModule({
    model: model // source defaults to: '/model.json',
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

- get state from cerebral:
```js
({state}) => {
  state.get(['falcor', 'todos']);
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

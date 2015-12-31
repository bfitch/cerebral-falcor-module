import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import _expandCache from 'falcor-expand-cache';
import _diff from 'deep-diff';

export default function(options, expandCache=_expandCache, diff=_diff) {
  const model = options.model;

  const falcorModel = new falcor.Model({
    source: new HttpDataSource(options.source)
  });

  falcorModel._root.onChange = function() {
    const falcorCache   = expandCache(falcorModel.getCache());
    const falcorChanges = diff(model.tree.get(), falcorCache);
    falcorChanges.forEach(change => model.tree.set(change.path, change.rhs));
  }

  return {
    init({name, controller}) {
    },
    services: {
      get(query) {
        return falcorModel.get(query)
      },
      call(functionPath, args, refPaths, thisPaths=[]) {
        return falcorModel.call(functionPath, args, refPaths, thisPaths)
      }
    }
  }
}

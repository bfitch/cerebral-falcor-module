import falcor from 'falcor';
import HTTPDataSource from 'falcor-http-datasource';
import expandCache from 'falcor-expand-cache';
import deepDiff from 'deep-diff';

export default (options = {}, falcor = {}) => {
  return (module) => {

    const moduleOptions = Object.assign({
      initialState: {},
      verbose:      false
    }, options);

    const {initialState, verbose} = moduleOptions;

    const falcorOptions = Object.assign({
      jsonGraphUrl: '/model.json',
    }, falcor);

    const {jsonGraphUrl, ...modelOptions} = falcorOptions;
    const source                          = new HTTPDataSource(jsonGraphUrl);
    let falcorModel                       = new falcor.Model(Object.assign({source}, modelOptions));

    // Calculate falcor changes and apply them to the module's scoped state
    const syncCerebral = [
      ({module})=> {
        const falcorCache         = falcorModel.getCache();
        const expandedFalcorCache = expandCache(falcorCache);
        const currentState        = module.state.toJS();
        const diffs               = deepDiff(currentState, expandedFalcorCache);

        if (diffs) {
          if (verbose) console.log(`Falcor merging ${diffs.length} changes from server.`);

          diffs.forEach(diff => {
            const {path, rhs, kind} = diff;

            if (verbose) console.log(`falcor updating '${path}'`);

            switch (kind) {
              case 'N': // newly added property/element
                module.state.set(path, rhs);
                break;
              case 'D': // property/element was deleted
                module.state.unset(path);
                break;
              case 'E':
                try {
                  module.state.merge(path, rhs);
                }
                catch(e) {
                  // In some cases you can't merge (converting from a bool to object and should set the new value
                  module.state.set(path,rhs);
                }
                break;
              case 'A': // change occurred within an array
                // I think this will work but haven't tested yet.
                const {index,item} = diff;
                module.state.splice(index, 1, item);
                break;
            }
          });
        }
      }
    ];

    module.alias('cerebral-module-falcor');

    module.state(initialState);

    module.signalsSync({syncCerebral});

    module.services({
      get(query) {
        return falcorModel.get(query)
      },
      set(jsonGraph){
        return falcorModel.set(jsonGraph);
      },
      call(functionPath, args = [], refSuffixes = [], thisPaths = []) {
        // functionPath - {Path}            the path to the function to invoke
        // args         - {Array.<Object>}  the arguments to pass to the function
        // refSuffixes  - {Array.<PathSet>} paths to retrieve from the targets of JSONGraph References in the function's response.
        // thisPaths    - {Array.<PathSet>} paths to retrieve from function's this object after successful function execution
        return falcorModel.call(functionPath, args, refSuffixes, thisPaths);
      },
      batch(...args) {
        falcorModel = falcorModel.batch(...args);
      },
      boxValues() {
        falcorModel = falcorModel.boxValues();
      },
      treatErrorsAsValues() {
        falcorModel = falcorModel.treatErrorsAsValues();
      },
      unbatch() {
        falcorModel = falcorModel.unbatch();
      },
      unboxValues() {
        falcorModel = falcorModel.unboxValues();
      },
      withoutDataSource() {
        falcorModel = falcorModel.withoutDataSource();
      }
    });

    // call merge signal on falcor changes
    falcorModel._root.onChange = module.getSignals().syncCerebral;

    // meta
    return {warning: 'Falcor module is super experimental, use at your own risk!'};
  }
}

export function falcorGet(path, {debug = false, verbose = false} = {}) {
  return async ({output, module}) => {
    try {
      const fullPath = Array.isArray(path) ? path : [path];

      const response = await module['cerebral-module-falcor'].services.get(fullPath);
      output(response.json);
    }
    catch (e) {
      if (verbose) console.error(e);
      if (debug) debugger;
      output.error(e);
    }
  }
}

export function falcorCall(path, {debug = false, verbose = false} = {}) {
  return async ({input, output, module}) => {
    try {
      const {falcorArgs, falcorRefSuffixes = [], falcorThisPaths = []} = input;
      if (!falcorArgs) throw new Error(`Must have a falcorArgs object in the input or a call can't be made to Falcor.`);
      const fullPath = Array.isArray(path) ? path : [path];

      const response = await module['cerebral-module-falcor'].services.call(
        fullPath,
        falcorArgs,
        falcorRefSuffixes,
        falcorThisPaths
      );

      output(response.json);
    }
    catch (e) {
      if (verbose) console.error(e);
      if (debug) debugger;
      output.error(e);
    }
  }
}

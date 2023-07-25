import { Token } from '@lumino/coreutils';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

const PLUGIN_ID = 'telemetry-router:plugin';

export const ITelemetryRouter = new Token<ITelemetryRouter>(PLUGIN_ID)

export interface ITelemetryRouter {
  hi(data: Object): any;
}

class telemetryRouter implements ITelemetryRouter {
  hi(data: Object): any {
    console.log("*************HELLO FROM TELEMETRY ROUTER***************")
    console.log("This is my data", data)
  }
}
/**
 * Initialization data for the telemetry-router extension.
 */
const plugin: JupyterFrontEndPlugin<telemetryRouter> = {
  id: PLUGIN_ID,
  description: 'A JupyterLab extension.',
  provides: ITelemetryRouter,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension telemetry-router is activated!')
    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The telemetry_router server extension appears to be missing.\n${reason}`
        );
      });
    const _telemetryRouter = new telemetryRouter()
    console.log('router side test: ')
    _telemetryRouter.hi({
      "name": "scrolling"
    })
    return _telemetryRouter;
  }
};

export default plugin;

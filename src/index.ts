import { Token } from '@lumino/coreutils';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  // LabShell
} from '@jupyterlab/application';

import { requestAPI } from './handler';

import { INotebookContent } from '@jupyterlab/nbformat';

import {
  NotebookPanel,
  // Notebook
} from '@jupyterlab/notebook';

export interface INotebookState {
  session_id: string;
  seq: number;
  notebook: INotebookContent;
}

const PLUGIN_ID = 'telemetry-router:plugin';

export const ITelemetryRouter = new Token<ITelemetryRouter>(PLUGIN_ID)

export interface ITelemetryRouter {
  loadNotebook(notebookPanel: NotebookPanel): void;
  consumeEventSignal(data: Object): void;
}

export class telemetryRouter implements ITelemetryRouter {
  // private notebookState: INotebookState; 
  private notebookPanel?: NotebookPanel;

  constructor() { }

  loadNotebook(notebookPanel: NotebookPanel) {
    this.notebookPanel = notebookPanel
  }

  consumeEventSignal(event: Object): any {
    console.log("router received event signal", event)
    const data = {
      event: event,
      notebookPanel: this.notebookPanel,
    }
    console.log("route integrated data", data)
  }
}

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
    // TEST
    // ****
    // const labShell = app.shell as LabShell;
    // labShell.currentChanged.connect(() => {
    //   const currentWidget = app.shell.currentWidget;
    //   const notebookPanel = currentWidget as NotebookPanel;
    //   _telemetryRouter.loadNotebook(notebookPanel)
    //   _telemetryRouter.consumeEventSignal({ name: 'routerTest' })
    // })
    // ****
    return _telemetryRouter;
  }
};

export default plugin;

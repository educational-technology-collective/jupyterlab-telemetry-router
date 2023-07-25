import { UUID, Token } from '@lumino/coreutils';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  // LabShell
} from '@jupyterlab/application';

import { requestAPI } from './handler';

// import { INotebookContent } from '@jupyterlab/nbformat';

import {
  NotebookPanel,
  // Notebook
} from '@jupyterlab/notebook';

const PLUGIN_ID = 'telemetry-router:plugin';

export const ITelemetryRouter = new Token<ITelemetryRouter>(PLUGIN_ID)

export interface ITelemetryRouter {
  loadNotebook(notebookPanel: NotebookPanel): void;
  consumeEventSignal(data: Object): void;
}

export class TelemetryRouter implements ITelemetryRouter {
  private session_id: string;
  private seq: number;
  private notebookPanel?: NotebookPanel;

  constructor() {
    this.session_id = UUID.uuid4();
    this.seq = 0;
  }

  loadNotebook(notebookPanel: NotebookPanel) {
    this.notebookPanel = notebookPanel
  }

  consumeEventSignal(event: Object): any {
    console.log("router received event signal", event)

    const data = {
      event: event,
      notebookState: {
        session_id: this.session_id,
        seq: this.seq,
        notebookPanel: this.notebookPanel
      },
    }

    // prepare sequence number for NEXT inquiry
    this.seq = this.seq + 1;

    console.log("router integrated data", data)
  }
}

const plugin: JupyterFrontEndPlugin<TelemetryRouter> = {
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

    const telemetryRouter = new TelemetryRouter()
    return telemetryRouter;
  }
};

export default plugin;

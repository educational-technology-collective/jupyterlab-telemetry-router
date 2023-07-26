import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { requestAPI } from './handler'

import { NotebookPanel } from '@jupyterlab/notebook';

import { INotebookContent } from '@jupyterlab/nbformat';

import { Token } from '@lumino/coreutils';

const PLUGIN_ID = 'telemetry-router:plugin';

export const ITelemetryRouter = new Token<ITelemetryRouter>(PLUGIN_ID)

export interface ITelemetryRouter {
  loadNotebookPanel(notebookPanel: NotebookPanel): void;
  consumeEventSignal(data: Object): void;
}

export class TelemetryRouter implements ITelemetryRouter {
  private sessionID?: string;
  private sequence: number;
  private notebookPanel?: NotebookPanel;

  constructor() {
    this.sequence = 0;
  }

  loadNotebookPanel(notebookPanel: NotebookPanel) {
    this.notebookPanel = notebookPanel
  }

  async consumeEventSignal(event: Object) {
    // Check if session id received is equal to the stored session id &
    // Update sequence number accordingly
    if (this.sessionID === this.notebookPanel?.sessionContext.session?.id)
      this.sequence = this.sequence + 1
    else {
      this.sessionID = this.notebookPanel?.sessionContext.session?.id
      this.sequence = 0
    }

    // Construct log
    const log = {
      event: event,
      notebookState: {
        // 'userID': ... ,
        sessionID: this.sessionID,
        sequence: this.sequence,
        notebookPath: this.notebookPanel?.context.path,
        notebookContent: this.notebookPanel?.model?.toJSON() as INotebookContent
      },
    }

    // Post to database
    console.log("Request", log)

    let responseMongo = await requestAPI<any>('mongo', { method: 'POST', body: JSON.stringify(log) });

    console.log('Response', responseMongo);
  }
}

const plugin: JupyterFrontEndPlugin<TelemetryRouter> = {
  id: PLUGIN_ID,
  description: 'A JupyterLab extension.',
  provides: ITelemetryRouter,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension telemetry-router is activated!')

    const telemetryRouter = new TelemetryRouter()
    return telemetryRouter;
  }
};

export default plugin;

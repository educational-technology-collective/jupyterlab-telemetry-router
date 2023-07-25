import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

// import { requestAPI } from './handler';

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
  private session_id?: string;
  private sequence: number;
  private notebookPanel?: NotebookPanel;

  constructor() {
    this.sequence = 0;
  }

  loadNotebookPanel(notebookPanel: NotebookPanel) {
    this.notebookPanel = notebookPanel
  }

  consumeEventSignal(event: Object) {
    // Check if session id received is equal to the stored session id &
    // Update sequence number accordingly
    if (this.session_id === this.notebookPanel?.sessionContext.session?.id)
      this.sequence = this.sequence + 1
    else {
      this.session_id = this.notebookPanel?.sessionContext.session?.id
      this.sequence = 0
    }

    // Construct log
    const log = {
      event: event,
      notebookState: {
        session_id: this.session_id,
        sequence: this.sequence,
        notebookContent: this.notebookPanel?.model?.toJSON() as INotebookContent
      },
    }

    // Post to database
    console.log("router log", log)
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

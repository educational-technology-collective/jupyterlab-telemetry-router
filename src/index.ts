import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { NotebookPanel } from '@jupyterlab/notebook';

import { INotebookContent } from '@jupyterlab/nbformat';

import { Token } from '@lumino/coreutils';

import { Consumer, ConsoleLogger, MongoDBLogger } from './consumer';

import { requestAPI } from './handler';

const PLUGIN_ID = 'telemetry-router:plugin';

export const ITelemetryRouter = new Token<ITelemetryRouter>(PLUGIN_ID)

export interface ITelemetryRouter {
  loadNotebookPanel(notebookPanel: NotebookPanel): void;
  publishEvent(event: Object): void;
}

export class TelemetryRouter implements ITelemetryRouter {
  private sessionID?: string;
  private sequence: number = 0;
  private notebookPanel?: NotebookPanel;

  static registeredConsumers: Consumer[] = [];
  static registerConsumer(consumer: Consumer) {
    TelemetryRouter.registeredConsumers.push(consumer);
  }

  loadNotebookPanel(notebookPanel: NotebookPanel) {
    this.notebookPanel = notebookPanel
  }

  async publishEvent(event: Object) {
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

    // Send to consumer
    TelemetryRouter.registeredConsumers.forEach(consumer => {
      consumer.consume(log);
    });
  }
}

const plugin: JupyterFrontEndPlugin<TelemetryRouter> = {
  id: PLUGIN_ID,
  description: 'A JupyterLab extension.',
  provides: ITelemetryRouter,
  autoStart: true,
  activate: async (app: JupyterFrontEnd) => {
    const version = await requestAPI<string>('version')
    console.log(`${PLUGIN_ID}: ${version}`)

    const telemetryRouter = new TelemetryRouter()

    // Register consumers for the router
    new ConsoleLogger();
    new MongoDBLogger();

    return telemetryRouter;
  }
};

export default plugin;

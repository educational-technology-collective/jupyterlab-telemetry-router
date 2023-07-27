import { TelemetryRouter } from ".";
import { requestAPI } from "./handler";

export class Consumer {
    constructor() {
        TelemetryRouter.registerConsumer(this);
    }
    consume(log: any) {
        console.log('Base', log)
    };
}

export class ConsoleLogger extends Consumer {
    constructor() { super() }
    consume(log: any) {
        console.log('ConsoleLogger', log);
    }
}

export class MongoDBLogger extends Consumer {
    constructor() { super() }
    async consume(log: any) {
        const responseMongo = await requestAPI<any>('mongo', { method: 'POST', body: JSON.stringify(log) });
        const data = {
            request: log,
            response: responseMongo
        }
        console.log('MongoDBLogger', data);
    }
}
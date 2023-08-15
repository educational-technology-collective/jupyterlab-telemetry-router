# This file should be saved into one of the config directories provided by `jupyter lab --path`.

c.TelemetryRouterApp.consumers = [
    {
        'ID': 'S3Logger',
        'url': 'https://telemetry.mentoracademy.org/telemetry-edtech-labs-si-umich-edu/dev/test-telemetry' 
    },
    {
        'ID': 'MongoLogger',
        'url': 'https://68ltdi5iij.execute-api.us-east-1.amazonaws.com/mongo',
        'params': {
            'mongo_cluster': 'mengyanclustertest.6b83fsy.mongodb.net',
            'mongo_db': 'telemetry',
            'mongo_collection': 'dev'
        }
    }
]
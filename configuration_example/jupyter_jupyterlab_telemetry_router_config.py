# This file should be saved into one of the config directories provided by `jupyter --path`.
def customized_exporter(data):
    print(data) # or do more here

c.JupyterLabTelemetryRouterApp.exporters = [
    {
        'type': 'console',
        'id': 'ConsoleExporter',
    },
    {
        'type': 'file',
        'id': 'FileExporter',
        'path': 'log',
    },
    {
        'type': 'remote',
        'id': 'S3Exporter',
        'url': 'https://telemetry.mentoracademy.org/telemetry-edtech-labs-si-umich-edu/dev/test-telemetry',
        'env': ['WORKSPACE_ID']
    },
    {
        'type': 'remote',
        'id': 'InfluxDBLambdaExporter',
        'url': 'https://68ltdi5iij.execute-api.us-east-1.amazonaws.com/influx',
        'params': {
            'influx_bucket': 'telemetry_dev',
            'influx_measurement': 'si101_fa24'
        }
    },
    {
        'type': 'remote',
        'id': 'MongoDBLambdaExporter',
        'url': 'https://68ltdi5iij.execute-api.us-east-1.amazonaws.com/mongo',
        'params': {
            'mongo_cluster': 'mengyanclustertest.6b83fsy.mongodb.net',
            'mongo_db': 'telemetry',
            'mongo_collection': 'dev'
        }
    },
    {
        'type': customized_exporter,
        'id': 'CustomizedExporter'
    }
]
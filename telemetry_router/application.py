from .handlers import RouteHandler
from jupyter_server.extension.application import ExtensionApp
from traitlets import Unicode, List

class TelemetryRouterApp(ExtensionApp):

    name = "telemetry_router"

    consumers = List([]).tag(config=True)

    def initialize_settings(self):
        try:
            assert self.consumers, "The c.TelemetryRouterApp.consumers configuration setting must be set, please see the configuration example"
            for consumer in self.consumers:
                assert consumer.get('ID'), "The ID of the consumer must be set, please see the configuration example"
                assert consumer.get('url'), "The url of the consumer must be set, please see the configuration example"

        except Exception as e:
            self.log.error(str(e))
            raise e

    def initialize_handlers(self):
        try:
            self.handlers.extend([(r"/telemetry-router/(.*)", RouteHandler)])
        except Exception as e:
            self.log.error(str(e))
            raise e

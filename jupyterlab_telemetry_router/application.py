from .handlers import RouteHandler
from jupyter_server.extension.application import ExtensionApp
from traitlets import List

class JupyterLabTelemetryRouterApp(ExtensionApp):

    name = "jupyterlab_telemetry_router"

    exporters = List([]).tag(config=True)

    def initialize_settings(self):
        try:
            assert self.exporters, "The c.JupyterLabTelemetryRouterApp.exporters configuration must be set, please see the configuration example"

        except Exception as e:
            self.log.error(str(e))
            raise e

    def initialize_handlers(self):
        try:
            self.handlers.extend([(r"/jupyterlab-telemetry-router/(.*)", RouteHandler)])
        except Exception as e:
            self.log.error(str(e))
            raise e

from .handlers import RouteHandler
from jupyter_server.extension.application import ExtensionApp
from traitlets import Unicode, Bool, Int

class TelemetryRouterApp(ExtensionApp):

    name = "telemetry_router"

    api = Unicode("").tag(config=True)
    mongo_cluster = Unicode("").tag(config=True)
    mongo_db = Unicode("").tag(config=True)
    mongo_collection = Unicode("").tag(config=True)

    telemetry = Bool(None, allow_none=True).tag(config=True)
    save_interval = Int(10, allow_none=False).tag(config=True)
    
    def initialize_settings(self):
        try:
            assert self.api, "The c.TelemetryRouterApp.api configuration setting must be set."
            assert self.mongo_cluster, "The c.TelemetryRouterApp.mongo_cluster configuration setting must be set."

            self.api = self.api.strip()
            self.mongo_cluster = self.mongo_cluster.strip()
            self.mongo_db = self.mongo_db.strip()
            self.mongo_collection = self.mongo_collection.strip()

            if self.telemetry is None:
                self.telemetry = False

        except Exception as e:
            self.log.error(str(e))
            raise e

    def initialize_handlers(self):
        try:
            self.handlers.extend([(r"/telemetry-router/(.*)", RouteHandler)])
        except Exception as e:
            self.log.error(str(e))
            raise e

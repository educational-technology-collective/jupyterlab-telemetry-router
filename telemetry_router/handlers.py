from requests import Session, Request
from ._version import __version__
from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import ExtensionHandlerMixin
import os, json, concurrent, tornado
import urllib.request

class RouteHandler(ExtensionHandlerMixin, JupyterHandler):

    executor = concurrent.futures.ThreadPoolExecutor(5)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self, resource):
        pass
        # try:
        #     self.set_header('Content-Type', 'application/json')

        #     if resource == 'config':
        #         self.finish(json.dumps({
        #             'telemetry' : self.extensionapp.telemetry,
        #             'capture_notebook_events': self.extensionapp.capture_notebook_events,
        #             'save_interval': self.extensionapp.save_interval,
        #             'version':  __version__,
        #             'workspace_id': os.getenv('WORKSPACE_ID') if os.getenv('WORKSPACE_ID') is not None else 'UNDEFINED'
        #             }))
        #     else:
        #         self.set_status(404)

        # except Exception as e:
        #     self.log.error(str(e))
        #     self.set_status(500)
        #     self.finish(json.dumps(str(e)))

    @tornado.web.authenticated
    @tornado.gen.coroutine
    def post(self, resource):
        try:
            if resource == 'mongo':

                result = yield self.process_mongo_request()

                self.finish(json.dumps(result))

            else:
                self.set_status(404)

        except Exception as e:
            self.log.error(str(e))
            self.set_status(500)
            self.finish(json.dumps(str(e)))

    @tornado.concurrent.run_on_executor
    def process_mongo_request(self):
        log = json.loads(self.request.body)

        mongo_params = {
            'mongo_cluster': self.extensionapp.mongo_cluster,
            'mongo_db': self.extensionapp.mongo_db,
            'mongo_collection': self.extensionapp.mongo_collection,
        }

        data = json.dumps({
            'log': log,
            'mongo_params': mongo_params
        })

        with Session() as s:
            req = Request(
                'POST',
                self.extensionapp.api_telemetry_url + "/mongo",
                data=data,
                headers={
                    'content-type': 'application/json'
                    }
                )

            prepped = s.prepare_request(req)

            res = s.send(prepped, proxies=urllib.request.getproxies())

            return {
                'status_code': res.status_code,
                'reason': res.reason,
                'text': res.text
            }
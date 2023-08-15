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
        try:
            self.set_header('Content-Type', 'application/json') 
            if resource == 'version':
                self.finish(json.dumps(__version__))
            elif resource == 'env':
                self.finish(json.dumps(os.getenv('WORKSPACE_ID') if os.getenv('WORKSPACE_ID') is not None else 'UNDEFINED'))
            else:
                self.set_status(404)
        except Exception as e:
            self.log.error(str(e))
            self.set_status(500)
            self.finish(json.dumps(str(e)))

    @tornado.web.authenticated
    @tornado.gen.coroutine
    def post(self, resource):
        try:
            if resource == 'consume':
                result = yield self.consume()
                self.finish(json.dumps(result))
            else:
                self.set_status(404)

        except Exception as e:
            self.log.error(str(e))
            self.set_status(500)
            self.finish(json.dumps(str(e)))

    @tornado.concurrent.run_on_executor
    def consume(self):
        consumers = self.extensionapp.consumers
        requestBody = json.loads(self.request.body)

        result = []

        with Session() as s:
            for consumer in consumers:
                data = json.dumps({
                    'data': requestBody,
                    'params': consumer.get('params') # none if consumer does not contain 'params'
                })
                request = Request(
                    'POST',
                    consumer.get('url'),
                    data=data,
                    headers={
                        'content-type': 'application/json'
                    }
                )
                prepped = s.prepare_request(request)
                response = s.send(prepped, proxies=urllib.request.getproxies())

                result.append({
                    'consumer': consumer.get('ID'),
                    'status_code': response.status_code,
                    'reason': response.reason,
                    'text': response.text
                })

            return result
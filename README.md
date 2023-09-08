# JupyterLab Telemetry Router

[![PyPI](https://img.shields.io/pypi/v/jupyterlab-telemetry-router.svg)](https://pypi.org/project/jupyterlab-telemetry-router)
[![npm](https://img.shields.io/npm/v/jupyterlab-telemetry-router.svg)](https://www.npmjs.com/package/jupyterlab-telemetry-router)

A JupyterLab extension for routing JupyterLab telemetry data.

**Options to export JupyterLab telemetry data to console, local file, AWS Storage Services, AWS Lambda functions, and more!**

The `jupyterlab-telemetry-router` extension needs to be used with extensions that can generates telemetry data, called telemetry producer.

There is an example telemetry producer [here](https://github.com/educational-technology-collective/jupyterlab-telemetry-producer) that could generate telemetry data of some basic JupyterLab events.

There is also a tutorial with a simple demo [here](https://github.com/educational-technology-collective/jupyterlab-telemetry-producer-demo) for learning how to develop a custom telemetry producer.

## Get started

### Requirements

- JupyterLab >= 4.0.0

### Install

Generally, for deployment, `jupyterlab-telemetry-router` **should not** be installed separately from the telemetry producer extensions, as it is a dependency of the telemetry producer extensions and would be installed automatically when installing the producer extensions. See details [here](https://github.com/educational-technology-collective/jupyterlab-telemetry-producer-demo#implement-the-extension-from-scratch).

## Configurations

### Overview

The `jupyterlab-telemetry-router` extension provides 4 default exporters, `command_line_exporter`, `console_exporter`, `file_exporter` and `remote_exporter`.
Users could add these exporters by editing the configuration file. 

Developers could also use customized exporters. To do so, developers need to write a callable exporter function and assign it to the `exporter` field when writing the configuration file.

### Configuration file name & path

Jupyter Server expects the configuration file to be named after the extension’s name like so: **`jupyter_{extension name defined in application.py}_config.py`**. In our case, the extension name is defined [here](https://github.com/educational-technology-collective/jupyterlab-telemetry-router/blob/main/jupyterlab-telemetry-router/application.py#L7). So, the configuration file name is `jupyter_jupyterlab_telemetry_router_config.py`.

Jupyter Server looks for an extension’s config file in a set of specific paths. **The configuration file should be saved into one of the config directories provided by `jupyter --path`.**

For more details, see https://jupyter-server.readthedocs.io/en/latest/operators/configuring-extensions.html.

### Example

```python
# This file should be saved into one of the config directories provided by `jupyter --path`.
from jupyterlab_telemetry_router import handlers

def customized_exporter(args):
    pass # do more here
    return ({
        'exporter': 'CustomizedCommandLineExporter',
    })

c.JupyterLabTelemetryRouterApp.exporters = [
    {
        'exporter': handlers.console_exporter,
    },
    {
        'exporter': handlers.command_line_exporter,
    },
    {
        'exporter': handlers.file_exporter,
        'args': {
            'path': 'log'
        }
    },
    {
        'exporter': handlers.remote_exporter,
        'args': {
            'id': 'S3Exporter',
            'url': 'https://telemetry.mentoracademy.org/telemetry-edtech-labs-si-umich-edu/dev/test-telemetry',
            'env': ['WORKSPACE_ID'],
        }
    },
    {
        'exporter': handlers.remote_exporter,
        'args': {
            'id': 'MongoDBLambdaExporter',
            'url': 'https://68ltdi5iij.execute-api.us-east-1.amazonaws.com/mongo',
            'params': {
                'mongo_cluster': 'mengyanclustertest.6b83fsy.mongodb.net',
                'mongo_db': 'telemetry',
                'mongo_collection': 'dev'
                },
            'env': ['WORKSPACE_ID'],
        }
    },
    {
        'exporter': handlers.remote_exporter,
        'args': {
            'id': 'InfluxDBLambdaExporter',
            'url': 'https://68ltdi5iij.execute-api.us-east-1.amazonaws.com/influx',
            'params': {
                'influx_bucket': 'telemetry_dev',
                'influx_measurement': 'si101_fa24'
            }
        }
    },
    {
        'exporter': customized_exporter,
        'args': {
            # do more here
        }
     },
]
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab-telemetry-router directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
jupyter server extension enable jupyterlab-telemetry-router
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
# Server extension must be manually disabled in develop mode
jupyter server extension disable jupyterlab-telemetry-router
pip uninstall jupyterlab-telemetry-router
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-telemetry-router` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)

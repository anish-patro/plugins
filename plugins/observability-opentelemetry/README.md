# @amplication/plugin-observability-opentelemetry

<!-- [![NPM Downloads](https://img.shields.io/npm/dt/@amplication/plugin-auth-basic)](https://www.npmjs.com/package/@amplication/plugin-auth-basic) -->

This plugin helps in integrating Opentelemetry into your app generated by Amplication and sends the telemetry data to the [**Jaeger**](https://www.jaegertracing.io/docs/1.21/opentelemetry/) agent.

## Purpose

Provides a way to integrate opentelemetry into your app generated by Amplication by adding the required dependencies and configuration files. [**OpenTelemetry**](https://opentelemetry.io/) is a collection of tools, APIs, and SDKs used to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) for analysis in order to understand your software's performance and behavior.

## Configuration

This plugin requires the following settings during plugin configuration:

- `serviceName` - The name of the service that will be used in the configuration file. It is optional and if not provided, the name of the app will be used.

- `OTEL_COLLECTOR_PORT_GRPC` - The port of the collector that will be used in the configuration file. Default value is `4317`.

- `OTEL_COLLECTOR_PORT_HTTP` - The port of the collector for http that will be used in the configuration file. Default value is `4316`.

- `JAEGER_AGENT_PORT` - The port of the jaeger agent that will be used in the configuration file. This exposes the jaeger agent UI to the port specified. Default value is `16686`

#### Example

```json
{
  "serviceName": "my-service",
  "OTEL_COLLECTOR_PORT_GRPC": "4317",
  "OTEL_COLLECTOR_PORT_HTTP": "4316",
  "JAEGER_AGENT_PORT": "16686"
}
```

## Working with the plugin

It can be used by adding the plugin in the `plugins` page of the app settings. The plugin can be added by providing the settings as shown in the [Configuration](#configuration) section.

Results in creating a `otel-config.yml` file in the root of the app. This file is used to configure the opentelemetry sdk. The file is created by using the [template](./src/static/otel-config.yml) file and replacing the placeholders with the values provided in the plugin configuration.

The plugin also adds the required dependencies in the `package.json` file and installs them.

This also creates the required environment variables in the `.env` file and a docker compose for setting up the jaeger agent and OpenTelemetry collector.

## Usage

Follow the steps below to use the created app. Make sure to have the prerequisites installed :- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

#### Local development

1. Install the dependencies

```sh
npm install
```

2. Generate the prisma client

```sh
$ npm run prisma:generate
```

3.  Start the database, Jaeger agent and OpenTelemetry collector

```sh
$ npm run docker:dev
```

4. Start the app and see the traces in the Jaeger UI

```sh
# initialize the database
$ npm run db:init

# start the server component
$ npm run start
```

#### Production

```sh
# start the server component as a docker container
$ npm run compose:up
```

## Development

### `build`

Running `npm run build` will bundle your plugin with Webpack for production.

### `dev`

Running `npm run dev` will watch your plugin's source code and automatically bundle it with every change.

### `lint`

Running `npm run lint` will lint your plugin's source code. If run with `npm run lint:fix` it will also fix the linting errors.

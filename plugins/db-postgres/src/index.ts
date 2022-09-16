import { resolve } from "path";
import {
  DsgContext,
  AmplicationPlugin,
  PrismaDataSource,
  CreateServerDockerComposeDBParams,
  CreateServerDockerComposeParams,
  CreateServerDotEnvParams,
  CreatePrismaSchemaParams,
  VariableDictionary,
} from "@amplication/code-gen-types";
import { Events } from "@amplication/code-gen-types";

class PostgresPlugin implements AmplicationPlugin {
  static baseDir = "";
  static envVariables: VariableDictionary = [
    { POSTGRESQL_USER: "${dbUser}" },
    { POSTGRESQL_PASSWORD: "${dbPassword}" },
    { POSTGRESQL_DB_NAME: "${dbName}" },
    { POSTGRESQL_PORT: "${dbPort}" },
    { POSTGRESQL_HOST: "${dbHost}" },
    {
      POSTGRESQL_URL:
        "postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}${dbName}",
    },
  ];

  static updateDockerComposeDBProperties: CreateServerDockerComposeDBParams["before"]["updateProperties"] =
    [
      { path: "services.db.image", value: "postgres:12" },
      { path: "services.db.ports", value: ["${POSTGRESQL_PORT}:5432"] },
      {
        path: "services.db.environment",
        value: {
          POSTGRES_USER: "${POSTGRESQL_USER}",
          POSTGRES_PASSWORD: "${POSTGRESQL_PASSWORD}",
        },
      },
      {
        path: "services.db.volumes",
        value: ["postgres:/var/lib/postgresql/data"],
      },
      { path: "volumes.postgres", value: null },
    ];

  static updateDockerComposeProperties: CreateServerDockerComposeParams["before"]["updateProperties"] =
    [
      { path: "services.server.ports", value: ["${SERVER_PORT}:3000"] },
      {
        path: "services.server.environment",
        value: {
          POSTGRESQL_URL:
            "postgres://${POSTGRESQL_USER}:${POSTGRESQL_PASSWORD}@db:5433",
          BCRYPT_SALT: "${BCRYPT_SALT}",
          JWT_SECRET_KEY: "${JWT_SECRET_KEY}",
          JWT_EXPIRATION: "${JWT_EXPIRATION}",
        },
      },
      {
        path: "services.migrate.environment.POSTGRESQL_URL",
        value: "postgres://${POSTGRESQL_USER}:${POSTGRESQL_PASSWORD}@db:5432",
      },
      { path: "services.db.image", value: "postgres:12" },
      { path: "services.db.ports", value: ["${POSTGRESQL_PORT}:5432"] },
      {
        path: "services.db.environment",
        value: {
          POSTGRES_USER: "${POSTGRESQL_USER}",
          POSTGRES_PASSWORD: "${POSTGRESQL_PASSWORD}",
        },
      },
      {
        path: "services.db.volumes",
        value: ["postgres:/var/lib/postgresql/data"],
      },
      {
        path: "volumes.postgres",
        value: null,
      },
    ];

  static dataSource: PrismaDataSource = {
    name: "postgres",
    provider: "PostgreSQL",
    urlEnv: "POSTGRESQL_URL",
  };

  register(): Events {
    return {
      CreateServerDotEnv: {
        before: this.beforeCreateServerDotEnv,
      },
      CreateServerDockerCompose: {
        before: this.beforeCreateServerDockerCompose,
      },
      CreateServerDockerComposeDB: {
        before: this.beforeCreateServerDockerComposeDB,
        after: this.afterCreateServerDockerComposeDB,
      },
      CreatePrismaSchema: {
        before: this.beforeCreatePrismaSchema,
      },
    };
  }

  beforeCreateServerDotEnv(
    context: DsgContext,
    eventParams: CreateServerDotEnvParams["before"]
  ) {
    eventParams.envVariables = [
      ...eventParams.envVariables,
      ...PostgresPlugin.envVariables,
    ];

    return eventParams;
  }

  beforeCreateServerDockerCompose(
    context: DsgContext,
    eventParams: CreateServerDockerComposeParams["before"]
  ) {
    return {
      ...eventParams,
      updateProperties: PostgresPlugin.updateDockerComposeProperties,
    };
  }

  beforeCreateServerDockerComposeDB(
    context: DsgContext,
    eventParams: CreateServerDockerComposeDBParams["before"]
  ) {
    context.utils.skipDefaultBehavior = true;
    return eventParams;
  }

  async afterCreateServerDockerComposeDB(
    context: DsgContext,
    modules: CreateServerDockerComposeDBParams["after"]
  ) {
    PostgresPlugin.baseDir = context.serverDirectories.baseDirectory;
    const staticPath = resolve(__dirname, "../static");
    const staticsFiles = await context.utils.importStaticModules(
      staticPath,
      PostgresPlugin.baseDir
    );

    return staticsFiles;
  }

  beforeCreatePrismaSchema(
    context: DsgContext,
    eventParams: CreatePrismaSchemaParams["before"]
  ) {
    return {
      ...eventParams,
      dataSource: PostgresPlugin.dataSource,
    };
  }
}

export default PostgresPlugin;

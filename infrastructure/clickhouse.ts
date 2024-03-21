import { ClickHouseClient, PingResult, createClient } from "@clickhouse/client";
import { NodeClickHouseClientConfigOptions } from "@clickhouse/client/dist/client";
import { Readable } from "stream";

let clickhouseClient: ClickHouseClient<Readable>;

interface ClickhouseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

const connectToClickhouse = async ({
  host,
  password,
  port,
  user,
}: ClickhouseConfig): Promise<ClickHouseClient<Readable>> => {
  console.info(`Connecting to Clickhouse... `);

  if (!host) {
    throw new Error("Invalid clickhouse configuration");
  }
  const hostWithPort = port ? `${host}:${port}` : host;

  const clientConfig: NodeClickHouseClientConfigOptions = {
    host: hostWithPort,
    ...(user && password && { username: user, password }),
  };
  let pingResult: PingResult;
  let client: ClickHouseClient<Readable>;

  try {
    client = createClient(clientConfig);
    pingResult = await client.ping();
  } catch (e) {
    console.error(`Error connecting to Clickhouse`);
    throw e;
  }

  if (!pingResult.success) {
    throw new Error(`Error connecting to clickhouse: ${pingResult.error}`);
  }
  console.info(`Successfully connected to Clickhouse`);
  return client;
};

export const getClickhouseClient = async () => {
  if (!clickhouseClient) {
    const config: ClickhouseConfig = {
      host: process.env.CLICKHOUSE_HOST || "localhost",
      port: parseInt(process.env.CLICKHOUSE_PORT || "8123"),
      user: process.env.CLICKHOUSE_USER || "default",
      password: process.env.CLICKHOUSE_PASSWORD || "",
    };
    clickhouseClient = await connectToClickhouse(config);
  }
  return clickhouseClient;
};

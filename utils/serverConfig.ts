import fs from "fs/promises";
import path from "path";

export interface IServerConfig {
  port: number;
}

class ServerConfig {
  static async getConfig(): Promise<IServerConfig> {
    const serverFile = await fs.readFile(path.resolve(__dirname, "../configs/server.json"));
    const server = JSON.parse(serverFile.toString("utf8"));
    return server;
  }
}

export default ServerConfig;

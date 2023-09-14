import ServerModule from "./modules/server";
import VkModule from "./modules/vk";
import ServerConfig from "./utils/serverConfig";
import VkConfig from "./utils/vkConfig";

async function bootstrap() {
  try {
    const vkConfig = await VkConfig.getConfig();
    const serverConfig = await ServerConfig.getConfig();

    await VkModule.init(vkConfig);
    await ServerModule.init(serverConfig);
  } catch (e) {
    console.log(e);
  }
}

bootstrap();

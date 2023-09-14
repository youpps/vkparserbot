import fs from "fs/promises";
import path from "path";

export interface IVkConfig {
  tokens: string[];
  hashtags: string[];
}

class VkConfig {
  static async getConfig(): Promise<IVkConfig> {
    const vkConfig = await fs.readFile(path.resolve(__dirname, "../configs/vk.json"), { encoding: "utf-8" });
    const vkJsonConfig = JSON.parse(vkConfig);

    return vkJsonConfig;
  }

  static async addHashtag(hashtag: string) {
    const config = await VkConfig.getConfig();

    if (config.hashtags.includes(hashtag)) {
      return;
    }

    await fs.writeFile(
      path.resolve(__dirname, "../configs/vk.json"),
      JSON.stringify({
        ...config,
        hashtags: [...config.hashtags, hashtag],
      })
    );
  }

  static async deleteHashtag(hashtag: string) {
    const config = await VkConfig.getConfig();

    await fs.writeFile(
      path.resolve(__dirname, "../configs/vk.json"),
      JSON.stringify({
        ...config,
        hashtags: config.hashtags.filter((hashtagItem) => hashtagItem !== hashtag),
      })
    );
  }
}

export default VkConfig;

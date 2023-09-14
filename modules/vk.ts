import { VK } from "vk-io";
import State from "../utils/stateConfig";
import Vk, { IVkConfig } from "../utils/vkConfig";
import Hash from "../utils/hash";
import Posts from "../utils/posts";

class VkModule {
  // private static async getVideos(vk: VK, hashtag: string) {
  //   const videos = await vk.api.video.search({
  //     count: 100,
  //     sort: 0,
  //     q: hashtag,
  //   });

  //   const result = [];

  //   for (let video of videos.items) {
  //     const exists = await Hash.exists(`video_${video.id}_${video.title}`);
  //     if (!exists) {
  //       result.push(video);
  //     }
  //   }

  //   return result;
  // }

  private static async retranslatingTask(vk: VK) {
    try {
      const { isActive } = await State.getState();
      if (!isActive) {
        return;
      }

      const { hashtags } = await Vk.getConfig();

      for (let hashtag of hashtags) {
        try {
          const videos = await vk.api.video.search({
            count: 100,
            sort: 0,
            q: hashtag,
          });

          for (let video of videos.items) {
            const exists = await Hash.exists(`video_${video.id}_${video.title}`);
            if (!exists) {
              await Posts.addPost(video.title, [], [video.player]);
            }
          }

          const photos = await vk.api.photos.search({
            count: 100,
            sort: 0,
            q: hashtag,
          });

          for (let photo of photos.items) {
            const photoImage = photo.sizes ? photo.sizes[photo.sizes?.length - 1] : null;

            const exists = await Hash.exists(`post_${photo.id}_${photo.text}`);
            if (!exists) {
              await Posts.addPost(photo?.text ?? "", [photoImage?.url ?? ""], []);
            }
          }
        } catch (e) {
          console.log(hashtag, e);
        } finally {
          await new Promise((rs) => setTimeout(rs, 300));
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  static async init(config: IVkConfig) {
    const pool = new VkPool(config.tokens);

    const MINUT = 1000 * 60;

    setInterval(() => {
      const vk = pool.getClient();

      VkModule.retranslatingTask(vk);
    }, 2 * MINUT);
  }
}

class VkPool {
  private poolItems: {
    vk: VK;
    count: number;
  }[] = [];

  constructor(tokens: string[]) {
    for (let token of tokens) {
      const vk = new VK({
        token,
        apiVersion: "5.131",
        language: "ru",
        apiTimeout: 10000,
      });

      this.poolItems.push({
        vk,
        count: 0,
      });
    }
  }

  getClient(): VK {
    let leastClientIdx = 0;
    let leastCount = this.poolItems[0].count;

    for (let i = 0; i < this.poolItems.length; i++) {
      const poolItem = this.poolItems[i];

      if (poolItem.count < leastCount) {
        leastClientIdx = i;
        leastCount = poolItem.count;
      }
    }

    const client = this.poolItems[leastClientIdx].vk;

    this.poolItems[leastClientIdx].count += 1;

    return client;
  }
}

export default VkModule;

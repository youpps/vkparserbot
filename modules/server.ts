import path from "path";
import express from "express";
import { engine } from "express-handlebars";
import State from "../utils/stateConfig";
import { IServerConfig } from "../utils/serverConfig";
import VkConfig from "../utils/vkConfig";
import Posts from "../utils/posts";

class ServerModule {
  static async init(config: IServerConfig) {
    const app = express();

    app.engine("handlebars", engine());
    app.set("view engine", "handlebars");
    app.set("views", path.resolve(__dirname, "../views"));
    app.use(express.urlencoded({ extended: true }));

    app.all("/posts", async (req, res) => {
      try {
        const { postId, stopBot, startBot } = req.body;

        if (postId) {
          await Posts.changeVisibility(postId);
        }

        if (stopBot) {
          await State.changeState({
            isActive: false,
          });
        }

        if (startBot) {
          await State.changeState({
            isActive: true,
          });
        }

        const posts = await Posts.getPosts();
        const { isActive } = await State.getState();

        res.status(200).render("posts", {
          botStatus: isActive,
          posts,
        });
      } catch (e) {
        console.log(e);
      }
    });

    app.all("/hashtags", async (req, res) => {
      try {
        const { hashtag, addHashtag, removeHashtag, stopBot, startBot } = req.body;

        if (stopBot) {
          await State.changeState({
            isActive: false,
          });
        }

        if (startBot) {
          await State.changeState({
            isActive: true,
          });
        }

        if (hashtag) {
          if (addHashtag) {
            await VkConfig.addHashtag(hashtag);
          }

          if (removeHashtag) {
            await VkConfig.deleteHashtag(hashtag);
          }
        }

        const { hashtags } = await VkConfig.getConfig();
        const { isActive } = await State.getState();

        res.status(200).render("hashtags", {
          hashtags,
          botStatus: isActive,
        });
      } catch (e) {
        console.log(e);
      }
    });

    app.get("/api/posts", async (req, res) => {
      try {
        const posts = await Posts.getPosts();

        const correctPosts = posts
          .filter((post) => post.isVisible)
          .map((post) => {
            return {
              text: post.text,
              photos: post.photos,
              videos: post.videos,
              id: post.postId,
            };
          });

        return res.status(200).json({
          status: "success",
          data: correctPosts,
        });
      } catch (e) {
        console.log(e);
        return res.status(500).json({
          status: "error",
          data: {
            message: "Internal server error",
          },
        });
      }
    });

    app.listen(config.port, () => {
      console.log(`http://localhost:${config.port}`);
    });
  }
}

export default ServerModule;

import { WallWallpostFull } from "vk-io/lib/api/schemas/objects";
import fs from "fs/promises";
import path from "path";
import { v4 } from "uuid";

interface IPost {
  postId: string;
  isVisible: boolean;
  text: string;
  photos: string[];
  videos: string[];
}

class Posts {
  static async changeVisibility(postId: string) {
    let posts = await this.getPosts();

    posts = posts.map((post) => {
      if (post.postId === postId) {
        return { ...post, isVisible: !post.isVisible };
      }

      return post;
    });

    await fs.writeFile(path.resolve(__dirname, "../configs/posts.json"), JSON.stringify(posts));
  }

  static async addPost(text: string, photos: string[], videos: string[]) {
    const configPost: IPost = {
      text,
      photos,
      videos,
      postId: v4(),
      isVisible: false,
    };

    const posts = await this.getPosts();

    posts.push(configPost);

    await fs.writeFile(path.resolve(__dirname, "../configs/posts.json"), JSON.stringify(posts));
  }

  static async getPosts(): Promise<IPost[]> {
    const postsFile = await fs.readFile(path.resolve(__dirname, "../configs/posts.json"));
    const posts = JSON.parse(postsFile.toString("utf8"));
    return posts;
  }
}

export default Posts;

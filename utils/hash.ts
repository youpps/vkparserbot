import md5 from "md5";
import fs from "fs/promises";
import path from "path";

class Hash {
  private static async getHash(): Promise<string[]> {
    const hashFile = await fs.readFile(path.resolve(__dirname, "../configs/hash.json"));
    const hash = JSON.parse(hashFile.toString("utf8"));
    return hash;
  }

  static async exists(id: string) {
    const hashMessage = md5(id);

    const hash = await Hash.getHash();

    const isExisting = hash.some((item) => item === hashMessage);
    if (!isExisting) {
      hash.push(hashMessage);

      await fs.writeFile(path.resolve(__dirname, "../configs/hash.json"), JSON.stringify(hash));
    }

    return isExisting;
  }
}

export default Hash;

const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const send = require("send");

const baseDirectory = path.resolve(os.tmpdir(), "birding-images");

const makePath = (birdName) => path.resolve(baseDirectory, `${birdName}.jpg`);

const fetchImage = async (birdName) => {
  const userAgent = "birding-app/1.0 (me@kerry.dev) node.js/next.js";
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(
      birdName
    )}&prop=imageinfo&redirects=1&generator=images&iiprop=url&gimlimit=5`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
      },
    });

    const imageResponseJSON = await response.json();
    if (imageResponseJSON.query && imageResponseJSON.query.pages) {
      const imagePages = imageResponseJSON.query.pages;

      const imageURLs = Object.values(imagePages)
        .filter(
          (i) =>
            i.imageinfo &&
            i.imageinfo.length > 0 &&
            i.imageinfo[0].url &&
            i.imagerepository === "shared" &&
            i.imageinfo[0].url.slice(-3) === "jpg" &&
            //weird wikipedia thing where "caribou" comes up in a lot of image results
            !i.title.toLowerCase().includes("caribou")
        )
        .map((i) => i.imageinfo[0].url);

      return imageURLs.length > 0 ? imageURLs[0] : undefined;
    }
  } catch (err) {
    console.log(err);
  }
};

const downloadImage = async (url, path) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  await fs.mkdir(baseDirectory, { recursive: true });
  await fs.writeFile(path, buffer);
};

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
};

export default async (req, res) => {
  try {
    const birdName = req.query.birdName;
    const sendFile = send(req, `${birdName}.jpg`, { root: baseDirectory });
    const path = makePath(birdName);
    if (await exists(path)) {
      return sendFile.pipe(res);
    }

    const wikipediaUrl = await fetchImage(birdName);
    if (wikipediaUrl) {
      await downloadImage(wikipediaUrl, path);
      /*
        post-processing of image can happen here
        image resize and blurhash 
      */
      return sendFile.pipe(res);
    } else {
      res.status(404).send(`URL for ${birdName} Not Found`);
    }
  } catch (err) {
    console.log(err);
    res.status(404).send(err.toString());
  }
};

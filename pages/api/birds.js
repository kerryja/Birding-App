const EBIRD_API_KEY = process.env.API_KEY;

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

      const imageUrls = Object.values(imagePages)
        .filter(
          (i) =>
            i.imageinfo &&
            i.imageinfo.length > 0 &&
            i.imageinfo[0].url &&
            i.imagerepository === "shared" &&
            i.imageinfo[0].url.slice(-3) === "jpg" &&
            i.title.toLowerCase().includes("caribou") === false
        )
        .map((i) => i.imageinfo[0].url);

      const imageURL = imageUrls.length > 0 ? imageUrls[0] : "";
      return imageURL;
    }
    return "";
  } catch (err) {
    console.log(err);
  }
};

export default async ({ query: { geolocation } }, res) => {
  try {
    let coords;
    const latLon = geolocation.split("|");
    coords = { latitude: latLon[0], longitude: latLon[1] };

    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/geo/recent/notable?back=1&maxResults=100&lat=${coords.latitude}&lng=${coords.longitude}&key=${EBIRD_API_KEY}`
    );
    const responseJSON = await response.json();

    const data = await Promise.all(
      responseJSON.map(async (response) => {
        return {
          name:
            response.comName.includes("(") === true
              ? response.comName.substring(0, response.comName.indexOf("(") - 1)
              : response.comName,
          foundDate: response.obsDt,
          location: response.locName,
          imageSrc: await fetchImage(
            response.comName.includes("(") === true
              ? response.comName.substring(0, response.comName.indexOf("(") - 1)
              : response.comName
          ),
        };
      })
    );
    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.toString());
  }
};

// const geocode = async (scanText) => {
//   try {
//     const url = `https://geocode.xyz/?scantext=${encodeURIComponent(
//       scanText
//     )}&json=1&region=US`;
//     const response = await fetch(url);
//     const responseJSON = await response.json();
//     const bestMatch =
//       responseJSON.matches * 1 > 0 ? responseJSON.match[0] : responseJSON;
//     return { latitude: bestMatch.latt, longitude: bestMatch.longt };
//   } catch (error) {
//     console.log(error);
//   }
// };

// const reverseGeocode = async (coords) => {
//   try {
//     const url = `https://geocode.xyz/?locate=${encodeURIComponent(
//       coords
//     )}&json=1`;
//     const response = await fetch(url);
//     const responseJSON = await response.json();

//     return {
//       city: responseJSON.city,
//       state: responseJSON.state,
//     };
//   } catch (error) {
//     console.log(error);
//   }
// };

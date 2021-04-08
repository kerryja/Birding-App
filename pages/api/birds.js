const API_KEY = process.env.API_KEY;

export default async ({ query: { geolocation } }, res) => {
  try {
    let coords;
    const latLon = geolocation.split("|");
    coords = { latitude: latLon[0], longitude: latLon[1] };

    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/geo/recent/notable?back=7&maxResults=200&lat=${coords.latitude}&lng=${coords.longitude}&key=${API_KEY}`
    );
    const responseJSON = await response.json();
    console.log(responseJSON.map((response) => response.comName));
    const data = responseJSON.map((response) => {
      return {
        name: response.comName,
        foundDate: response.obsDt,
        location: response.locName,
      };
    });
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

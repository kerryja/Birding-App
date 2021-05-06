const EBIRD_API_KEY = process.env.API_KEY;
import moment from "moment";
const fs = require("fs");
const fetch = require("node-fetch");
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const reverseGeocode = async (lat, long, locId = "locId") => {
  try {
    const locInfo = await prisma.locationInfo.findUnique({
      where: {
        locId,
      },
    });
    if (locInfo) return locInfo.location;

    const url = `https://geocode.xyz/?locate=${encodeURIComponent(
      `${lat},${long}`
    )}&json=1`;
    const response = await fetch(url);
    const responseJSON = await response.json();
    if (responseJSON.error) return "";

    const location =
      responseJSON.osmtags && responseJSON.osmtags.wikipedia
        ? responseJSON.osmtags.wikipedia.substring(3)
        : `${responseJSON.city}, ${responseJSON.statename}`;
    await prisma.locationInfo.upsert({
      where: {
        locId,
      },
      create: {
        locId,
        location,
      },
      update: {
        location,
      },
    });
    return location;
  } catch (error) {
    console.log(error);
  }
};

export default async ({ query: { geolocation } }, res) => {
  try {
    let coords;
    const latLon = geolocation.split("|");
    coords = { latitude: latLon[0], longitude: latLon[1] };

    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/geo/recent/notable?back=7&maxResults=20&lat=${coords.latitude}&lng=${coords.longitude}&key=${EBIRD_API_KEY}`
    );
    const responseJSON = await response.json();
    //filtering out duplicate bird names
    const birdSet = new Set();
    const uniqueResponseJSON = responseJSON.filter((bird) => {
      if (birdSet.has(bird.comName)) {
        return false;
      } else {
        birdSet.add(bird.comName);
      }
      return true;
    });

    const removeParentheses = (birdName) => {
      return birdName.substring(0, birdName.indexOf("(") - 1);
    };

    const formatDate = (date) => {
      return moment().format("MMMM Do, YYYY") ===
        moment(date).format("MMMM Do, YYYY")
        ? "Today"
        : moment(date).format("MMMM Do, YYYY");
    };

    const formatTime = (time) => {
      console.log(time);
    };

    const data = await Promise.all(
      uniqueResponseJSON.map(async (response) => {
        const formattedBirdName = response.comName.includes("(")
          ? removeParentheses(response.comName)
          : response.comName;

        const location = await reverseGeocode(
          response.lat,
          response.lng,
          response.locId
        );
        const homeLocation = await reverseGeocode(
          coords.latitude,
          coords.longitude
        );

        return {
          name: formattedBirdName,
          foundDate: formatDate(
            response.obsDt.substring(0, response.obsDt.indexOf(" "))
          ),
          foundTime: response.obsDt.slice(10),
          location,
          imageSrc: `/api/birds/images?birdName=${formattedBirdName}`,
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

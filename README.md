# Birding App

This app is for bird lovers. As of right now, this app allows you to view recent, notable sightings in your area for the past week. Each card displays a picture of the bird, the time it was found, and the city and state it was found in. 

## Future Work

This is an ongoing project - here is a list of the current work that is being developed:
* use [BlurHash](https://blurha.sh/) library to generate bird image backgrounds to replace current black background
* add bird images to db for caching 
* add button for geolocating
* improve navbar and homepage styling

# Motivation

As a bird lover myself, I wanted a way to know about the recent sightings in my area. This was a perfect opportunity to solidify my knowledge of geolocating, geocoding and reverse geocoding that I used in my [Weather App](https://kerryja-weather-app.herokuapp.com/).

# Tech Used

This app is built with React, Nextjs, Prisma and PostgreSQL, hosted on Heroku. I used this [blog post](https://vercel.com/guides/nextjs-prisma-postgres) to get started.

# Usage

## Requirements

* PostgreSQL, set connection string in `DATABASE_URL`
* eBird API key, set as `API_KEY`

## Instructions

```
npm i
npx prisma db push
npm run dev
```

# API Reference 

* [eBird](https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest#af04604f-e406-4cea-991c-a9baef24cd78)
* [Geocode.xyz](https://geocode.xyz/api)
* [MediaWiki](https://www.mediawiki.org/wiki/API:Images#Sample_code)
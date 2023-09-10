/** @type {import('next').NextConfig} */
const path = require("path");
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');


const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: true,
  fallbacks: {
    image: "/static/images/fallback.png",
    // document: '/other-offline',  // if you want to fallback to a custom page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
});

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.plugins.push(new FilterWarningsPlugin({
      exclude: [/mysql/, /postgres/, /cockroachdb/, /sap/, /spanner/, /mariadb/, /sqlite/, /cordova/, /react-native/,
       /nativescript/, /sqljs/, /oracle/, /mssql/, /mongodb/, /aurora-mysql/, /aurora-postgres/, /expo/, /better-sqlite3/,
        /capacitor/, /hdb/, /pg/, /redis/, /sql.js/, /typeorm-aurora-data-api-driver/, /mysql2/,/mongodb/, /mssql/, /oracledb/, 
        /pg/, /pg-native/, /pg-query-stream/, /react-native-sqlite-storage/, /redis/, /sqlite3/, /sql.js/, 
         /typeorm-aurora-data-api-driver/, /Critical dependency: the request of a dependency is an expression/]
    }));
    return config
  },
};


module.exports = withPWA(nextConfig)

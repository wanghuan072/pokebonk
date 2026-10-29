import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects(){return [{source:'/leaderboard',destination:'/wiki/leaderboard',permanent:true},{source:'/guides/best-builds',destination:'/tier-list',permanent:true},{source:'/guides/lab-upgrade-guide',destination:'/wiki/lab',permanent:true},{source:'/disclaimer',destination:'/copyright',permanent:true},{source:'/:path*',has:[{type:'host',value:'www.pokebonkdb.org'}],destination:'https://pokebonkdb.org/:path*',permanent:true}];},
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**", // Match all HTTPS resources
            },
            {
                protocol: "http",
                hostname: "**", // Match all HTTP resources
            },
            {
                protocol: "https",
                hostname: "inter-ed-hub-drf.onrender.com",
            },
            {
                protocol: "https",
                hostname: "daisyui.com",
            },
        ],
    },
};

var proxy = require("http-proxy-middleware");

module.exports = {
  siteMetadata: {
    title: `Shopify Order Wizard`,
    description: `Quickly create Shopify orders for testing purposes.`,
    author: `@gil--`
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-netlify" // make sure to keep it last in the array
  ],
  // for avoiding CORS while developing Netlify Functions locally
  // read more: https://www.gatsbyjs.org/docs/api-proxy/#advanced-proxying
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": ""
        }
      })
    );
  }
};

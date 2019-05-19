const axios = require("axios");

/*
    Shopify Graphql Proxy Middleware
*/
export async function handler(event, context, callback) {
  // Make sure method is POST
  if (event.httpMethod !== "POST") {
    callback(null, {
      statusCode: 405,
      body: "Method Not Allowed",
    });
  }

  const shop = event.headers["x-shopify-shop-domain"];
  const shopAccessToken = event.headers["x-shopify-access-token"];
  const graphqlEndpoint = `https://${shop}/admin/api/2019-04/graphql.json`;
  const query = event.body;

  if (!shopAccessToken || !shop || !query) {
    console.log("Missing access token or shop");
    callback(null, {
      statusCode: 403,
      body: "Error mising required headers",
    });
  }

  try {
    await axios({
      method: "POST",
      url: graphqlEndpoint,
      data: query,
      headers: {
        "X-Shopify-Access-Token": shopAccessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(result => {
        if (!result) {
          console.error("No data found");
          callback(null, {
            statusCode: 500,
            body: "No data found.",
          });
        }

        callback(null, {
          statusCode: 200,
          body: JSON.stringify(result.data),
        });
      })
      .catch(error => {
        let errorCode = 500;

        if (
          error.response.data.errors.includes("Invalid API key or access token")
        ) {
          console.error("Invalid API key or access token");
          errorCode = 401;
        }

        callback(null, {
          statusCode: errorCode,
          body: error.response && JSON.stringify(error.response.data.errors),
        });
      });
  } catch (error) {
    console.warn(error.response);
    callback(null, {
      statusCode: 500,
      body: error.response && JSON.stringify(error.response.data.errors),
    });
  }
}

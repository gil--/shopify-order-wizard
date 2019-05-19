import React from "react";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import { onError } from "apollo-link-error";

const GraphqlProvider = ({ children, shop, token }) => {
  if (typeof window !== "undefined") {
    const httpLink = createHttpLink({ uri: `/.netlify/functions/graphql` });

    const middlewareLink = setContext(() => ({
      headers: {
        "X-Shopify-Access-Token": token,
        "X-Shopify-Shop-Domain": `${shop}.myshopify.com`
      }
    }));

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
    });

    const client = new ApolloClient({
      link: ApolloLink.from([errorLink, middlewareLink, httpLink]),
      cache: new InMemoryCache()
    });

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  } else {
    return <>{children}</>;
  }
};

export default GraphqlProvider;

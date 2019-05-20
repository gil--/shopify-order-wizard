/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import { AppProvider, Button, FooterHelp } from "@shopify/polaris";

import "@shopify/polaris/styles.css";

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <AppProvider>
          <>
            {children}
            <FooterHelp>
              Built by <Button 
                url="http://www.gilgreenberg.com"
                plain
                external
              >Gil Greenberg</Button>{" "}
              w/ 🍦💖
            </FooterHelp>
          </>
        </AppProvider>
      </>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;

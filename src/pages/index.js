import React from "react";
import {
  Banner,
  Button,
  Card,
  Checkbox,
  Collapsible,
  DisplayText,
  Heading,
  List,
  FormLayout,
  Layout,
  Modal,
  TextContainer,
  TextField,
  TextStyle,
  Page,
  Stack,
  Select,
  Subheading,
} from "@shopify/polaris";
import faker from "faker";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { parseGid } from "@shopify/admin-graphql-api-utilities";

import PageLayout from "../components/layout";
import SEO from "../components/seo";
import GraphqlProvider from "../components/graphqlProvider";

const orderData = {
  email: faker.internet.email(),
  billingAddress: {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    address1: faker.address.streetAddress(),
    phone: "", //faker.phone.phoneNumber(),
    city: faker.address.city(),
    province: faker.address.state(),
    country: faker.address.country(),
    countryCode: faker.address.countryCode(),
    zip: faker.address.zipCode(),
  },
  shippingAddress: {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    address1: "123 Fake Street",
    phone: "", //faker.phone.phoneNumber(),
    city: "Fakecity",
    province: "Ontario",
    country: "Canada",
    zip: "K2P 1L4",
  },
  note: faker.hacker.phrase(),
  tags: "gil-shopify-order-wizard",
};

const CREATE_DRAFT_ORDER = gql`
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const COMPLETE_DRAFT_ORDER = gql`
  mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        order {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

class IndexPage extends React.Component {
  state = {
    token: null,
    domain: null,
    showStatusSection: false,
    showProductSection: false,
    showOrderModal: false,
    isOrderSubmitting: false,
    isDraftOrder: false,
    isPasswordVisible: false,
    order: orderData,
    newOrder: null,
  };

  componentDidMount() {
    // TODO: retrieve domain cookie and set as state
  }

  handleDomainChange = domain => {
    // TODO: save as cookie?
    domain.replace("myshopify.com", "");
    this.setState({ domain });
  };

  handleTokenChange = token => {
    this.setState({ token });
  };

  handleTestOrderChange = () => {
    this.setState({
      order: {
        ...this.state.order,
        test: !this.state.order.test,
      },
    });
  };

  handleOrderTypeChange = () => {
    this.setState({
      isDraftOrder: !this.state.isDraftOrder,
    });
  };

  handleOrderDataReset = () => {
    this.setState({
      order: orderData,
    });
  };

  handleOrderNoteChange = note => {
    this.setState({
      order: {
        ...this.state.order,
        note,
      },
    });
  };

  handleOrderTagsChange = tags => {
    this.setState({
      order: {
        ...this.state.order,
        tags,
      },
    });
  };

  handlePasswordToggle = () => {
    this.setState({
      isPasswordVisible: !this.state.isPasswordVisible,
    });
  };

  handleRegenerate = () => {
    alert("TODO");
  };

  handleCreateOrder = () => {
    this.handleOrderModal();
  };

  handleStatusSectionClick = () => {
    this.setState({
      showStatusSection: !this.state.showStatusSection,
    });
  };

  handleProductSectionClick = () => {
    this.setState({
      showProductSection: !this.state.showProductSection,
    });
  };

  handleOrderModal = () => {
    this.setState({
      showOrderModal: !this.state.showOrderModal,
    });
  };

  render() {
    const {
      order,
      domain,
      token,
      showOrderModal,
      newOrder,
      isDraftOrder,
    } = this.state;
    const privateAppUrl = domain
      ? `//${domain}.myshopify.com/admin/apps/private/new`
      : "https://help.shopify.com/en/manual/apps/private-apps";

    return (
      <PageLayout>
          <Page
            title="Shopify Order Wizard"
            secondaryActions={[
              {
                content: "View Source Code",
                external: true,
                icon: "external",
                url: "https://github.com/gil--/shopify-order-wizard",
              },
            ]}
          >

            <Layout>
              <Layout.Section>
                <DisplayText size="small">
                  Easily create test orders on your Shopify store.
                </DisplayText>
              </Layout.Section>
              <Layout.Section>
                <SEO
                  title="Home"
                  keywords={[`shopify`, `application`, `react`]}
                />
                {!token && (
                  <Banner
                    title="This site requires a private Shopify app. Enable the following permissions for the app:"
                    action={{
                      content: "Create Private App",
                      url: privateAppUrl,
                    }}
                    status="info"
                  >
                    <TextContainer>
                      <List type="bullet">
                        <List.Item>
                          Draft Orders - Read &amp; Write
                        </List.Item>
                        <List.Item>
                          Orders, transactions and fulfillments - Read
                          &amp; Write
                        </List.Item>
                      </List>
                    </TextContainer>
                  </Banner>
                )}
              </Layout.Section>
              <Layout.Section>
                <Card sectioned title="Settings">
                  <Stack distribution="fill">
                    <TextField
                      label="Shop Domain"
                      value={domain}
                      onChange={this.handleDomainChange}
                      prefix="https://"
                      suffix=".myshopify.com"
                      placeholder="shopify-order-wizard"
                    />
                    <TextField
                      type={
                        this.state.isPasswordVisible
                          ? "text"
                          : "password"
                      }
                      label="Private App Password"
                      value={token}
                      onChange={this.handleTokenChange}
                      helpText="We do not collect or store this information."
                      connectedRight={
                        <Button
                          icon="view"
                          label="Toggle Password"
                          onClick={this.handlePasswordToggle}
                        />
                      }
                    />
                  </Stack>
                </Card>
                <Card>
                  <Card.Header title="Customer Information">
                    <Button
                      icon="refresh"
                      size="slim"
                      onClick={this.handleRegenerate}
                    >
                      Regenerate
                    </Button>
                  </Card.Header>
                  <Card.Section title="Customer">
                    <TextContainer>
                      <TextStyle variation="subdued">
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </TextStyle>
                    </TextContainer>
                    <TextContainer>
                      <TextStyle variation="subdued">
                        {order.email}
                      </TextStyle>
                    </TextContainer>
                    <TextContainer>
                      <TextStyle variation="subdued">
                        {order.billingAddress.phone}
                      </TextStyle>
                    </TextContainer>
                  </Card.Section>
                  <Card.Section>
                    <Stack distribution="fill">
                      <>
                        <Subheading>Shipping Address</Subheading>
                        <br />
                        <TextContainer>
                          <TextStyle variation="subdued">
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName}
                            <br />
                            {order.shippingAddress.streetAddress}
                            <br />
                            {order.shippingAddress.city}{" "}
                            {order.shippingAddress.province}{" "}
                            {order.shippingAddress.zip}
                            <br />
                            {order.shippingAddress.country}
                            <br />
                            {order.shippingAddress.phone}
                          </TextStyle>
                        </TextContainer>
                      </>
                      <>
                        <Subheading>Billing Address</Subheading>
                        <br />
                        <TextContainer>
                          <TextStyle variation="subdued">
                            {order.billingAddress.firstName}{" "}
                            {order.billingAddress.lastName}
                            <br />
                            {order.billingAddress.streetAddress}
                            <br />
                            {order.billingAddress.city}{" "}
                            {order.billingAddress.province}{" "}
                            {order.billingAddress.zip}
                            <br />
                            {order.billingAddress.country}
                            <br />
                            {order.billingAddress.phone}
                          </TextStyle>
                        </TextContainer>
                      </>
                    </Stack>
                  </Card.Section>
                </Card>
              {typeof window === "undefined" ? <></> :
                <GraphqlProvider shop={domain} token={token}>
                  <Mutation mutation={CREATE_DRAFT_ORDER}>
                    {(draftOrderCreate, { data }) => (
                      <Mutation mutation={COMPLETE_DRAFT_ORDER}>
                        {(draftOrderComplete, { data }) => (
                          <Card
                            secondaryFooterAction={{
                              content: "Reset",
                              onAction: this.handleOrderDataReset,
                            }}
                            primaryFooterAction={{
                              content: isDraftOrder
                                ? "Create Draft Order"
                                : "Create Order",
                              loading: this.state.isOrderSubmitting,
                              onAction: e => {
                                e.preventDefault();

                                this.setState({
                                  isOrderSubmitting: true,
                                });

                                draftOrderCreate({
                                  variables: {
                                    input: {
                                      lineItems: {
                                        title: "Fries",
                                        originalUnitPrice: "12",
                                        quantity: 1,
                                      },
                                      ...this.state.order,
                                      // appliedDiscount
                                    },
                                  },
                                })
                                  .then(res => {
                                    const draftOrderId =
                                      res &&
                                      res.data &&
                                      res.data.draftOrderCreate &&
                                      res.data.draftOrderCreate.draftOrder &&
                                      res.data.draftOrderCreate.draftOrder.id;

                                    if (isDraftOrder) {
                                      this.setState({
                                        isOrderSubmitting: false,
                                        showOrderModal: true,
                                        newOrder: {
                                          id: parseGid(draftOrderId),
                                          type: "draft_orders",
                                        },
                                      });
                                      return;
                                    }

                                    draftOrderComplete({
                                      variables: {
                                        id: draftOrderId,
                                        paymentPending: true,
                                      },
                                    }).then(res => {
                                      const orderId =
                                        res &&
                                        res.data &&
                                        res.data.draftOrderComplete &&
                                        res.data.draftOrderComplete.draftOrder &&
                                        res.data.draftOrderComplete.draftOrder
                                          .order &&
                                        res.data.draftOrderComplete.draftOrder
                                          .order.id;

                                      this.setState({
                                        isOrderSubmitting: false,
                                        showOrderModal: true,
                                        newOrder: {
                                          id: parseGid(orderId),
                                          type: "orders",
                                        },
                                      });
                                    });
                                  })
                                  .catch(e => {
                                    // TODO: show error message in modal or somewhere...
                                    this.setState({
                                      isOrderSubmitting: false,
                                    });
                                  });
                              },
                              disabled: !domain || !token,
                            }}
                          >
                            <Card.Header title="Order Info">
                              {/* <Checkbox
                            checked={order.test}
                            label="Test Order"
                            onChange={this.handleTestOrderChange}
                          /> */}
                              <Checkbox
                                checked={isDraftOrder}
                                label="Draft Order"
                                onChange={this.handleOrderTypeChange}
                              />
                            </Card.Header>
                            <Card.Section>
                              <FormLayout>
                                <TextField
                                  label="Tags"
                                  onChange={this.handleOrderTagsChange}
                                  value={order.tags}
                                  helpText="Comma Separated"
                                />
                                {/* <TextField
                            label="Source Name"
                            onChange={this.handleChange}
                            value="gil_greenberg_order_wizard"
                            disabled
                          /> */}
                                <TextField
                                  label="Order Note"
                                  value={order.note}
                                  onChange={this.handleOrderNoteChange}
                                  maxLength={120}
                                  showCharacterCount
                                  multiline
                                />
                              </FormLayout>
                            </Card.Section>
                            {/* <Card.Section>
                              <Button
                                icon={
                                  this.state.showStatusSection
                                    ? "subtract"
                                    : "add"
                                }
                                plain
                                onClick={this.handleStatusSectionClick}
                                ariaExpanded={this.state.showStatusSection}
                              >
                                <Subheading>Order Statuses</Subheading>
                              </Button>
                              <Collapsible
                                open={this.state.showStatusSection}
                                id="status-collapsible"
                              >
                                <br />
                                <FormLayout>
                                  <Select
                                    label="Financial Status"
                                    options={[
                                      {
                                        label: "authorized",
                                        value: "authorized",
                                      },
                                      { label: "pending", value: "pending" },
                                      { label: "paid", value: "paid" },
                                      { label: "refunded", value: "refunded" },
                                      { label: "voided", value: "voided" },
                                    ]}
                                    onChange={this.handleChange}
                                    value={this.state.selected}
                                  />
                                  <Select
                                    label="Fulfillment Status"
                                    options={[
                                      { label: "unshipped", value: "unshipped" },
                                      { label: "partial", value: "partial" },
                                      { label: "shipped", value: "shipped" },
                                    ]}
                                    onChange={this.handleChange}
                                    value={this.state.selected}
                                  />
                                  <Select
                                    label="Order Status"
                                    options={[
                                      { label: "Open", value: "open" },
                                      { label: "Closed", value: "closed" },
                                    ]}
                                    onChange={this.handleChange}
                                    value={this.state.selected}
                                  />
                                </FormLayout>
                              </Collapsible>
                            </Card.Section>
                            <Card.Section>
                              <Button
                                icon={
                                  this.state.showProductSection
                                    ? "subtract"
                                    : "add"
                                }
                                plain
                                onClick={this.handleProductSectionClick}
                                ariaExpanded={this.state.showProductSection}
                              >
                                <Subheading>Product Data</Subheading>
                              </Button>
                              <Collapsible
                                open={this.state.showProductSection}
                                id="product-collapsible"
                              >
                                <br />
                                <FormLayout>
                                  <Heading>
                                    Custom Product Checkbox otherwise variant
                                  </Heading>
                                  Variant ID Product title qty price has shipping
                                  <Heading>Order Discount</Heading>
                                  <Heading>Order Risk</Heading>
                                  TODO:
                                  https://help.shopify.com/en/api/reference/orders/order-risk#create
                                </FormLayout>
                              </Collapsible>
                            </Card.Section> */}
                            <Card.Section />
                          </Card>
                        )}
                      </Mutation>
                    )}
                  </Mutation>
                </GraphqlProvider>
              }
              </Layout.Section>
            </Layout>
            <Modal
              open={showOrderModal}
              onClose={this.handleOrderModal}
              sectioned
            >
              <Modal.Section>
                <TextContainer>
                  <Heading>Order Successfully Created!</Heading>
                  <Button
                    primary
                    external
                    icon="external"
                    url={`//${domain}.myshopify.com/admin/${(newOrder &&
                      newOrder.type) ||
                      "orders"}/${(newOrder && newOrder.id) || ""}`}
                  >
                    View Order
                  </Button>
                </TextContainer>
              </Modal.Section>
            </Modal>
          </Page>
        </PageLayout>
    );
  }
}

export default IndexPage;

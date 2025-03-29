import {
  Column,
  Container,
  Font,
  Heading,
  Html,
  Row,
  Text,
} from "@react-email/components";
import * as React from "react";

export const NewOrderEmailTemplate = ({
  items,
}: {
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingFees: number;
  subTotal: number;
  tax: number;
}) => {
  return (
    <Html lang="en">
      <Font
        fontFamily="Poppins"
        fallbackFontFamily={["sans-serif", "Arial", "Verdana"]}
        webFont={{
          url: "https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJnecmNE.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Row style={{ marginBottom: "8px" }}>
        <Column>
          <Heading as="h1">Lebsy</Heading>
        </Column>
        <Column>Order Confirmation</Column>
      </Row>
      <Text style={{ marginBottom: "16px" }}>
        Thank you for your purchase, we are currently processing your order.
      </Text>

      <Heading as="h2">Order Summary</Heading>
      {items.map((item) => (
        <Row key={item.name}>
          <Column>
            {item.name} x {item.quantity}
          </Column>
          <Column>${item.price}</Column>
        </Row>
      ))}
    </Html>
  );
};

import {
  Column,
  Container,
  Font,
  Heading,
  Html,
  Row,
  Text,
} from "@react-email/components";
// NEVER REMOVE THIS IMPORT
import * as React from "react";

export const NewOrderEmailTemplate = ({
  items,
  shippingFees,
  subTotal,
  tax,
  address,
  city,
  country,
  customerEmail,
  customerName,
  customerPhone,
  postalCode,
  state,
  total,
}: {
  items: {
    name: string;
    quantity: number;
    price: number;
    vendorName?: string;
  }[];
  shippingFees: number;
  subTotal: number;
  tax: number;
  total: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
        <>
          <Row key={item.name}>
            <Column>
              {item.name} x {item.quantity}
            </Column>
            <Column>${item.price}</Column>
          </Row>
          {item.vendorName && (
            <Row>
              <Column>Vendor: {item.vendorName}</Column>
            </Row>
          )}
        </>
      ))}
      <Row>
        <Column>Subtotal</Column>
        <Column>${subTotal}</Column>
      </Row>
      <Row>
        <Column>Shipping</Column>
        <Column>${shippingFees}</Column>
      </Row>
      <Row>
        <Column>Tax</Column>
        <Column>${tax}</Column>
      </Row>
      <Row>
        <Column>Total</Column>
        <Column>${total}</Column>
      </Row>

      <Heading as="h2">Shipping Address</Heading>
      <Row>
        <Column>Address</Column>
        <Column>{address}</Column>
      </Row>
      <Row>
        <Column>City</Column>
        <Column>{city}</Column>
      </Row>
      <Row>
        <Column>State</Column>
        <Column>{state}</Column>
      </Row>
      <Row>
        <Column>Postal Code</Column>
        <Column>{postalCode}</Column>
      </Row>
      <Row>
        <Column>Country</Column>
        <Column>{country}</Column>
      </Row>

      <Heading as="h2">Customer Information</Heading>
      <Row>
        <Column>Name</Column>
        <Column>{customerName}</Column>
      </Row>
      <Row>
        <Column>Email</Column>
        <Column>{customerEmail}</Column>
      </Row>
      <Row>
        <Column>Phone</Column>
        <Column>{customerPhone}</Column>
      </Row>
    </Html>
  );
};

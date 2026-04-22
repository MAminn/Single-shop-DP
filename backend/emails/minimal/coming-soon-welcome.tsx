import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
// NEVER REMOVE THIS IMPORT
import * as React from "react";

interface ComingSoonWelcomeProps {
  storeName: string;
  logoUrl?: string;
  userName: string;
}

export const ComingSoonWelcomeTemplate = ({
  storeName,
  logoUrl,
  userName,
}: ComingSoonWelcomeProps) => {
  return (
    <Html>
      <Head>
        <title>Welcome to {storeName}</title>
        <Preview>You're on the early access list for {storeName}!</Preview>
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt={storeName}
                height="48"
                style={{ margin: "0 auto", display: "block", objectFit: "contain", maxWidth: "200px" }}
              />
            ) : (
              <Heading as="h1" style={logoText}>
                {storeName}
              </Heading>
            )}
          </Section>

          <Hr style={divider} />

          <Section style={section}>
            <Heading as="h2" style={sectionTitle}>
              You're on the list!
            </Heading>
            <Text style={paragraph}>Hello {userName},</Text>
            <Text style={paragraph}>
              Thank you for signing up! We've received your registration and you're officially on our early access list.
            </Text>
            <Text style={paragraph}>
              We're putting the final touches on {storeName} and we'll reach out as soon as we're fully launched. Stay tuned — exciting things are coming!
            </Text>
            <Text style={paragraph}>
              In the meantime, if you have any questions feel free to reply to this email.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main: React.CSSProperties = {
  backgroundColor: "#f9f9f7",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "580px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  border: "1px solid #e8e5e0",
};

const header: React.CSSProperties = {
  padding: "32px 40px 24px",
  textAlign: "center",
};

const logoText: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "300",
  letterSpacing: "4px",
  color: "#1a1a1a",
  textTransform: "uppercase" as const,
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#e8e5e0",
  margin: "0",
};

const section: React.CSSProperties = {
  padding: "32px 40px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "400",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#4a4a4a",
  margin: "0 0 12px",
};

const footer: React.CSSProperties = {
  padding: "20px 40px",
  backgroundColor: "#f9f9f7",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9a9a9a",
  textAlign: "center",
  margin: "0",
};

import React from "react";
import {
  Html,
  Head,
  Heading,
  Text,
  Section,
  Container,
} from "@react-email/components";

export function CustomerTicketEmail({
  customerName,
  eventName,
  location,
  ticketId,
}) {
  const name = customerName || "there";

  return (
    <Html>
      <Head />
      <Container
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "24px",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <Heading style={{ color: "#facc15" }}>
          Your Ticket for {eventName || "the event"}
        </Heading>
        <Text style={{ fontSize: "16px" }}>Hi {name},</Text>
        <Text style={{ fontSize: "16px" }}>
          Thanks for securing your spot. This email is your proof of purchase.
          Keep it handy and present the ticket ID at the door to get in.
        </Text>

        <Section
          style={{
            borderRadius: "16px",
            border: "1px solid #1e293b",
            backgroundColor: "#111827",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <Heading as="h2" style={{ color: "#f87171", fontSize: "20px" }}>
            Event Details
          </Heading>
          <Text style={{ fontSize: "15px", margin: "8px 0" }}>
            <strong>Event:</strong> {eventName}
          </Text>
          <Text style={{ fontSize: "15px", margin: "8px 0" }}>
            <strong>Location:</strong> {location || "TBA"}
          </Text>

          <Heading as="h2" style={{ color: "#38bdf8", fontSize: "20px" }}>
            Your Ticket ID
          </Heading>
          <Text style={{ fontSize: "15px", margin: "8px 0" }}>
            Show this unique code at entry. One scan per guest.
          </Text>
          <Text
            style={{
              fontSize: "22px",
              letterSpacing: "2px",
              fontWeight: "bold",
              backgroundColor: "#020617",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px dashed #38bdf8",
              textAlign: "center",
            }}
          >
            {ticketId}
          </Text>
        </Section>

        <Text style={{ fontSize: "14px", color: "#94a3b8", marginTop: "24px" }}>
          Questions? Reply to this email and the team will help.
        </Text>
        <Text style={{ fontSize: "12px", color: "#64748b", marginTop: "18px" }}>
          NO SLEEP DEC5 — High school only. No re-entry. No refunds.
        </Text>
      </Container>
    </Html>
  );
}

export default CustomerTicketEmail;

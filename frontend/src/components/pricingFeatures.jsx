import React, { useState } from "react";
import { Typography, Button, Grid, Card, CardContent, Switch, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Header from "./Header";
import "./Pricing.css";

const pricingPlans = [
  {
    title: "Basic Plan",
    price: "€29",
    duration: "/month",
    features: [
      "AI-powered text-to-BPMN workflow generation",
      "Basic workflow templates for patient management & scheduling",
      "Real-time collaboration (up to 5 users)",
      "Manual error detection & reporting",
      "Basic customer support (Email only, 48h response time)",
      "Data storage: 5GB",
    ],
  },
  {
    title: "Professional Plan",
    price: "€48",
    duration: "/month",
    features: [
      "AI-powered real-time error detection & smart corrections",
      "Workflow simulation & optimization tools",
      "Advanced analytics & performance reports",
      "Customizable workflow templates",
      "Priority customer support (Email & Chat, 24h response time)",
      "Data storage: 50GB",
    ],
  },
  {
    title: "Enterprise Plan",
    price: "€199",
    duration: "/month",
    features: [
      "Unlimited users & multi-team collaboration",
      "AI-powered workflow recommendations & predictive analytics",
      "API & third-party system integrations (EMRs, CRMs, hospital IT)",
      "HIPAA & GDPR compliance with enhanced data security",
      "Dedicated account manager & 24/7 priority support",
      "Custom AI training for workflow automation",
      "Data storage: 500GB (expandable)",
    ],
  },
];
 
const PricingFeatures = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <Box>
      <Header />
      <Box sx={{ height: "60%" }} className="pricing-content">
        <Box textAlign="center" mt={5}>
          <Typography variant="h4" fontWeight="bold">
            Choose your right plan
          </Typography>
          <Typography variant="subtitle1" mt={1}>
            Select from the best plans to ensure a perfect match. Need more or less?
          </Typography>
        </Box>

        {/* <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <Typography>Monthly</Typography>
          <Switch checked={billingCycle === "quarterly"} onChange={() => setBillingCycle(billingCycle === "monthly" ? "quarterly" : "monthly")} />
          <Typography>Quarterly (save 10%)</Typography>
        </Box> */}

        <Grid container spacing={3} justifyContent="center" mt={3}>
          {pricingPlans.map((plan, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  borderRadius: 3,
                  boxShadow: 3,
                  width: "100%",
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      bgcolor: "#8b5cf6",
                      color: "white",
                      borderRadius: 2,
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    {plan.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" mt={2}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {plan.duration}
                  </Typography>
                  <Box mt={2} textAlign="left">
                    {plan.features.map((feature, i) => (
                      <Typography key={i} display="flex" alignItems="center" gap={1}>
                        <CheckIcon color="success" fontSize="small" />
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
                <Box p={2}>
                  <Button
                    variant="outlined"
                    sx={{ width: "100%", borderRadius: 2 }}
                  >
                    {plan.title === "Custom" ? "Book a Call" : "Get Started"}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PricingFeatures;

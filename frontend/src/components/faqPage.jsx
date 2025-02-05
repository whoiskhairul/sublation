import React from "react";
import {  Typography, Container, Grid, Accordion, AccordionSummary, AccordionDetails, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from './Header';

const faqData = [
  { question: "Can I customize the pre-built templates?", answer: "Yes, you can fully customize the pre-built templates to fit your healthcare organization’s specific needs." },
  { question: "What if I don’t have technical experience? Can I still use Folia?", answer: "Absolutely! Folia offers an intuitive drag-and-drop workflow designer and a conversational AI assistant, making it easy for non-technical users to create and manage workflows." },
  { question: "How does the AI workflow optimization work?", answer: "Folia’s AI analyzes your workflows for bottlenecks and inefficiencies, providing real-time suggestions to improve process efficiency and reduce errors." },
  { question: "How does the collaboration feature work in Folia?", answer: "Folia enables real-time collaboration, allowing multiple users to work on the same BPMN diagram simultaneously. Team members can make edits, provide feedback, and track changes, all in real-time." },
  { question: "Can multiple users edit a workflow at the same time?", answer: "Yes, Folia supports real-time multi-user editing, meaning multiple team members can simultaneously edit a workflow, ensuring seamless collaboration." },
  { question: "What happens after the free trial ends?", answer: "After the free trial, you can choose from our subscription plans, ensuring that Folia continues to meet your healthcare organization’s needs." },
];

const FAQPage = () => {
  return (
    <Box>
       <Header />

        <Box sx={{ height: '50px' }} />
      
      <Container maxWidth="md" sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">Frequently Asked Questions</Typography>
        <Typography variant="subtitle1" color="textSecondary" mt={1}>
          Stuck on something? We're here to help with all your questions.
        </Typography>
        
        <Grid container spacing={3} justifyContent="center" mt={3}>
          {faqData.map((faq, index) => (
            <Grid item xs={12} key={index}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
                  <Typography variant="h6">❓ {faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FAQPage;

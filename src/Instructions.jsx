import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  LooksOne as OneIcon,
  LooksTwo as TwoIcon,
  Looks3 as ThreeIcon,
  Looks4 as FourIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

function Instructions({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      scroll="paper"
      aria-labelledby="instructions-dialog-title"
    >
      <DialogTitle id="instructions-dialog-title">
        <Typography variant="h5" component="div">How to Use QuickPact AI</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          Generate Legal Contracts with AI in 3 Simple Steps
        </Typography>
        <Typography paragraph>
          QuickPact AI uses artificial intelligence to generate professionally formatted legal contracts 
          based on your specific needs. No more templates - get customized contracts instantly!
        </Typography>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <OneIcon color="primary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Describe Your Agreement"
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    Select the contract type and describe your agreement in plain language.
                  </Typography>
                  <Box component="p" sx={{ mt: 1 }}>
                    Example: "I need a roommate agreement between John Smith and Jane Doe for a rental property at 123 Main Street. 
                    The monthly rent is R1500 starting on January 1st, 2026."
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <TwoIcon color="primary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Generate with AI"
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    Click "Generate Contract" and our AI will create a customized legal document based on your description.
                  </Typography>
                  <Box component="p" sx={{ mt: 1 }}>
                    The AI extracts important details from your description and creates a professional contract with all necessary legal clauses.
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <ThreeIcon color="primary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Edit and Customize"
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    Review and edit the contract details to ensure everything is accurate.
                  </Typography>
                  <Box component="p" sx={{ mt: 1 }}>
                    Use the editing panel to modify amounts, names, dates, and other details. Click "Regenerate Contract" if you make significant changes.
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>

          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <FourIcon color="primary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Download and Use"
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    Download your contract as a PDF and it's ready to use!
                  </Typography>
                  <Box component="p" sx={{ mt: 1 }}>
                    Your professionally formatted legal document is ready to be printed, signed, and implemented.
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1 }} /> AI-Powered Features
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Natural language contract generation" />
          </ListItem>
          <ListItem>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Auto-extraction of key details from your description" />
          </ListItem>
          <ListItem>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Comprehensive legal clauses specific to each contract type" />
          </ListItem>
          <ListItem>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ability to regenerate contracts with updated information" />
          </ListItem>
          <ListItem>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Professional PDF generation ready for signing" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Note:</strong> While our AI generates high-quality legal documents, we recommend having important contracts reviewed by a legal professional before implementation, especially for complex agreements.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Instructions;
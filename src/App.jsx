import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  ThemeProvider, 
  CssBaseline,
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
  Divider,
  useMediaQuery,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Autorenew as AutorenewIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { contractTypes } from './ContractTemplate';
import { theme } from './styles';
import Instructions from './Instructions';
import "./App.css";
import ReactMarkdown from 'react-markdown';

// Improved contract rendering component
const ContractRenderer = ({ markdown, forPrinting = false }) => {
  return (
    <div className={`contract-document ${forPrinting ? 'for-printing' : ''}`}>
      <ReactMarkdown>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

function App() {
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState('');
  const [contractType, setContractType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [error, setError] = useState('');
  const contractRef = useRef(null);
  const [contractData, setContractData] = useState({
    amount: '',
    startDate: '',
    party1: '',
    party2: '',
    address: '',
    term: '12',
    notice: '30',
    roommateCount: '2',
    today: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  });
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Function that uses OpenRouter.ai API for contract generation
  const generateContractWithAI = async (summary, contractType) => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Prepare a detailed prompt based on contract type
      const typeLabel = contractTypes.find(c => c.id === contractType)?.name || contractType;
      const prompt = `
Generate a professionally formatted ${typeLabel} based on this summary: ${summary}.

Format it with markdown headings and proper sections. Include all standard legal clauses that would be expected in this type of agreement.
Use "R" as the currency symbol for monetary amounts (e.g., R1000).

The contract should look like a professional legal document with the following formatting and structure:
1. Title centered at the top in bold
2. Proper section numbering (e.g., 1, 1.1, 1.1.1)
3. Include standard clauses like definitions, jurisdiction, termination
4. Include proper signature blocks at the end with lines for signatures
5. Use proper legal language and terminology
6. Format paragraphs with proper indentation in markdown
7. Include the current date which is ${contractData.today}
8.Include section for signatures

The contract should be detailed and comprehensive enough to be legally valid.
`;
      
      // Call OpenRouter API
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          headers: { 
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin, // Required by OpenRouter
            "X-Title": "QuickPact AI" // Optional but recommended
          },
          method: "POST",
          body: JSON.stringify({
            model: "gryphe/mythomax-l2-13b", // A free model on OpenRouter
            messages: [
              {
                role: "system", 
                content: "You are a legal assistant specializing in drafting professional contracts. Create a contract with proper legal structure, sections, and clauses. Format the contract to look like a professional legal document with proper indentation, numbering, and signature blocks."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      let contractContent = result.choices[0]?.message?.content || '';
      
      // Sometimes the model output has additional explanatory text - try to extract just the contract
      const contractMatch = contractContent.match(/^#\s+.*?(?=\n\s*$)/s);
      if (contractMatch) {
        contractContent = contractMatch[0];
      }
      
      // Extract contract data
      const updatedData = extractContractData(contractContent);
      setContractData(updatedData);
      setGeneratedContract(contractContent);
      
      return contractContent;
    } catch (error) {
      console.error("Error generating contract with AI:", error);
      setError('Failed to generate contract. Please try again or check your OpenRouter API key.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to extract contract data
  const extractContractData = (content) => {
    const data = { ...contractData };
    
    // Extract party names
    const partyRegex = /\b(party|between|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
    const partyMatches = [...content.matchAll(partyRegex)];
    if (partyMatches.length >= 1 && partyMatches[0][2]) data.party1 = partyMatches[0][2];
    if (partyMatches.length >= 2 && partyMatches[1][2]) data.party2 = partyMatches[1][2];
    
    // Extract monetary amounts
    const moneyRegex = /R\s*(\d+(?:,\d+)*(?:\.\d+)?)/g;
    const moneyMatches = [...content.matchAll(moneyRegex)];
    if (moneyMatches.length >= 1) data.amount = moneyMatches[0][1];
    
    // Extract dates
    const dateRegex = /\b(?:on|starting|from|begins? on|commences?)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/gi;
    const dateMatches = [...content.matchAll(dateRegex)];
    if (dateMatches.length >= 1) data.startDate = dateMatches[0][1];
    
    // Extract address if present
    const addressRegex = /(?:located at|property at|premises at|address:?)\s+([^.]+)/i;
    const addressMatch = content.match(addressRegex);
    if (addressMatch && addressMatch[1]) data.address = addressMatch[1].trim();
    
    // Extract term length if present
    const termRegex = /\b(?:term|duration|period) of (\d+)\s+(?:months|month)/i;
    const termMatch = content.match(termRegex);
    if (termMatch && termMatch[1]) data.term = termMatch[1];
    
    // Extract notice period if present
    const noticeRegex = /\b(?:notice|notification) (?:period|of) (\d+)\s+(?:days|day)/i;
    const noticeMatch = content.match(noticeRegex);
    if (noticeMatch && noticeMatch[1]) data.notice = noticeMatch[1];
    
    return data;
  };

  // Regenerate contract with updated data
  const regenerateContract = async () => {
    setIsGenerating(true);
    
    try {
      // Create a detailed prompt with all the current data
      const typeLabel = contractTypes.find(c => c.id === contractType)?.name || contractType;
      const prompt = `
Create a professionally formatted ${typeLabel} with the following details:
- Between ${contractData.party1} and ${contractData.party2}
- Amount: R${contractData.amount}
- Start date: ${contractData.startDate}
- Address: ${contractData.address}
- Term: ${contractData.term} months
- Notice period: ${contractData.notice} days
${contractType === 'roommate' ? `- Number of roommates: ${contractData.roommateCount}` : ''}
- Today's date: ${contractData.today}

Additional context: ${summary}

Format it with proper markdown styling to create a professional legal document:
1. Title centered at the top
2. Proper section numbering (e.g., 1, 1.1, 1.1.1)
3. Include standard clauses like definitions, jurisdiction, termination
4. Include proper signature blocks at the end with lines for signing
5. Use proper legal language and proper paragraph indentation
6. Format dates properly and consistently
7. Ensure monetary amounts use the R symbol correctly
`;
      
      // Call OpenRouter API
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          headers: { 
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "QuickPact AI"
          },
          method: "POST",
          body: JSON.stringify({
            model: "gryphe/mythomax-l2-13b",
            messages: [
              {
                role: "system", 
                content: "You are a legal assistant specializing in drafting professional contracts. Create a contract with proper legal structure, sections, and clauses. Format the contract to look like a professional legal document with proper indentation, numbering, and signature blocks."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.9
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      let contractContent = result.choices[0]?.message?.content || '';
      
      // Process the result
      const contractMatch = contractContent.match(/^#\s+.*?(?=\n\s*$)/s);
      if (contractMatch) {
        contractContent = contractMatch[0];
      }
      
      setGeneratedContract(contractContent);
    } catch (error) {
      console.error("Error regenerating contract:", error);
      setError('Failed to regenerate contract. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim() || !contractType) return;
    
    const contract = await generateContractWithAI(summary, contractType);
    
    if (contract) {
      setStep(2);
    }
  };

  const updateContractData = (field, value) => {
    setContractData(prev => ({ ...prev, [field]: value }));
  };

  // Improved PDF generation method using jsPDF
  const downloadPDF = async () => {
    try {
      const element = contractRef.current;
      if (!element) {
        throw new Error("Contract element not found");
      }
      
      // Calculate PDF dimensions (A4)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Create a printing view of the contract with proper styles
      const printContainer = document.createElement('div');
      printContainer.style.width = '210mm'; // A4 width
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.innerHTML = `
        <style>
          .contract-for-print {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 25mm 20mm;
            text-align: justify;
          }
          .contract-for-print h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15mm;
          }
          .contract-for-print h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 10mm;
            margin-bottom: 5mm;
          }
          .contract-for-print h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 5mm;
            margin-bottom: 3mm;
          }
          .contract-for-print p {
            margin-bottom: 3mm;
            text-indent: 10mm;
          }
          .contract-for-print ul, .contract-for-print ol {
            margin-left: 10mm;
            margin-bottom: 3mm;
          }
          .contract-for-print li {
            margin-bottom: 2mm;
          }
          .contract-for-print .signature-section {
            margin-top: 20mm;
          }
          .contract-for-print .signature-line {
            display: inline-block;
            width: 70mm;
            border-bottom: 1px solid black;
            margin-top: 15mm;
            margin-right: 10mm;
          }
          .contract-for-print .signature-label {
            font-size: 10pt;
            text-align: center;
            margin-top: 2mm;
          }
        </style>
        <div class="contract-for-print">
          ${element.innerHTML}
        </div>
      `;
      
      document.body.appendChild(printContainer);
      
      // Use html2canvas with better settings for PDF generation
      const canvas = await html2canvas(printContainer, { 
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true
      });
      
      // Calculate the number of pages needed
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageCount = Math.ceil(imgHeight / pdfHeight);
      
      // Add pages to PDF with proper positioning
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pdfHeight;
      position = -pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }
      
      // Remove the temporary print container
      document.body.removeChild(printContainer);
      
      // Save the PDF
      const fileName = `${contractTypes.find(c => c.id === contractType)?.name || 'Contract'}.pdf`;
      pdf.save(fileName);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  // Add style for contract rendering
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Contract styling */
      .contract-document {
        font-family: "Times New Roman", Times, serif;
        font-size: 14px;
        line-height: 1.6;
        text-align: justify;
        padding: 20px;
      }
      
      .contract-document h1 {
        font-size: 18px;
        text-align: center;
        font-weight: bold;
        margin-bottom: 20px;
        text-transform: uppercase;
      }
      
      .contract-document h2 {
        font-size: 16px;
        font-weight: bold;
        margin-top: 15px;
        margin-bottom: 10px;
      }
      
      .contract-document h3 {
        font-size: 14px;
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 5px;
      }
      
      .contract-document p {
        margin-bottom: 10px;
        text-indent: 20px;
      }
      
      .contract-document ul, .contract-document ol {
        padding-left: 30px;
        margin-bottom: 10px;
      }
      
      .contract-document li {
        margin-bottom: 5px;
      }
      
      /* For signature blocks */
      .signature-block {
        margin-top: 30px;
        display: flex;
        justify-content: space-between;
      }
      
      .signature-party {
        width: 45%;
      }
      
      .signature-line {
        border-bottom: 1px solid black;
        margin-top: 30px;
        margin-bottom: 5px;
      }
      
      .signature-name {
        font-weight: bold;
      }
      
      .signature-title {
        font-style: italic;
        font-size: 12px;
      }
      
      .signature-date {
        margin-top: 15px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 3, textAlign: 'center', boxShadow: 3 }}>
          <Container>
            <Typography variant="h4" component="h1" gutterBottom>
              QuickPact AI
            </Typography>
            <Typography variant="subtitle1">
              Generate professional legal contracts powered by AI
            </Typography>
            <Button 
              onClick={() => setShowInstructions(true)}
              color="secondary" 
              variant="contained" 
              size="small" 
              sx={{ mt: 2 }}
              startIcon={<InfoIcon />}
            >
              How to Use
            </Button>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {step === 1 ? (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
              <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel id="contract-type-label">Select Contract Type</InputLabel>
                  <Select
                    labelId="contract-type-label"
                    id="contract-type"
                    value={contractType}
                    label="Select Contract Type"
                    onChange={(e) => setContractType(e.target.value)}
                  >
                    {contractTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  id="summary"
                  label="Describe your agreement"
                  multiline
                  rows={6}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Example: I need a roommate agreement between John Smith and Jane Doe for a rental property. The monthly rent is R1500 starting on January 1st, 2026."
                  helperText="Include details like parties involved, amounts, dates, and any specific terms. The AI will create a customized contract based on your description."
                  required
                  fullWidth
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <DescriptionIcon />}
                  >
                    {isGenerating ? 'Generating with AI...' : 'Generate Contract'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      Edit Contract Details
                    </Typography>
                    <Tooltip title="Regenerate contract with current details">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={regenerateContract}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <CircularProgress size={20} /> : <AutorenewIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Amount"
                      value={contractData.amount}
                      onChange={(e) => updateContractData('amount', e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R</InputAdornment>,
                      }}
                    />
                    
                    {contractType === 'roommate' && (
                      <TextField
                        label="Number of Roommates"
                        value={contractData.roommateCount}
                        onChange={(e) => updateContractData('roommateCount', e.target.value)}
                        size="small"
                        type="number"
                      />
                    )}
                    
                    <TextField
                      label="Start Date"
                      value={contractData.startDate}
                      onChange={(e) => updateContractData('startDate', e.target.value)}
                      size="small"
                      placeholder="e.g. January 1, 2026"
                    />
                    
                    <TextField
                      label="Party 1"
                      value={contractData.party1}
                      onChange={(e) => updateContractData('party1', e.target.value)}
                      size="small"
                    />
                    
                    <TextField
                      label="Party 2"
                      value={contractData.party2}
                      onChange={(e) => updateContractData('party2', e.target.value)}
                      size="small"
                    />
                    
                    <TextField
                      label="Address"
                      value={contractData.address}
                      onChange={(e) => updateContractData('address', e.target.value)}
                      size="small"
                    />
                    
                    <TextField
                      label="Term (months)"
                      value={contractData.term}
                      onChange={(e) => updateContractData('term', e.target.value)}
                      size="small"
                      type="number"
                    />
                    
                    <TextField
                      label="Notice Period (days)"
                      value={contractData.notice}
                      onChange={(e) => updateContractData('notice', e.target.value)}
                      size="small"
                      type="number"
                    />
                    
                    <Button
                      variant="outlined"
                      onClick={regenerateContract}
                      disabled={isGenerating}
                      startIcon={isGenerating ? <CircularProgress size={20} /> : <AutorenewIcon />}
                      sx={{ mt: 1 }}
                    >
                      {isGenerating ? 'Regenerating...' : 'Regenerate Contract'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={8} lg={9}>
                <Paper elevation={3} sx={{ mb: 3, overflow: 'auto', maxHeight: '70vh' }}>
                  <Box 
                    ref={contractRef} 
                    id="contract-content" 
                    className="contract-document"
                  >
                    <ReactMarkdown>{generatedContract}</ReactMarkdown>
                  </Box>
                </Paper>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                  <Button
                    onClick={() => setStep(1)}
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    fullWidth={isMobile}
                  >
                    Back to Editor
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
                    <Button
                      onClick={() => window.print()}
                      variant="outlined"
                      color="secondary"
                      startIcon={<PrintIcon />}
                      fullWidth={isMobile}
                    >
                      Print
                    </Button>
                    <Button
                      onClick={downloadPDF}
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      fullWidth={isMobile}
                    >
                      Download as PDF
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </Container>
        
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: 'primary.dark',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} QuickPact AI
          </Typography>
        </Box>
      </Box>
      
      <Snackbar
        open={downloadSuccess}
        autoHideDuration={3000}
        onClose={() => setDownloadSuccess(false)}
      >
        <Alert onClose={() => setDownloadSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Contract downloaded successfully!
        </Alert>
      </Snackbar>

      <Instructions open={showInstructions} onClose={() => setShowInstructions(false)} />
      
      {/* Add print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #contract-content, #contract-content * {
            visibility: visible;
          }
          #contract-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 25mm 20mm;
            box-sizing: border-box;
          }
        }
      `}</style>
    </ThemeProvider>
  );
}

export default App;
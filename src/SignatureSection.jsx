// Signature section component
const SignatureSection = () => {
    return (
      <div className="signature-section" style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
        <h2 style={{ textAlign: 'center' }}>SIGNATURES</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {/* First Party Signature Block */}
          <div style={{ width: '45%', minWidth: '250px', margin: '10px auto' }}>
            <div style={{ borderBottom: '1px solid black', height: '40px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0' }}>Signature</p>
            
            <div style={{ marginTop: '20px', borderBottom: '1px solid black', height: '25px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0' }}>Print Name</p>
            
            <div style={{ marginTop: '20px', borderBottom: '1px solid black', height: '25px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0' }}>Date</p>
          </div>
          
          {/* Second Party Signature Block */}
          <div style={{ width: '45%', minWidth: '250px', margin: '10px auto' }}>
            <div style={{ borderBottom: '1px solid black', height: '40px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0' }}>Signature</p>
            
            <div style={{ marginTop: '20px', borderBottom: '1px solid black', height: '25px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0' }}>Print Name</p>
            
            <div style={{ marginTop: '20px', borderBottom: '1px solid black', height: '25px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0' }}>Date</p>
          </div>
        </div>
        
        {/* Witness Section (Optional) */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ textAlign: 'center' }}>WITNESS (if required)</h3>
          <div style={{ width: '60%', margin: '20px auto' }}>
            <div style={{ borderBottom: '1px solid black', height: '40px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0', textAlign: 'center' }}>Witness Signature</p>
            
            <div style={{ marginTop: '20px', borderBottom: '1px solid black', height: '25px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0', textAlign: 'center' }}>Print Name</p>
            
            <div style={{ marginTop: '20px', borderBottom: '1px solid black', height: '25px' }}></div>
            <p style={{ marginTop: '5px', marginBottom: '0', textAlign: 'center' }}>Date</p>
          </div>
        </div>
      </div>
    );
  };
  
  // To use this component, you would add it at the end of your contract rendering:
  // Example usage in your ContractRenderer component:
  /*
  const ContractRenderer = ({ markdown, forPrinting = false }) => {
    return (
      <div className={`contract-document ${forPrinting ? 'for-printing' : ''}`}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
        <SignatureSection />
      </div>
    );
  };
  */
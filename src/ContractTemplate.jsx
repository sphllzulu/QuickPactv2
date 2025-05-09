// Simplified contract types for the AI-powered contract generator

// Contract type definitions
export const contractTypes = [
    { id: 'roommate', name: 'Roommate Agreement' },
    { id: 'rental', name: 'Rental Agreement' },
    { id: 'employment', name: 'Employment Contract' },
    { id: 'service', name: 'Service Agreement' },
    { id: 'nda', name: 'Non-Disclosure Agreement' },
    { id: 'sales', name: 'Sales Contract' },
    { id: 'loan', name: 'Loan Agreement' },
    { id: 'consulting', name: 'Consulting Agreement' },
    { id: 'partnership', name: 'Partnership Agreement' },
    { id: 'other', name: 'Other Contract Type' }
  ];
  
  // Export the standalone OpenAI integration function
  export async function generateContractWithAI(openai, summary, contractType) {
    try {
      const typeLabel = contractTypes.find(c => c.id === contractType)?.name || contractType;
      const prompt = `Create a legally formatted ${typeLabel} contract based on this summary: ${summary}. Format it with markdown headings and sections. Use "R" as the currency symbol.`;
          
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a legal assistant that drafts professional contracts with proper structure and all necessary legal clauses.' },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-3.5-turbo',
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating contract:', error);
      return 'Error generating contract. Please try again.';
    }
  }
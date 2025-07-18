const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. AI features will be disabled.');
}

export interface TransactionExtraction {
  transactions: Array<{
    date: string;
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense';
  }>;
  analysis: string;
  confidence: number;
  isValidDocument: boolean;
  documentType: 'receipt' | 'bill' | 'invoice' | 'statement' | 'other';
  rejectionReason?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export const extractTransactionsFromImage = async (imageData: string): Promise<TransactionExtraction> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a financial assistant that analyzes and extracts transaction data from receipts, bills, invoices, and financial statements.
            
            FIRST: Determine if this is a valid financial document (receipt, bill, invoice, bank statement, etc.)
            REJECT if the image contains:
            - Non-financial content (photos, memes, random text, etc.)
            - Unreadable or corrupted images
            - Documents not related to financial transactions
            
            IF VALID: Extract ALL transactions from the document. Many receipts contain multiple items/transactions.
            
            Return a JSON object with:
            - isValidDocument: boolean (true only for receipts, bills, invoices, statements)
            - documentType: 'receipt' | 'bill' | 'invoice' | 'statement' | 'other'
            - rejectionReason: string (if isValidDocument is false, explain why)
            - transactions: array of ALL transactions found {date, amount, category, description, type}
            - analysis: detailed explanation of what you found and extracted
            - confidence: number 0-1 indicating confidence in extraction
            
            Categories should be one of: food, transportation, education, entertainment, shopping, health, utilities, rent, income, other
            Type should be 'expense' or 'income'
            Use today's date if date is unclear.
            
            For receipts with multiple items, create separate transactions for each significant item or group similar items.
            For bills, extract each line item as a separate transaction if they represent different services.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image and extract all transaction information if it is a valid financial document (receipt, bill, invoice, or statement). If it is not a financial document, reject it with an explanation.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    return parsed;
    
  } catch (error) {
    console.error('Error extracting transactions:', error);
    throw error;
  }
};

export const chatAboutReceipt = async (
  message: string, 
  imageData?: string, 
  context?: string,
  transactions?: any[]
): Promise<ChatResponse> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a helpful financial assistant specializing in explaining bills, receipts, and transactions to students. 
        You can help with:
        - Explaining charges and fees
        - Verifying if prices are reasonable
        - Breaking down complex bills
        - Suggesting better spending categories
        - Identifying potential errors or fraud
        
        Be friendly, educational, and focus on helping students understand their finances better.`
      }
    ];

    // Add transaction history context if provided
    if (transactions && transactions.length > 0) {
      const transactionSummary = transactions.slice(-50).map(t => 
        `${t.date}: ${t.type === 'income' ? '+' : '-'}$${t.amount} - ${t.description} (${t.category})`
      ).join('\n');
      
      messages.push({
        role: 'system',
        content: `Here is the user's recent transaction history for context:\n${transactionSummary}\n\nUse this information to provide personalized insights and answer questions about their spending patterns, budgets, and financial habits.`
      });
    }

    if (context) {
      messages.push({
        role: 'system',
        content: `Context about the current receipt/bill: ${context}`
      });
    }

    const userMessage: any = {
      role: 'user',
      content: imageData ? [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: imageData } }
      ] : message
    };

    messages.push(userMessage);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageData ? 'gpt-4-turbo' : 'gpt-4-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return {
      message: content,
      suggestions: [] // Could be enhanced to include suggestions
    };
    
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};

export const generateFinancialInsights = async (transactions: any[]): Promise<string[]> => {
  if (!OPENAI_API_KEY || transactions.length === 0) {
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a financial advisor for students. Analyze the transaction data and provide 3-5 actionable insights.
            Focus on spending patterns, budgeting tips, and financial health for students.
            Return insights as a JSON array of strings.`
          },
          {
            role: 'user',
            content: `Analyze these transactions and provide insights: ${JSON.stringify(transactions.slice(-20))}`
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return [];
    }

    const insights = JSON.parse(content);
    return Array.isArray(insights) ? insights : [];
    
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
};
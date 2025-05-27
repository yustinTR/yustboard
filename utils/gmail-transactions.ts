import { EmailMessage, fetchEmails } from './google-gmail';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  category: string;
  merchant: string;
  status: 'completed' | 'pending' | 'refunded';
  type: 'expense' | 'income' | 'refund';
  source: 'email';
  sourceDetails: {
    emailId: string;
    from: string;
    subject: string;
    timestamp: Date;
  };
}

// Transaction extraction patterns
interface TransactionPattern {
  source: string; // Email domain or name
  subjectPatterns: RegExp[]; // Patterns to match in email subject
  bodyPatterns?: {
    amount: RegExp;
    description?: RegExp;
    date?: RegExp;
    merchant?: RegExp;
    status?: RegExp;
  };
  category: string;
  type: 'expense' | 'income' | 'refund';
}

// Common transaction patterns for popular services
const transactionPatterns: TransactionPattern[] = [
  // Uber - Further enhanced with more detailed patterns for better detection
  {
    source: 'uber.com',
    subjectPatterns: [
      /your (?:uber|ubereats) receipt/i,
      /your (?:trip|order|ride) with uber/i,
      /thanks for riding/i,
      /receipt from (?:your trip|your ride|uber)/i,
      /uber(eats)? order/i,
      /your uber (?:ride|eats) receipt/i,
      /uber receipt:? .+/i,
      /rit met Uber/i,
      /bedankt voor het rijden met uber/i,  // Dutch: Thanks for riding with Uber
      /je uber(?:eats)? bon/i               // Dutch: Your Uber(Eats) receipt
    ],
    bodyPatterns: {
      // Enhanced Uber patterns to detect various formats including international formats
      amount: /(?:Total|Amount|Trip total|Totaal|Total fare|Total trip price|Trip price|Price|Ritprijs|Prijs|Fare|Subtotal|Order total):?\s*[$€£]?\s*([\d.,]+)[$€£]?/i,
      description: /(?:trip|ride|order|rit|bestelling) (?:with|met) uber|(?:from|to|van|naar):?\s*([^<\n]+)/i,
      merchant: /(?:driver|restaurant|store|partner|chauffeur|winkel):?\s*([^<\n]+)/i
    },
    category: 'Transportation',
    type: 'expense'
  },
  
  // UberEats - Specific pattern for food orders
  {
    source: 'uber.com',
    subjectPatterns: [
      /your uber ?eats order/i,
      /your order from .+ has been delivered/i,
      /uber ?eats:? receipt/i,
      /your uber ?eats receipt/i,
      /bedankt voor je bestelling/i,        // Dutch: Thanks for your order
      /je uber ?eats bestelling/i,          // Dutch: Your UberEats order
      /je bestelling is onderweg/i          // Dutch: Your order is on the way
    ],
    bodyPatterns: {
      amount: /(?:Total|Amount|Order total|Totaal|Bestelbedrag|Total amount charged):?\s*[$€£]?\s*([\d.,]+)[$€£]?/i,
      description: /(?:order|bestelling) (?:from|van):?\s*([^<\n]+)/i,
      merchant: /(?:restaurant|store|partner|restaurant|winkel):?\s*([^<\n]+)/i
    },
    category: 'Food & Dining',
    type: 'expense'
  },
  
  // American Express - Significantly enhanced with more detailed patterns
  {
    source: 'americanexpress.com',
    subjectPatterns: [
      /your american express/i,
      /your (?:amex|american express) statement/i,
      /your (?:amex|american express) account/i,
      /your (?:amex|american express) card/i,
      /your (?:amex|american express) bill/i,
      /american express payment confirmation/i,
      /transaction alert/i,
      /your transaction with american express/i,
      /you have a new (?:amex|american express) notification/i,
      /recent card(?:member)? transaction/i,
      /purchase alert/i,
      /charge on your card/i,
      /payment received/i,
      /je american express (?:transactie|betaling)/i,  // Dutch: Your American Express transaction/payment
      /american express: aankoop/i                     // Dutch: American Express: purchase
    ],
    bodyPatterns: {
      // More comprehensive patterns for amounts with international support
      amount: /(?:Amount|Total|Charge|Payment|Purchase|Transaction|Bedrag|Transactie|Betaling|Aankoop):?\s*[$€£]?\s*([\d,.]+)[$€£]?|[$€£]\s*([\d,.]+)/i,
      description: /(?:purchase|transaction|payment|charge|aankoop|transactie|betaling) (?:at|with|to|from|bij|van|met):?\s*([^<\n.,]+)/i,
      merchant: /(?:merchant|vendor|retailer|business|bedrijf|winkel|handelaar):?\s*([^<\n.,]+)/i
    },
    category: 'Credit Card',
    type: 'expense'
  },
  
  // American Express Transaction Alert - Specific format
  {
    source: 'americanexpress.com',
    subjectPatterns: [
      /transaction alert/i,
      /purchase alert/i,
      /recent transaction/i,
      /charge on your card/i
    ],
    bodyPatterns: {
      // Specific patterns for transaction alerts which have a different format
      amount: /(?:in the amount of|for an amount of|for|ter waarde van)\s*[$€£]?\s*([\d,.]+)[$€£]?|[$€£]\s*([\d,.]+)/i,
      description: /(?:at|with|to|from|bij|van):?\s*([^<\n.,]+)/i,
      merchant: /(?:merchant|vendor|retailer|business|bedrijf|winkel|handelaar):?\s*([^<\n.,]+)|(?:at|with|to|from|bij|van):?\s*([^<\n.,]+)/i
    },
    category: 'Credit Card',
    type: 'expense'
  },
  
  // PayPal
  {
    source: 'paypal.com',
    subjectPatterns: [
      /receipt for your payment/i,
      /you sent a payment/i,
      /you've received a payment/i,
      /paypal payment confirmation/i,
      /payment received/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Bedrag|Totaal):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i,
      description: /(?:description|for|item|transaction|payment for|voor):?\s*([^<\n]+)/i,
      merchant: /(?:to|merchant|business|aan):?\s*([^<\n]+)/i
    },
    category: 'Online Payment',
    type: 'expense'
  },
  
  // PayPal Received Money
  {
    source: 'paypal.com',
    subjectPatterns: [
      /you've received money/i,
      /you've received a payment/i,
      /you've got money/i,
      /payment received/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Bedrag):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i,
      description: /(?:description|for|item|transaction|payment for|voor):?\s*([^<\n]+)/i,
      merchant: /(?:from|van):?\s*([^<\n]+)/i
    },
    category: 'Online Payment',
    type: 'income'
  },
  
  // Amazon
  {
    source: 'amazon',
    subjectPatterns: [
      /your amazon\.com order/i,
      /your order has shipped/i,
      /your amazon order .* has shipped/i,
      /your amazon\.nl order/i,
      /your amazon purchase/i,
      /amazon order confirmation/i
    ],
    bodyPatterns: {
      amount: /(?:Total|Order Total|Grand Total|Totaal|Bestelbedrag):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i,
      description: /(?:order|item|purchased|buy|bought|bestelling):?\s*([^<\n]+)/i
    },
    category: 'Shopping',
    type: 'expense'
  },
  
  // Bol.com - New pattern for Dutch shoppers
  {
    source: 'bol.com',
    subjectPatterns: [
      /je bestelling/i,
      /je aankoop/i,
      /bol\.com (?:bestelling|order)/i,
      /bedankt voor je bestelling/i,
      /bevestiging van je bestelling/i
    ],
    bodyPatterns: {
      amount: /(?:Totaal|Totaalbedrag|Bestelbedrag):?\s*[€]?\s*([\d,.]+)[€]?/i,
      description: /(?:bestelling|artikel|product|aankoop):?\s*([^<\n]+)/i
    },
    category: 'Shopping',
    type: 'expense'
  },
  
  // Stripe
  {
    source: 'stripe.com',
    subjectPatterns: [
      /payment receipt/i,
      /receipt from/i,
      /your .* receipt/i,
      /payment confirmation/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Bedrag):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i,
      description: /(?:description|for|item|purchased|voor):?\s*([^<\n]+)/i
    },
    category: 'Online Payment',
    type: 'expense'
  },
  
  // Klarna
  {
    source: 'klarna',
    subjectPatterns: [
      /your klarna purchase/i,
      /payment confirmation/i,
      /your order with/i,
      /je klarna aankoop/i,
      /betalingsbevestiging/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Price|Bedrag|Totaal|Prijs):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i,
      description: /(?:you purchased|order|item|je hebt gekocht|bestelling|artikel):?\s*([^<\n]+)/i,
      merchant: /(?:from|at|merchant|van|bij|verkoper):?\s*([^<\n]+)/i
    },
    category: 'Shopping',
    type: 'expense'
  },
  
  // Rent
  {
    source: 'rent',
    subjectPatterns: [
      /rent (?:payment|receipt)/i,
      /your monthly rent/i,
      /rent confirmation/i,
      /huur(betaling)?/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Rent|Bedrag|Huur):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i
    },
    category: 'Housing',
    type: 'expense'
  },
  
  // Utility Bill
  {
    source: 'utility',
    subjectPatterns: [
      /(?:electric|gas|water|internet|phone) bill/i,
      /utility (?:bill|payment)/i,
      /your (?:monthly|weekly) (?:bill|statement)/i,
      /(?:elektriciteit|gas|water|internet|telefoon) (?:rekening|factuur)/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Due|Bedrag|Totaal|Te betalen):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i
    },
    category: 'Utilities',
    type: 'expense'
  },
  
  // Salary / Income
  {
    source: 'salary',
    subjectPatterns: [
      /(?:salary|payment|payslip|direct deposit)/i,
      /your (?:payment|salary) has been processed/i,
      /(?:salaris|betaling|loonstrook)/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Net|Gross|Bedrag|Netto|Bruto):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i
    },
    category: 'Income',
    type: 'income'
  },
  
  // Subscriptions
  {
    source: 'subscription',
    subjectPatterns: [
      /your (?:subscription|membership)/i,
      /(?:netflix|spotify|disney|hbo|apple) (?:receipt|invoice|payment)/i,
      /your (?:monthly|annual|weekly) subscription/i,
      /je (?:abonnement|lidmaatschap)/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Charge|Bedrag):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i
    },
    category: 'Subscriptions',
    type: 'expense'
  },
  
  // Generic Transactions
  {
    source: 'transaction',
    subjectPatterns: [
      /(?:payment|transaction|purchase|receipt|invoice)/i,
      /your (?:recent|new) (?:purchase|transaction)/i,
      /(?:betaling|transactie|aankoop|bon|factuur)/i
    ],
    bodyPatterns: {
      amount: /(?:Amount|Total|Payment|Price|Bedrag|Totaal|Prijs):?\s*[$€£]?\s*([\d,.]+)[$€£]?/i,
      description: /(?:for|item|description|purchased|voor|artikel|omschrijving|gekocht):?\s*([^<\n]+)/i
    },
    category: 'Other',
    type: 'expense'
  }
];

// Common categories
export const transactionCategories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Travel',
  'Health',
  'Education',
  'Subscriptions',
  'Income',
  'Online Payment',
  'Other'
];

// Helper function to clean amount string and convert to number
function parseAmount(amountStr: string, type: 'expense' | 'income' | 'refund'): number {
  // Remove currency symbols and non-numeric characters except for decimal points
  const cleaned = amountStr.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
  
  // Find the last period as decimal point
  let amount: number;
  if (cleaned.lastIndexOf('.') > 0) {
    const parts = cleaned.split('.');
    const decimal = parts.pop();
    amount = parseFloat(`${parts.join('')}.${decimal}`);
  } else {
    amount = parseFloat(cleaned);
  }
  
  // Make sure expenses are negative and income is positive
  if (type === 'expense' && amount > 0) {
    amount = -amount;
  } else if ((type === 'income' || type === 'refund') && amount < 0) {
    amount = Math.abs(amount);
  }
  
  return amount;
}

// Helper function to try to detect currency from email content
function detectCurrency(content: string): string {
  if (content.includes('$') || content.includes('USD')) return 'USD';
  if (content.includes('€') || content.includes('EUR')) return 'EUR';
  if (content.includes('£') || content.includes('GBP')) return 'GBP';
  return 'USD'; // Default currency
}

// Extract transaction data from an email
function extractTransactionFromEmail(email: EmailMessage): Transaction | null {
  const fromDomain = email.from.email.split('@')[1].toLowerCase();
  const subject = email.subject;
  const content = email.snippet + (email.body || '');
  
  // Check each pattern to see if this email matches a transaction pattern
  for (const pattern of transactionPatterns) {
    // Check if email is from the source or contains source in domain/name
    const isFromSource = 
      fromDomain.includes(pattern.source.toLowerCase()) || 
      email.from.name?.toLowerCase().includes(pattern.source.toLowerCase()) ||
      subject.toLowerCase().includes(pattern.source.toLowerCase());
    
    if (!isFromSource) {
      debugLog(`Skipping pattern for source "${pattern.source}" - email source doesn't match`);
      continue;
    }
    
    // Check if subject matches any of the patterns
    let matchedSubjectPattern: RegExp | null = null;
    for (const p of pattern.subjectPatterns) {
      if (p.test(subject)) {
        matchedSubjectPattern = p;
        break;
      }
    }
    
    if (!matchedSubjectPattern) {
      debugLog(`Email source matches "${pattern.source}" but subject doesn't match any pattern`);
      continue;
    }
    
    debugLog(`Found matching pattern for source "${pattern.source}"`);
    debugLog(`Subject matched pattern: ${matchedSubjectPattern.toString()}`);
    
    // If we have a match, try to extract transaction details
    let amount: number | null = null;
    let description = '';
    let merchant = '';
    let status: 'completed' | 'pending' | 'refunded' = 'completed';
    
    // Try to extract amount
    if (pattern.bodyPatterns?.amount) {
      const amountMatch = content.match(pattern.bodyPatterns.amount);
      if (amountMatch && amountMatch[1]) {
        amount = parseAmount(amountMatch[1], pattern.type);
        debugLog(`Extracted amount: ${amountMatch[1]} => ${amount}`);
      } else {
        debugLog(`Failed to extract amount using pattern: ${pattern.bodyPatterns.amount.toString()}`);
      }
    }
    
    // If no amount found, skip this transaction
    if (amount === null) {
      debugLog('No amount found, skipping transaction');
      continue;
    }
    
    // Try to extract description
    if (pattern.bodyPatterns?.description) {
      const descMatch = content.match(pattern.bodyPatterns.description);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
        debugLog(`Extracted description: "${description}"`);
      } else {
        debugLog(`Failed to extract description using pattern: ${pattern.bodyPatterns.description.toString()}`);
      }
    }
    
    // If no description, use subject
    if (!description) {
      description = subject;
      debugLog(`Using subject as description: "${description}"`);
    }
    
    // Try to extract merchant
    if (pattern.bodyPatterns?.merchant) {
      const merchantMatch = content.match(pattern.bodyPatterns.merchant);
      if (merchantMatch && merchantMatch[1]) {
        merchant = merchantMatch[1].trim();
        debugLog(`Extracted merchant: "${merchant}"`);
      } else {
        debugLog(`Failed to extract merchant using pattern: ${pattern.bodyPatterns.merchant.toString()}`);
      }
    }
    
    // If no merchant extracted, use the email sender
    if (!merchant) {
      merchant = email.from.name || email.from.email.split('@')[0];
      debugLog(`Using sender as merchant: "${merchant}"`);
    }
    
    // Try to extract status
    if (pattern.bodyPatterns?.status) {
      const statusMatch = content.match(pattern.bodyPatterns.status);
      if (statusMatch && statusMatch[1]) {
        const statusText = statusMatch[1].toLowerCase();
        if (statusText.includes('refund') || statusText.includes('returned')) {
          status = 'refunded';
        } else if (statusText.includes('pending') || statusText.includes('processing')) {
          status = 'pending';
        }
        debugLog(`Extracted status: "${status}"`);
      }
    }
    
    // Detect refunds in subject or description
    if (subject.toLowerCase().includes('refund') || description.toLowerCase().includes('refund')) {
      status = 'refunded';
      debugLog(`Detected refund in subject/description, setting status to refunded`);
      if (pattern.type === 'expense') {
        // Refund of an expense is positive (money coming back to you)
        amount = Math.abs(amount);
        debugLog(`Converted expense to refund, amount adjusted to positive: ${amount}`);
      }
    }
    
    // Get currency
    const currency = detectCurrency(content);
    debugLog(`Detected currency: ${currency}`);
    
    // Create a transaction object
    debugLog(`Successfully extracted transaction from email pattern-matching`);
    return {
      id: `email_${email.id}`,
      date: new Date(email.date),
      amount,
      currency,
      description,
      category: pattern.category,
      merchant,
      status,
      type: pattern.type,
      source: 'email',
      sourceDetails: {
        emailId: email.id,
        from: email.from.email,
        subject: email.subject,
        timestamp: new Date(email.date)
      }
    };
  }
  
  debugLog(`No matching transaction patterns found for this email`);
  return null;
}

// We don't use a persistent deduplication set anymore as it causes issues with refreshing
// Instead, we'll create a new set for each function call

// Extract currency amount with support for various formats
function extractCurrencyAmount(text: string): { amount: number; currency: string } | null {
  // Match various currency formats (€, $, £, etc.)
  // Support both European (1.234,56) and American (1,234.56) formats
  const patterns = [
    // European format with € symbol (€ 123,45)
    /[€]\s*(\d{1,3}(?:[.]\d{3})*,\d{2})/i,
    // American format with $ symbol ($123.45)
    /[$]\s*(\d{1,3}(?:[,]\d{3})*\.\d{2})/i,
    // British format with £ symbol (£123.45)
    /[£]\s*(\d{1,3}(?:[,]\d{3})*\.\d{2})/i,
    // Format with currency code before amount (EUR 123,45)
    /(EUR|USD|GBP)\s+(\d{1,3}(?:[.]\d{3})*,\d{2}|\d{1,3}(?:[,]\d{3})*\.\d{2})/i,
    // Format with currency code after amount (123,45 EUR)
    /(\d{1,3}(?:[.]\d{3})*,\d{2}|\d{1,3}(?:[,]\d{3})*\.\d{2})\s+(EUR|USD|GBP)/i,
    // General amount with nearby currency indicator
    /(?:total|amount|price|payment|total amount|trip total|totaal|bedrag|prijs)(?:.{0,30})([$€£]\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*[$€£]|(?:EUR|USD|GBP)\s+\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s+(?:EUR|USD|GBP))/i,
    // Simple number formats that are likely currency amounts
    /(?:total|amount|price|payment|charge|betaling|kosten):?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    // Uber specific formats
    /(?:trip total|fare|total fare|ritprijs):?\s*[$€£]?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    // American Express specific formats
    /(?:in the amount of|for an amount of|ter waarde van):?\s*[$€£]?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i
  ];
  
  let match: RegExpExecArray | null = null;
  let matchedPattern = -1;
  
  // Try each pattern
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    match = pattern.exec(text);
    if (match) {
      matchedPattern = i;
      break;
    }
  }
  
  if (!match) return null;
  
  let amount: string;
  let currency = 'EUR'; // Default to EUR
  
  // Parse based on which pattern matched
  switch (matchedPattern) {
    case 0: // € symbol, European format
      amount = match[1].replace('.', '').replace(',', '.');
      currency = 'EUR';
      break;
    case 1: // $ symbol, American format
      amount = match[1].replace(',', '');
      currency = 'USD';
      break;
    case 2: // £ symbol, British format
      amount = match[1].replace(',', '');
      currency = 'GBP';
      break;
    case 3: // Currency code before amount
      currency = match[1].toUpperCase();
      amount = match[2].includes(',')
        ? match[2].replace('.', '').replace(',', '.') // European format
        : match[2].replace(',', ''); // American format
      break;
    case 4: // Currency code after amount
      currency = match[2].toUpperCase();
      amount = match[1].includes(',')
        ? match[1].replace('.', '').replace(',', '.') // European format
        : match[1].replace(',', ''); // American format
      break;
    case 5: // General pattern
      // Extract the amount part from the matched string
      const fullMatch = match[1];
      if (fullMatch.includes('€') || fullMatch.includes('EUR')) {
        currency = 'EUR';
      } else if (fullMatch.includes('$') || fullMatch.includes('USD')) {
        currency = 'USD';
      } else if (fullMatch.includes('£') || fullMatch.includes('GBP')) {
        currency = 'GBP';
      }
      
      // Extract just the numeric part
      const numericMatch = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/.exec(fullMatch);
      if (!numericMatch) return null;
      
      // Convert to standard format
      amount = numericMatch[1].includes(',')
        ? numericMatch[1].replace('.', '').replace(',', '.') // European format
        : numericMatch[1].replace(',', ''); // American format
      break;
    default:
      return null;
  }
  
  return {
    amount: parseFloat(amount),
    currency
  };
}

// Extract date from text with various formats
function extractDate(text: string): Date | null {
  // Match various date formats
  const patterns = [
    // ISO format: 2023-05-21
    /(\d{4}-\d{2}-\d{2})/,
    // European format: 21/05/2023 or 21-05-2023
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // American format: 05/21/2023 or 05-21-2023
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // Text format: 21 May 2023 or May 21, 2023
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})|([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/,
    // Common formats for "X days ago" or "yesterday"
    /(?:yesterday|(\d+)\s+days?\s+ago)/i
  ];
  
  let match: RegExpExecArray | null = null;
  let matchedPattern = -1;
  
  // Try each pattern
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    match = pattern.exec(text);
    if (match) {
      matchedPattern = i;
      break;
    }
  }
  
  if (!match) return null;
  
  const now = new Date();
  let date: Date;
  
  // Parse based on which pattern matched
  switch (matchedPattern) {
    case 0: // ISO format
      return new Date(match[1]);
    case 1: // European format
      return new Date(`${match[3]}-${match[2]}-${match[1]}`);
    case 2: // American format
      return new Date(`${match[3]}-${match[1]}-${match[2]}`);
    case 3: // Text format
      if (match[1]) {
        // 21 May 2023 format
        const day = parseInt(match[1]);
        const month = getMonthNumber(match[2]);
        const year = parseInt(match[3]);
        if (month === -1) return null;
        return new Date(year, month, day);
      } else {
        // May 21, 2023 format
        const day = parseInt(match[5]);
        const month = getMonthNumber(match[4]);
        const year = parseInt(match[6]);
        if (month === -1) return null;
        return new Date(year, month, day);
      }
    case 4: // "X days ago" or "yesterday"
      if (match[0].toLowerCase() === 'yesterday') {
        date = new Date(now);
        date.setDate(date.getDate() - 1);
        return date;
      } else if (match[1]) {
        const daysAgo = parseInt(match[1]);
        date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date;
      }
      return null;
    default:
      return null;
  }
}

// Helper function to convert month name to number
function getMonthNumber(monthName: string): number {
  const months = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };
  
  const key = monthName.toLowerCase().substring(0, 3);
  return key in months ? months[key as keyof typeof months] : -1;
}

// Extract merchant name from email
function extractMerchant(email: EmailMessage): string {
  const fromName = email.from.name || '';
  const fromEmail = email.from.email || '';
  
  // If from name exists and isn't just an email, use it
  if (fromName && !fromName.includes('@')) {
    // Clean up common patterns in sender names
    return fromName
      .replace(/^[""']|[""']$/g, '') // Remove quotes
      .replace(/\bno-?reply\b/i, '') // Remove 'noreply' or 'no-reply'
      .replace(/\b(?:billing|account|service|customer|support|team|info|mail)\b/i, '') // Remove common terms
      .replace(/<.*?>/, '') // Remove anything in angle brackets
      .trim();
  }
  
  // Otherwise, extract domain from email and clean it up
  const domain = fromEmail.split('@')[1] || '';
  const parts = domain.split('.');
  
  // Use the main part of the domain (e.g., 'example' from 'example.com')
  if (parts.length >= 2) {
    return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
  }
  
  return domain || 'Unknown Merchant';
}

// Debug flag to enable detailed logging
let DEBUG_TRANSACTIONS = false;

// Helper to log debug information
function debugLog(...args: any[]) {
  if (DEBUG_TRANSACTIONS) {
    console.log('[TRANSACTION-DEBUG]', ...args);
  }
}

// Fetch transactions from Gmail
export async function fetchTransactionsFromGmail(
  accessToken: string,
  daysBack: number = 30,
  maxResults: number = 100,
  debug: boolean = false
): Promise<Transaction[]> {
  // Set debug mode based on parameter
  DEBUG_TRANSACTIONS = debug;
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  // Format dates for Gmail query
  const after = startDate.toISOString().split('T')[0];
  
  // Create Gmail search query for specific providers like Uber and American Express
  // This query is more targeted to find emails that users are expecting
  const query = `newer_than:${daysBack}d (
    from:uber.com OR from:uber.nl OR from:email.uber.com OR from:uber@uber.com OR 
    from:noreply@uber.com OR from:ubereats@uber.com OR from:uber.eats@uber.com OR
    
    from:americanexpress.com OR from:email.americanexpress.com OR 
    from:amex@americanexpress.com OR from:amex.com OR 
    from:americanexpress@welcome.americanexpress.com OR 
    from:americanexpress@member.americanexpress.com OR
    from:americanexpress@email.americanexpress.com OR
    
    from:paypal.com OR from:service@paypal.com OR from:paypal@mail.paypal.com OR
    from:amazon.com OR from:amazon.nl OR from:amazon.de OR from:shipment-tracking@amazon.com OR
    from:bol.com OR from:order@bol.com OR from:no-reply@bol.com OR
    
    subject:"receipt" OR subject:"payment" OR subject:"transaction" OR
    subject:"payment confirmation" OR subject:"order confirmation" OR
    subject:"purchase" OR subject:"bestelling" OR subject:"betaling" OR
    
    (subject:"uber" AND (subject:"receipt" OR subject:"order" OR subject:"trip" OR subject:"ride")) OR
    (subject:"american express" OR subject:"amex") OR
    
    (subject:"transaction alert" OR subject:"purchase alert")
  )`;
  
  try {
    // Fetch emails that potentially contain transactions (both read and unread)
    debugLog('Fetching emails with query:', query);
    const result = await fetchEmails(accessToken, maxResults, query);
    const emails = result.emails || [];
    
    debugLog(`Found ${emails.length} potential transaction emails`);
    
    // Create a new deduplication set for this function call
    const processedMessageIds = new Set<string>();
    
    // Process each email to extract transactions
    const transactions: Transaction[] = [];
    
    for (const email of emails) {
      try {
        // Skip already processed emails (deduplication within this batch only)
        if (processedMessageIds.has(email.id)) {
          debugLog(`Skipping already processed email: ${email.id} - "${email.subject}"`);
          continue;
        }
        
        debugLog('--------------------------------------------------');
        debugLog(`Processing email: ${email.id}`);
        debugLog(`From: ${email.from.name} <${email.from.email}>`);
        debugLog(`Subject: ${email.subject}`);
        debugLog(`Date: ${new Date(email.date).toLocaleString()}`);
        
        // Add to this batch's processed set
        processedMessageIds.add(email.id);
        
        // First try the pattern-based extraction
        debugLog('Attempting pattern-based extraction...');
        let transaction = extractTransactionFromEmail(email);
        
        // If that fails, try the ML-style classification approach
        if (!transaction) {
          debugLog('Pattern-based extraction failed, trying ML-style approach...');
          transaction = classifyAndExtractTransaction(email);
        }
        
        if (transaction) {
          debugLog('Transaction found!', {
            amount: transaction.amount,
            currency: transaction.currency,
            merchant: transaction.merchant,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date
          });
          transactions.push(transaction);
        } else {
          debugLog('No transaction found in this email');
        }
      } catch (error) {
        console.error("Error extracting transaction from email:", error);
        debugLog('Error processing email:', error);
      }
    }
    
    debugLog(`Extracted ${transactions.length} transactions from ${emails.length} emails`);
    
    // Sort by date (newest first)
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error fetching transactions from Gmail:", error);
    debugLog('Error fetching transactions:', error);
    return [];
  }
}

// ML-style classification approach for transaction detection
function classifyAndExtractTransaction(email: EmailMessage): Transaction | null {
  const content = email.snippet + (email.body || '');
  const subject = email.subject || '';
  const fromDomain = email.from.email.split('@')[1]?.toLowerCase() || '';
  const fromName = email.from.name?.toLowerCase() || '';
  
  // Check if email contains both a currency pattern and a date
  const currencyInfo = extractCurrencyAmount(content) || extractCurrencyAmount(subject);
  const extractedDate = extractDate(content) || extractDate(subject) || new Date(email.date);
  
  if (!currencyInfo) {
    return null;
  }
  
  // Extract transaction details
  const { amount, currency } = currencyInfo;
  
  // Determine transaction type based on amount and content
  let type: 'expense' | 'income' | 'refund' = amount < 0 ? 'expense' : 'income';
  if (content.toLowerCase().includes('refund') || subject.toLowerCase().includes('refund') ||
      content.toLowerCase().includes('terugbetaling') || subject.toLowerCase().includes('terugbetaling') ||
      content.toLowerCase().includes('restitutie') || subject.toLowerCase().includes('restitutie')) {
    type = 'refund';
  }
  
  // Ensure expenses are negative
  let adjustedAmount = amount;
  if (type === 'expense' && adjustedAmount > 0) {
    adjustedAmount = -adjustedAmount;
  }
  
  // Determine category with enhanced provider-specific detection
  let category = 'Other';
  
  // Check for specific providers in the email domain or sender name
  if (fromDomain.includes('uber') || fromName.includes('uber') || 
      subject.toLowerCase().includes('uber')) {
    // Differentiate between UberEats and Uber rides
    if (content.toLowerCase().includes('eats') || subject.toLowerCase().includes('eats') ||
        content.toLowerCase().includes('food') || content.toLowerCase().includes('restaurant') ||
        content.toLowerCase().includes('meal') || content.toLowerCase().includes('order')) {
      category = 'Food & Dining';
    } else {
      category = 'Transportation';
    }
  } else if (fromDomain.includes('americanexpress') || fromName.includes('american express') || 
             fromName.includes('amex') || subject.toLowerCase().includes('american express') || 
             subject.toLowerCase().includes('amex')) {
    category = 'Credit Card';
  } else if (content.toLowerCase().includes('salary') || content.toLowerCase().includes('salaris') ||
             content.toLowerCase().includes('payment') || content.toLowerCase().includes('betaling')) {
    category = 'Income';
  } else if (content.toLowerCase().includes('food') || content.toLowerCase().includes('eten') ||
             content.toLowerCase().includes('restaurant') || content.toLowerCase().includes('meal') ||
             content.toLowerCase().includes('maaltijd')) {
    category = 'Food & Dining';
  } else if (content.toLowerCase().includes('transport') || content.toLowerCase().includes('travel') ||
             content.toLowerCase().includes('uber') || content.toLowerCase().includes('train') ||
             content.toLowerCase().includes('trein') || content.toLowerCase().includes('bus')) {
    category = 'Transportation';
  } else if (content.toLowerCase().includes('shop') || content.toLowerCase().includes('winkel') ||
             content.toLowerCase().includes('order') || content.toLowerCase().includes('bestelling')) {
    category = 'Shopping';
  }
  
  // Extract merchant
  const merchant = extractMerchant(email);
  
  // Create description from subject or first 100 chars of snippet
  const description = subject || content.substring(0, 100).trim();
  
  // Create transaction object
  return {
    id: `email_${email.id}`,
    date: extractedDate,
    amount: adjustedAmount,
    currency,
    description,
    category,
    merchant,
    status: 'completed',
    type,
    source: 'email',
    sourceDetails: {
      emailId: email.id,
      from: email.from.email,
      subject: email.subject,
      timestamp: new Date(email.date)
    }
  };
}

// Get transaction statistics
export function getTransactionStats(transactions: Transaction[]) {
  // Calculate total income, expenses, and balance
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome + totalExpenses; // expenses are negative
  
  // Group transactions by category
  const byCategory = transactions.reduce((acc, transaction) => {
    const { category } = transaction;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Math.abs(transaction.amount); // Use absolute value for the count
    return acc;
  }, {} as Record<string, number>);
  
  // Sort categories by amount
  const categories = Object.entries(byCategory)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  // Group transactions by day
  const byDay = transactions.reduce((acc, transaction) => {
    const dateStr = transaction.date.toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, amount: 0 };
    }
    acc[dateStr].amount += transaction.amount;
    return acc;
  }, {} as Record<string, { date: string; amount: number }>);
  
  // Sort days chronologically
  const dailySpending = Object.values(byDay).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    categories,
    dailySpending
  };
}
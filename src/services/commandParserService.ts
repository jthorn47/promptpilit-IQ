interface ParsedCommand {
  type: 'command';
  action: 'create' | 'submit' | 'open' | 'navigate' | 'search';
  object: string;
  context?: string;
  title: string;
  description: string;
  url?: string;
  createUrl?: string;
  submitUrl?: string;
  confidence: number;
}

class CommandParserService {
  private patterns = [
    // Create patterns
    {
      pattern: /^create\s+(proposal|prop)\s+for\s+(.+)$/i,
      action: 'create' as const,
      object: 'proposal',
      getResult: (match: RegExpMatchArray): ParsedCommand => ({
        type: 'command',
        action: 'create',
        object: 'proposal',
        context: match[2],
        title: `Create proposal for ${match[2]}`,
        description: `Create a new proposal for ${match[2]}`,
        createUrl: `/admin/proposals/new?company=${encodeURIComponent(match[2])}`,
        confidence: 0.9
      })
    },
    {
      pattern: /^(create|new)\s+(company|client)(?:\s+(.+))?$/i,
      action: 'create' as const,
      object: 'company',
      getResult: (match: RegExpMatchArray): ParsedCommand => ({
        type: 'command',
        action: 'create',
        object: 'company',
        context: match[3],
        title: `Create new company${match[3] ? ` (${match[3]})` : ''}`,
        description: 'Create a new company record',
        createUrl: '/admin/companies/new',
        confidence: 0.8
      })
    },

    // Submit patterns
    {
      pattern: /^submit\s+(timecard|time|hours)$/i,
      action: 'submit' as const,
      object: 'timecard',
      getResult: (): ParsedCommand => ({
        type: 'command',
        action: 'submit',
        object: 'timecard',
        title: 'Submit timecard',
        description: 'Submit your timecard for the current period',
        submitUrl: '/employee/timecard/submit',
        confidence: 0.95
      })
    },
    {
      pattern: /^submit\s+(training|course)$/i,
      action: 'submit' as const,
      object: 'training',
      getResult: (): ParsedCommand => ({
        type: 'command',
        action: 'submit',
        object: 'training',
        title: 'Submit training',
        description: 'Submit completed training assignments',
        submitUrl: '/learning/submit',
        confidence: 0.9
      })
    },

    // Navigation patterns
    {
      pattern: /^(go\s+to\s+|open\s+)?vault$/i,
      action: 'navigate' as const,
      object: 'vault',
      getResult: (): ParsedCommand => ({
        type: 'command',
        action: 'navigate',
        object: 'vault',
        title: 'Go to Vault',
        description: 'Access the document vault',
        url: '/vault',
        confidence: 0.95
      })
    },
    {
      pattern: /^(go\s+to\s+|open\s+)?(?:my\s+)?work$/i,
      action: 'navigate' as const,
      object: 'work',
      getResult: (): ParsedCommand => ({
        type: 'command',
        action: 'navigate',
        object: 'work',
        title: 'Go to My Work',
        description: 'View your tasks and assignments',
        url: '/admin/my-work',
        confidence: 0.9
      })
    },
    {
      pattern: /^(go\s+to\s+|open\s+)?dashboard$/i,
      action: 'navigate' as const,
      object: 'dashboard',
      getResult: (): ParsedCommand => ({
        type: 'command',
        action: 'navigate',
        object: 'dashboard',
        title: 'Go to Dashboard',
        description: 'View your main dashboard',
        url: '/admin/dashboard',
        confidence: 0.9
      })
    },
    {
      pattern: /^(go\s+to\s+|open\s+)?settings$/i,
      action: 'navigate' as const,
      object: 'settings',
      getResult: (): ParsedCommand => ({
        type: 'command',
        action: 'navigate',
        object: 'settings',
        title: 'Go to Settings',
        description: 'Access system settings',
        url: '/admin/settings',
        confidence: 0.9
      })
    },

    // Module patterns
    {
      pattern: /^connect\s+iq(?:\s+(.+))?$/i,
      action: 'navigate' as const,
      object: 'connect-iq',
      getResult: (match: RegExpMatchArray): ParsedCommand => {
        const subModule = match[1]?.toLowerCase();
        let url = '/connect-iq';
        let title = 'Go to Connect IQ';
        
        if (subModule === 'notes') {
          url = '/connect-iq/notes';
          title = 'Go to Connect IQ Notes';
        } else if (subModule === 'dashboard') {
          url = '/connect-iq/dashboard';
          title = 'Go to Connect IQ Dashboard';
        }
        
        return {
          type: 'command',
          action: 'navigate',
          object: 'connect-iq',
          context: subModule,
          title,
          description: 'Access Connect IQ module',
          url,
          confidence: 0.85
        };
      }
    },

    // Document patterns
    {
      pattern: /^(open|view)\s+(sb\s*553|sexual\s*harassment)(?:\s+for\s+(.+))?$/i,
      action: 'search' as const,
      object: 'policy',
      getResult: (match: RegExpMatchArray): ParsedCommand => ({
        type: 'command',
        action: 'search',
        object: 'policy',
        context: match[3],
        title: `Open SB 553 policy${match[3] ? ` for ${match[3]}` : ''}`,
        description: 'Access Sexual Harassment policy documentation',
        url: `/admin/policies/search?q=SB+553${match[3] ? `&company=${encodeURIComponent(match[3])}` : ''}`,
        confidence: 0.9
      })
    },

    // Generic search patterns
    {
      pattern: /^(find|search)\s+(.+)$/i,
      action: 'search' as const,
      object: 'general',
      getResult: (match: RegExpMatchArray): ParsedCommand => ({
        type: 'command',
        action: 'search',
        object: 'general',
        context: match[2],
        title: `Search for "${match[2]}"`,
        description: 'Search across all records and documents',
        url: `/admin/search?q=${encodeURIComponent(match[2])}`,
        confidence: 0.7
      })
    }
  ];

  parseCommand(input: string): ParsedCommand | null {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) return null;

    // Try to match against known patterns
    for (const pattern of this.patterns) {
      const match = trimmedInput.match(pattern.pattern);
      if (match) {
        return pattern.getResult(match);
      }
    }

    // If no pattern matches, check if it might be a navigation command
    const lowerInput = trimmedInput.toLowerCase();
    
    // Simple module navigation
    const modules = [
      { name: 'vault', url: '/vault' },
      { name: 'payroll', url: '/admin/payroll' },
      { name: 'benefits', url: '/admin/benefits' },
      { name: 'finance', url: '/admin/finance' },
      { name: 'crm', url: '/crm' },
      { name: 'learning', url: '/learning' },
      { name: 'training', url: '/learning' }
    ];

    for (const module of modules) {
      if (lowerInput === module.name || lowerInput === `go to ${module.name}`) {
        return {
          type: 'command',
          action: 'navigate',
          object: module.name,
          title: `Go to ${module.name.charAt(0).toUpperCase() + module.name.slice(1)}`,
          description: `Navigate to the ${module.name} module`,
          url: module.url,
          confidence: 0.8
        };
      }
    }

    return null;
  }

  // Get command suggestions based on partial input
  getSuggestions(partialInput: string): string[] {
    const suggestions = [
      'Create proposal for',
      'Submit timecard',
      'Go to Vault',
      'Open SB 553',
      'Connect IQ',
      'My Work',
      'Dashboard',
      'Settings'
    ];

    if (!partialInput.trim()) {
      return suggestions;
    }

    const lowerInput = partialInput.toLowerCase();
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(lowerInput)
    );
  }
}

export const commandParserService = new CommandParserService();
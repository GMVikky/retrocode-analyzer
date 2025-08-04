// /frontend/src/utils/languageDetector.ts

interface LanguagePattern {
  keywords: string[];
  patterns: RegExp[];
  extensions: string[];
  weight: number;
}

const LANGUAGE_PATTERNS: Record<string, LanguagePattern> = {
  python: {
    keywords: ['def ', 'import ', 'from ', 'class ', 'if __name__', 'print(', 'len(', 'range('],
    patterns: [
      /def\s+\w+\s*\(/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /if\s+__name__\s*==\s*['"']__main__['"']/,
      /print\s*\(/,
      /^\s*#.*$/m
    ],
    extensions: ['.py'],
    weight: 1
  },
  
  javascript: {
    keywords: ['function ', 'var ', 'let ', 'const ', 'console.log', '=> ', 'document.', 'window.'],
    patterns: [
      /function\s+\w+\s*\(/,
      /\w+\s*=>\s*/,
      /console\.log\s*\(/,
      /document\.\w+/,
      /window\.\w+/,
      /\/\*[\s\S]*?\*\//,
      /\/\/.*$/m
    ],
    extensions: ['.js'],
    weight: 1
  },
  
  typescript: {
    keywords: ['interface ', 'type ', ': string', ': number', ': boolean', 'export ', 'import '],
    patterns: [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /:\s*(string|number|boolean|void)/,
      /export\s+(interface|type|class|function)/,
      /import.*from/,
      /<.*>/
    ],
    extensions: ['.ts', '.tsx'],
    weight: 1.2
  },
  
  java: {
    keywords: ['public class', 'private ', 'public ', 'static ', 'void ', 'System.out'],
    patterns: [
      /public\s+class\s+\w+/,
      /private\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.print/,
      /import\s+java\./,
      /\/\*\*[\s\S]*?\*\//
    ],
    extensions: ['.java'],
    weight: 1.1
  },
  
  cpp: {
    keywords: ['#include', 'using namespace', 'std::', 'cout <<', 'cin >>', 'int main()'],
    patterns: [
      /#include\s*<.*>/,
      /using\s+namespace\s+std/,
      /std::\w+/,
      /cout\s*<<|cin\s*>>/,
      /int\s+main\s*\(\)/,
      /\/\/.*$/m
    ],
    extensions: ['.cpp', '.cc', '.cxx'],
    weight: 1
  },
  
  csharp: {
    keywords: ['using System', 'public class', 'Console.Write', 'namespace ', 'static void Main'],
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /Console\.Write/,
      /static\s+void\s+Main/,
      /public\s+class\s+\w+/
    ],
    extensions: ['.cs'],
    weight: 1
  },
  
  php: {
    keywords: ['<?php', 'echo ', '$_GET', '$_POST', 'function '],
    patterns: [
      /<\?php/,
      /echo\s+/,
      /\$\w+/,
      /\$_GET|\$_POST/,
      /function\s+\w+\s*\(/
    ],
    extensions: ['.php'],
    weight: 1
  },
  
  ruby: {
    keywords: ['def ', 'end', 'puts ', 'require ', 'class '],
    patterns: [
      /def\s+\w+/,
      /puts\s+/,
      /require\s+/,
      /class\s+\w+/,
      /@\w+/
    ],
    extensions: ['.rb'],
    weight: 1
  },
  
  go: {
    keywords: ['package ', 'import ', 'func ', 'var ', 'fmt.Print'],
    patterns: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /fmt\.Print/,
      /var\s+\w+\s+\w+/,
      /import\s*\(/
    ],
    extensions: ['.go'],
    weight: 1
  },
  
  rust: {
    keywords: ['fn ', 'let ', 'mut ', 'println!', 'use '],
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+(mut\s+)?\w+/,
      /println!\s*\(/,
      /use\s+\w+/,
      /&str|String/
    ],
    extensions: ['.rs'],
    weight: 1
  },
  
  swift: {
    keywords: ['func ', 'var ', 'let ', 'import Foundation', 'print('],
    patterns: [
      /func\s+\w+\s*\(/,
      /var\s+\w+\s*:/,
      /let\s+\w+\s*=/,
      /import\s+Foundation/,
      /print\s*\(/
    ],
    extensions: ['.swift'],
    weight: 1
  },
  
  kotlin: {
    keywords: ['fun ', 'val ', 'var ', 'println(', 'import '],
    patterns: [
      /fun\s+\w+\s*\(/,
      /val\s+\w+\s*=/,
      /var\s+\w+\s*:/,
      /println\s*\(/,
      /import\s+\w+/
    ],
    extensions: ['.kt'],
    weight: 1
  }
};

export function detectLanguage(code: string): string {
  if (!code || code.trim().length === 0) {
    return 'python'; // Default
  }
  
  const scores: Record<string, number> = {};
  
  // Initialize scores
  Object.keys(LANGUAGE_PATTERNS).forEach(lang => {
    scores[lang] = 0;
  });
  
  // Check each language pattern
  Object.entries(LANGUAGE_PATTERNS).forEach(([language, pattern]) => {
    let languageScore = 0;
    
    // Check keywords
    pattern.keywords.forEach(keyword => {
      const matches = (code.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
      languageScore += matches * pattern.weight;
    });
    
    // Check regex patterns
    pattern.patterns.forEach(regex => {
      const matches = (code.match(regex) || []).length;
      languageScore += matches * pattern.weight * 2; // Regex patterns are more specific
    });
    
    scores[language] = languageScore;
  });
  
  // Find the language with the highest score
  const sortedLanguages = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .filter(([,score]) => score > 0);
  
  if (sortedLanguages.length === 0) {
    return 'python'; // Default fallback
  }
  
  const [topLanguage, topScore] = sortedLanguages[0];
  
  // If the top score is very low, stick with current language
  if (topScore < 2) {
    return 'python'; // Default
  }
  
  return topLanguage;
}

export function getLanguageFromExtension(filename: string): string {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  
  for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.extensions.includes(extension)) {
      return language;
    }
  }
  
  return 'python'; // Default
}
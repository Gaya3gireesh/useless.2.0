import React from 'react';
import { ERROR_TYPES } from '../utils/codeGenerator';

const CodeLine = ({ lineNumber, text, hasError, errorType }) => {
  // Simple syntax highlighting function
  const highlightSyntax = (code) => {
    if (!code) return code;
    
    // Create tokens with their types
    const tokens = [];
    let currentIndex = 0;
    
    // Helper function to add a token
    const addToken = (type, value, start, end) => {
      tokens.push({ type, value, start, end });
    };
    
    // Simple tokenizer - process character by character
    while (currentIndex < code.length) {
      const char = code[currentIndex];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        currentIndex++;
        continue;
      }
      
      // Check for strings
      if (char === '"' || char === "'") {
        const quote = char;
        const start = currentIndex;
        currentIndex++; // skip opening quote
        
        let stringContent = quote;
        while (currentIndex < code.length && code[currentIndex] !== quote) {
          if (code[currentIndex] === '\\' && currentIndex + 1 < code.length) {
            stringContent += code[currentIndex] + code[currentIndex + 1];
            currentIndex += 2;
          } else {
            stringContent += code[currentIndex];
            currentIndex++;
          }
        }
        if (currentIndex < code.length) {
          stringContent += code[currentIndex]; // closing quote
          currentIndex++;
        }
        addToken('string', stringContent, start, currentIndex);
        continue;
      }
      
      // Check for comments
      if (char === '/' && currentIndex + 1 < code.length) {
        if (code[currentIndex + 1] === '/') {
          const start = currentIndex;
          while (currentIndex < code.length && code[currentIndex] !== '\n') {
            currentIndex++;
          }
          addToken('comment', code.substring(start, currentIndex), start, currentIndex);
          continue;
        }
      }
      
      // Check for numbers
      if (/\d/.test(char)) {
        const start = currentIndex;
        while (currentIndex < code.length && /[\d.]/.test(code[currentIndex])) {
          currentIndex++;
        }
        addToken('number', code.substring(start, currentIndex), start, currentIndex);
        continue;
      }
      
      // Check for identifiers/keywords
      if (/[a-zA-Z_$]/.test(char)) {
        const start = currentIndex;
        while (currentIndex < code.length && /[a-zA-Z0-9_$]/.test(code[currentIndex])) {
          currentIndex++;
        }
        const word = code.substring(start, currentIndex);
        
        // Check if it's a keyword
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'default', 'class', 'extends', 'constructor', 'this', 'new', 'try', 'catch', 'throw', 'async', 'await', 'true', 'false', 'null', 'undefined'];
        
        if (keywords.includes(word)) {
          addToken('keyword', word, start, currentIndex);
        } else {
          // Check if next non-whitespace is '(' for function names
          let nextIndex = currentIndex;
          while (nextIndex < code.length && /\s/.test(code[nextIndex])) {
            nextIndex++;
          }
          if (nextIndex < code.length && code[nextIndex] === '(') {
            addToken('function', word, start, currentIndex);
          } else {
            addToken('identifier', word, start, currentIndex);
          }
        }
        continue;
      }
      
      // Check for operators and punctuation
      if (/[+\-*\/=<>!&|%]/.test(char)) {
        addToken('operator', char, currentIndex, currentIndex + 1);
        currentIndex++;
        continue;
      }
      
      if (/[{}()\[\];,.]/.test(char)) {
        addToken('punctuation', char, currentIndex, currentIndex + 1);
        currentIndex++;
        continue;
      }
      
      // Default: just move to next character
      currentIndex++;
    }
    
    // Now build the highlighted string
    let result = '';
    let lastIndex = 0;
    
    tokens.forEach(token => {
      // Add any text between last token and this token
      if (token.start > lastIndex) {
        result += code.substring(lastIndex, token.start);
      }
      
      // Add the highlighted token
      switch (token.type) {
        case 'keyword':
          result += `<span class="keyword">${token.value}</span>`;
          break;
        case 'string':
          result += `<span class="string">${token.value}</span>`;
          break;
        case 'number':
          result += `<span class="number">${token.value}</span>`;
          break;
        case 'comment':
          result += `<span class="comment">${token.value}</span>`;
          break;
        case 'function':
          result += `<span class="function">${token.value}</span>`;
          break;
        case 'operator':
          result += `<span class="operator">${token.value}</span>`;
          break;
        case 'punctuation':
          result += `<span class="punctuation">${token.value}</span>`;
          break;
        default:
          result += token.value;
      }
      
      lastIndex = token.end;
    });
    
    // Add any remaining text
    if (lastIndex < code.length) {
      result += code.substring(lastIndex);
    }
    
    return result;
  };

  return (
    <div className={`code-line ${hasError ? 'has-error' : ''}`}>
      <span 
        className="code-content"
        dangerouslySetInnerHTML={{ __html: highlightSyntax(text) }}
      />
      {hasError && (
        <span 
          className="error-indicator"
          style={{ color: ERROR_TYPES[errorType]?.color || '#f44747' }}
          title={ERROR_TYPES[errorType]?.description || 'Syntax error'}
        >
          ⚠
        </span>
      )}
    </div>
  );
};

export default CodeLine;

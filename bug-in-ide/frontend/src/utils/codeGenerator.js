// Code generator with syntax errors for the bug hiding game
export const generateCodeWithErrors = () => {
  const codeTemplates = [
    {
      clean: "import React from 'react';",
      error: "import React from 'react'", // missing semicolon
      errorType: "missing_semicolon"
    },
    {
      clean: "import './App.css';",
      error: "import './App.css'", // missing semicolon
      errorType: "missing_semicolon"
    },
    {
      clean: "function App() {",
      error: "function App( {", // missing closing parenthesis
      errorType: "missing_paren"
    },
    {
      clean: "  const message = 'Hello, VSCode!';",
      error: "  const message = 'Hello, VSCode!", // missing closing quote
      errorType: "missing_quote"
    },
    {
      clean: "  const count = 42;",
      error: "  const count = 42", // missing semicolon
      errorType: "missing_semicolon"
    },
    {
      clean: "  return (",
      error: "  return [", // wrong bracket
      errorType: "wrong_bracket"
    },
    {
      clean: "    <div className=\"app\">",
      error: "    <div className=\"app>", // missing closing quote
      errorType: "missing_quote"
    },
    {
      clean: "      <h1>{message}</h1>",
      error: "      <h1>{message}</h1", // missing closing bracket
      errorType: "missing_bracket"
    },
    {
      clean: "      <p>Count: {count}</p>",
      error: "      <p>Count: {count</p>", // missing closing brace
      errorType: "missing_brace"
    },
    {
      clean: "      <button onClick={() => console.log('clicked')}>",
      error: "      <button onClick={) => console.log('clicked')}>", // missing opening paren
      errorType: "missing_paren"
    },
    {
      clean: "        Click me!",
      error: "        Click me!", // this stays clean
      errorType: null
    },
    {
      clean: "      </button>",
      error: "      </button", // missing closing bracket
      errorType: "missing_bracket"
    },
    {
      clean: "    </div>",
      error: "    </div", // missing closing bracket
      errorType: "missing_bracket"
    },
    {
      clean: "  );",
      error: "  )", // missing semicolon
      errorType: "missing_semicolon"
    },
    {
      clean: "}",
      error: "}", // stays clean
      errorType: null
    },
    {
      clean: "",
      error: "",
      errorType: null
    },
    {
      clean: "export default App;",
      error: "export default App", // missing semicolon
      errorType: "missing_semicolon"
    },
    {
      clean: "",
      error: "",
      errorType: null
    },
    {
      clean: "// More sample code...",
      error: "// More sample code...", // stays clean
      errorType: null
    },
    {
      clean: "const handleClick = () => {",
      error: "const handleClick = ( => {", // missing closing paren
      errorType: "missing_paren"
    },
    {
      clean: "  console.log('Button clicked!');",
      error: "  console.log('Button clicked!')", // missing semicolon
      errorType: "missing_semicolon"
    },
    {
      clean: "};",
      error: "}", // missing semicolon
      errorType: "missing_semicolon"
    }
  ];

  // Generate lines with errors at random positions
  const errorProbability = 0.4; // 40% chance of error per line
  const lines = codeTemplates.map((template, index) => {
    const shouldHaveError = Math.random() < errorProbability && template.errorType;
    
    return {
      lineNumber: index + 1,
      text: shouldHaveError ? template.error : template.clean,
      hasError: shouldHaveError,
      errorType: shouldHaveError ? template.errorType : null,
      isClean: !shouldHaveError
    };
  });

  return lines;
};

export const ERROR_TYPES = {
  missing_semicolon: { color: '#f44747', description: 'Missing semicolon' },
  missing_quote: { color: '#ff6b6b', description: 'Missing quote' },
  missing_paren: { color: '#ff8c42', description: 'Missing parenthesis' },
  missing_bracket: { color: '#ffbe0b', description: 'Missing bracket' },
  missing_brace: { color: '#fb8500', description: 'Missing brace' },
  wrong_bracket: { color: '#8ecae6', description: 'Wrong bracket type' }
};

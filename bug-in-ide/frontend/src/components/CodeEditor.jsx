import React from 'react';
import CodeLine from './CodeLine';
import Bug from './Bug';
import HUD from './HUD';
import CompilerScan from './CompilerScan';

const CodeEditor = ({ fileName }) => {
  // Sample code lines with syntax highlighting
  const codeLines = [
    { lineNumber: 1, text: "import React from 'react';" },
    { lineNumber: 2, text: "import './App.css';" },
    { lineNumber: 3, text: "" },
    { lineNumber: 4, text: "function App() {" },
    { lineNumber: 5, text: "  const message = 'Hello, VSCode!';" },
    { lineNumber: 6, text: "  const count = 42;" },
    { lineNumber: 7, text: "" },
    { lineNumber: 8, text: "  // This is a comment" },
    { lineNumber: 9, text: "  return (" },
    { lineNumber: 10, text: "    <div className=\"app\">" },
    { lineNumber: 11, text: "      <h1>{message}</h1>" },
    { lineNumber: 12, text: "      <p>Count: {count}</p>" },
    { lineNumber: 13, text: "      <button onClick={() => console.log('clicked')}>" },
    { lineNumber: 14, text: "        Click me!" },
    { lineNumber: 15, text: "      </button>" },
    { lineNumber: 16, text: "    </div>" },
    { lineNumber: 17, text: "  );" },
    { lineNumber: 18, text: "}" },
    { lineNumber: 19, text: "" },
    { lineNumber: 20, text: "export default App;" },
    { lineNumber: 21, text: "" },
    { lineNumber: 22, text: "// More sample code..." },
    { lineNumber: 23, text: "const handleClick = () => {" },
    { lineNumber: 24, text: "  console.log('Button clicked!');" },
    { lineNumber: 25, text: "};" }
  ];

  return (
    <div className="ide-code-editor-integrated">
      <HUD />
      {/* Editor Content */}
      <div className="editor-content">
        {/* Line Numbers Gutter */}
        <div className="line-numbers-gutter">
          {codeLines.map((line, index) => (
            <div key={index} className="line-number-item">
              {line.lineNumber}
            </div>
          ))}
        </div>

        {/* Code Content Area */}
        <div className="code-content-area">
          {codeLines.map((line, index) => (
            <CodeLine 
              key={index}
              lineNumber={line.lineNumber}
              text={line.text}
            />
          ))}
          <Bug totalLines={codeLines[codeLines.length - 1].lineNumber} />
          <CompilerScan />
          {/* Cursor */}
          <div className="editor-cursor"></div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

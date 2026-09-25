import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import './App.css'; // Import the CSS file

function App() {
  const [text, setText] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');

  const generateQRCode = () => {
    // Set QR code value to the current text
    setQrCodeValue(text.toString());
  };

  return (
    <div className="container">
      <header>
        <h1>QR Code Clipboard</h1>
      </header>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
        spellCheck="true"
      ></textarea>
      <button onClick={generateQRCode}>Generate QR Code</button>

      {qrCodeValue && (
        <div className="qr-code-container">
          <h2>Your QR Code:</h2>
          <QRCode
            value={qrCodeValue}
            size={400} // Adjust the size of the QR code
            bgColor="white" // Background color
            fgColor="#007bff" // Foreground color (QR code color)
            // level="H" // Error correction level
          />
        </div>
      )}
    </div>
  );
}

export default App;

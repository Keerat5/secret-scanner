# 🔒 Secret Scanner

A web-based security tool built with **Node.js**, **Express**, and **JavaScript** that scans uploaded files for accidentally exposed secrets such as API keys, passwords, tokens, and credentials.

## ✨ Features

- Upload text files for scanning
- Detect multiple secret types using Regular Expressions
- Supports detection of:
  - Passwords
  - AWS Access Keys
  - GitHub Tokens
  - OpenAI Keys
  - Google API Keys
  - MongoDB URIs
  - JWT Tokens
  - Bearer Tokens
  - Stripe Keys
  - Firebase Keys
  - Slack Tokens
  - Private Keys
  - Generic API Keys
- Displays detected secrets
- Modern responsive UI

## 🛠 Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Multer

## 📂 Project Structure

```
secret-scanner/
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── routes/
│   ├── regex/
│   ├── uploads/
│   └── server.js
│
├── package.json
└── README.md
```

## 🚀 Installation

```bash
git clone https://github.com/Keerat5/secret-scanner

cd secret-scanner

npm install

npm run dev
```

Open:

```
http://localhost:3000
```

## 📸 Demo

1. Select a file.
2. Click **Scan File**.
3. View detected secrets.

## Future Improvements

- GitHub Repository Scanning
- Secret Severity Levels
- Line Number Detection
- Secret Masking
- Export Scan Report
- Docker Support

## Author

**Keerat B**
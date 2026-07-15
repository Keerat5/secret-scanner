// Select the DOM elements
const form = document.getElementById("uploadForm");
const repoForm = document.getElementById("repoForm");
const results = document.getElementById("results");

const fileInput = document.getElementById("file");
const dropZone = document.getElementById("dropZone");
const dropZoneText = document.getElementById("dropZoneText");
const fileScanBtn = document.getElementById("fileScanBtn");
const repoScanBtn = document.getElementById("repoScanBtn");

// Helper to escape HTML characters and prevent XSS
function escapeHtml(str) {
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Maps secret types to severity ratings
function getSeverity(type) {
    const t = type.toLowerCase();
    if (t.includes("private key") || t.includes("aws") || t.includes("google api")) {
        return { name: "Critical", class: "critical" };
    }
    if (t.includes("token") || t.includes("password") || t.includes("openai") || t.includes("stripe secret")) {
        return { name: "High", class: "high" };
    }
    if (t.includes("firebase") || t.includes("jwt") || t.includes("mongodb")) {
        return { name: "Medium", class: "medium" };
    }
    return { name: "Low", class: "low" };
}

// Returns appropriate SVG icon based on secret type
function getFindingIcon(type) {
    const t = type.toLowerCase();
    if (t.includes("password")) {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    }
    if (t.includes("token") || t.includes("key")) {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>`;
    }
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
}

// Renders the visual scanner loader
function showLoader(loadingText = "SCANNING IN PROGRESS") {
    results.innerHTML = `
        <div class="loader-container">
            <div class="scanner-box">
                <div class="scanner-ring"></div>
                <div class="scanner-glow"></div>
            </div>
            <p class="loader-text">${escapeHtml(loadingText)}</p>
            <p class="loader-subtext">Inspecting file structures and evaluating credential signatures...</p>
        </div>
    `;
}

// Update the Drag and Drop zone visual status
function updateFileDisplay(file) {
    if (file) {
        dropZoneText.innerText = `Selected: ${file.name}`;
        dropZone.querySelector(".drop-zone-subtext").innerText = `${(file.size / 1024).toFixed(2)} KB`;
        dropZone.style.borderColor = "var(--primary)";
    } else {
        dropZoneText.innerText = "Drag & drop your file here";
        dropZone.querySelector(".drop-zone-subtext").innerText = "or click to browse local files";
        dropZone.style.borderColor = "rgba(255, 255, 255, 0.15)";
    }
}

// Drag & Drop event bindings
["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add("drop-zone--active");
    }, false);
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove("drop-zone--active");
    }, false);
});

dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        fileInput.files = files;
        updateFileDisplay(files[0]);
    }
});

fileInput.addEventListener("change", () => {
    updateFileDisplay(fileInput.files[0]);
});

// Run when user clicks Upload Form submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    showLoader("ANALYZING LOCAL FILE");

    // Disable scan controls to prevent duplicate submissions
    fileScanBtn.disabled = true;
    fileScanBtn.querySelector("span").innerText = "Scanning...";

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        results.innerHTML = "";

        // Check if no findings returned
        if (data.findings.length === 0) {
            results.innerHTML = `
                <div class="scan-alert success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div class="alert-content">
                        <h4>No Secrets Detected</h4>
                        <p>This file is clean. No credentials, tokens, or private keys were exposed.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render file card grouping all findings
        const fileCard = document.createElement("div");
        fileCard.className = "card";
        fileCard.innerHTML = `
            <div class="card-header">
                <div class="card-title-area">
                    <svg class="card-file-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <div>
                        <h2>${escapeHtml(fileInput.files[0]?.name || "Uploaded File")}</h2>
                        <div class="card-path">Local File Scanner</div>
                    </div>
                </div>
                <span class="findings-count-badge">${data.findings.length} findings</span>
            </div>
        `;

        data.findings.forEach(finding => {
            const severity = getSeverity(finding.type);
            const icon = getFindingIcon(finding.type);

            const findingItem = document.createElement("div");
            findingItem.className = "finding-item";
            findingItem.innerHTML = `
                <div class="finding-header">
                    <span class="finding-type">${icon} ${escapeHtml(finding.type)}</span>
                    <span class="severity-badge ${severity.class}">${severity.name}</span>
                </div>
                <div class="finding-meta">Detected in file line <strong>${finding.line}</strong></div>
                <div class="finding-code">
                    <span class="finding-line-number">${finding.line}</span>
                    <span class="finding-match-val">${escapeHtml(finding.matches.join(", "))}</span>
                </div>
            `;
            fileCard.appendChild(findingItem);
        });

        results.appendChild(fileCard);

    } catch (err) {
        results.innerHTML = `
            <div class="scan-alert error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div class="alert-content">
                    <h4>Local Upload Scan Error</h4>
                    <p>An unexpected network error occurred while scanning the uploaded file.</p>
                </div>
            </div>
        `;
    } finally {
        // Re-enable scan button
        fileScanBtn.disabled = false;
        fileScanBtn.querySelector("span").innerText = "Scan File";
        updateFileDisplay(null);
        form.reset();
    }
});

// Run when user scans a GitHub repository
repoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const repoUrl = document.getElementById("repoUrl").value;
    showLoader("SCANNING GITHUB REPOSITORY");

    repoScanBtn.disabled = true;
    repoScanBtn.querySelector("span").innerText = "Scanning...";

    try {
        const response = await fetch("/scan-repo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ repoUrl })
        });

        const data = await response.json();
        results.innerHTML = "";

        if (!response.ok || !data.success) {
            results.innerHTML = `
                <div class="scan-alert error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div class="alert-content">
                        <h4>Scan Failure</h4>
                        <p>${escapeHtml(data.message || "Repository scan failed.")}</p>
                    </div>
                </div>
            `;
            return;
        }

        const filesWithFindings = data.results.filter(file => file.findings.length > 0);

        // Render success if no secrets found
        if (filesWithFindings.length === 0) {
            results.innerHTML = `
                <div class="scan-alert success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div class="alert-content">
                        <h4>Scan Complete: Safe Repository</h4>
                        <p>Traversed ${data.filesScanned} repository files and detected no credentials leaks.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render cards for files containing leaks
        filesWithFindings.forEach(file => {
            const fileCard = document.createElement("div");
            fileCard.className = "card";
            fileCard.innerHTML = `
                <div class="card-header">
                    <div class="card-title-area">
                        <svg class="card-file-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <div>
                            <h2>${escapeHtml(file.file || file.path.split("/").pop())}</h2>
                            <div class="card-path">${escapeHtml(file.path)}</div>
                        </div>
                    </div>
                    <span class="findings-count-badge">${file.findings.length} findings</span>
                </div>
            `;

            file.findings.forEach(finding => {
                const severity = getSeverity(finding.type);
                const icon = getFindingIcon(finding.type);

                const findingItem = document.createElement("div");
                findingItem.className = "finding-item";
                findingItem.innerHTML = `
                    <div class="finding-header">
                        <span class="finding-type">${icon} ${escapeHtml(finding.type)}</span>
                        <span class="severity-badge ${severity.class}">${severity.name}</span>
                    </div>
                    <div class="finding-meta">Detected in file line <strong>${finding.line}</strong></div>
                    <div class="finding-code">
                        <span class="finding-line-number">${finding.line}</span>
                        <span class="finding-match-val">${escapeHtml(finding.matches.join(", "))}</span>
                    </div>
                `;
                fileCard.appendChild(findingItem);
            });

            results.appendChild(fileCard);
        });

    } catch (err) {
        results.innerHTML = `
            <div class="scan-alert error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div class="alert-content">
                    <h4>GitHub Scan Error</h4>
                    <p>Failed to retrieve repository from GitHub. Check connection or URL parameters.</p>
                </div>
            </div>
        `;
    } finally {
        repoScanBtn.disabled = false;
        repoScanBtn.querySelector("span").innerText = "Scan Repository";
        repoForm.reset();
    }
});

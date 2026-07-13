// Select the upload form
const form = document.getElementById("uploadForm");

// Run when user clicks Upload
form.addEventListener("submit", async (e) => {

    e.preventDefault(); // Prevent page refresh

    // Collect all form fields (including the selected file)
    const formData = new FormData(form);

    // Send file to backend
    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    // Convert server JSON response into a JavaScript object
    const data = await response.json();

    // Get the div where scan results will be displayed
    const results = document.getElementById("results");

    // Remove results from any previous scan
    results.innerHTML = "";

    // No secrets found
    if(data.findings.length === 0){

        results.innerHTML =
        `<p class="success">✅ No secrets detected.</p>`;

        return;

    }

    // Render every finding
    data.findings.forEach(finding=>{

        const card=document.createElement("div");

        card.className="card";

        card.innerHTML = `
            <h3>⚠ ${finding.type}</h3>
            <p><strong>Line:</strong> ${finding.line}</p>
            <ul>
            ${finding.matches.map(m => `<li>${m}</li>`).join("")}
            </ul>
            `;

        results.appendChild(card);

    });

});

const repoForm = document.getElementById("repoForm");

repoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const repoUrl = document.getElementById("repoUrl").value;

    const response = await fetch("/scan-repo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ repoUrl })
    });

    const data = await response.json();
    console.log(data);
    const results = document.getElementById("results");

    results.innerHTML = "";

    if (!response.ok || !data.success) {
        results.innerHTML = `<p class="error">${data.message || "Repository scan failed."}</p>`;
        return;
    }

    const filesWithFindings = data.results.filter(file => file.findings.length > 0);

    // No secrets found
    if (filesWithFindings.length === 0) {
        results.innerHTML = `<p class="success">✅ No secrets found.</p>`;
        return;
    }

    filesWithFindings.forEach(file => {

    const fileCard = document.createElement("div");
    fileCard.className = "card";

    fileCard.innerHTML = `
        <h2>📄 ${file.file}</h2>
        <p><strong>Path:</strong> ${file.path}</p>
    `;

    file.findings.forEach(finding => {

        const findingCard = document.createElement("div");

        findingCard.innerHTML = `
            <h3>⚠ ${finding.type}</h3>
            <p><strong>Line:</strong> ${finding.line}</p>
            <ul>
                ${finding.matches.map(m => `<li>${m}</li>`).join("")}
            </ul>
        `;

        fileCard.appendChild(findingCard);

    });

    results.appendChild(fileCard);

    });
});

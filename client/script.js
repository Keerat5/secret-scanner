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
const form = document.getElementById("trackingForm");
const result = document.getElementById("result");
const output = document.getElementById("statusOutput");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const trackingNumber = document.getElementById("trackingNumber").value.trim();
  const carrier = document.getElementById("carrier").value;

  if (!carrier) {
    alert("Please select a carrier.");
    return;
  }

  result.classList.remove("hidden");
  output.textContent = "Fetching tracking info...";

  try {
    const response = await fetch("https://your-backend-api.com/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        trackingNumber,
        carrier
      })
    });

    if (!response.ok) throw new Error("Failed to fetch tracking info.");

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
});

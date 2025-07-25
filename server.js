const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// === API KEYS ===
const UPS_API_KEY = 'YOUR_UPS_API_KEY_HERE';
const USPS_USER_ID = 'YOUR_USPS_USER_ID_HERE';
const FEDEX_API_KEY = 'YOUR_FEDEX_API_KEY_HERE';
const FEDEX_SECRET = 'YOUR_FEDEX_SECRET_HERE'; // For OAuth if needed

// === MAIN TRACKING ENDPOINT ===
app.post('/track', async (req, res) => {
  const { trackingNumber, carrier } = req.body;

  try {
    let data;

    if (carrier === 'ups') {
      data = await trackUPS(trackingNumber);
    } else if (carrier === 'usps') {
      data = await trackUSPS(trackingNumber);
    } else if (carrier === 'fedex') {
      data = await trackFedEx(trackingNumber);
    } else {
      return res.status(400).json({ error: 'Unsupported carrier' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === UPS TRACKING ===
async function trackUPS(trackingNumber) {
  const response = await axios.post('https://onlinetools.ups.com/track/v1/details/' + trackingNumber, {}, {
    headers: {
      'Content-Type': 'application/json',
      'AccessLicenseNumber': UPS_API_KEY
    }
  });
  return response.data;
}

// === USPS TRACKING ===
async function trackUSPS(trackingNumber) {
  const xml = `
    <TrackRequest USERID="${USPS_USER_ID}">
      <TrackID ID="${trackingNumber}"></TrackID>
    </TrackRequest>
  `;

  const response = await axios.get('https://secure.shippingapis.com/ShippingAPI.dll', {
    params: {
      API: 'TrackV2',
      XML: xml
    }
  });
  return response.data;
}

// === FedEx TRACKING ===
async function trackFedEx(trackingNumber) {
  // FedEx uses OAuth and complex JSON — you'd first obtain an access token
  const accessToken = await getFedExToken();

  const response = await axios.post('https://apis.fedex.com/track/v1/trackingnumbers', {
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber: trackingNumber
        }
      }
    ]
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

async function getFedExToken() {
  const response = await axios.post('https://apis.fedex.com/oauth/token', new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: FEDEX_API_KEY,
    client_secret: FEDEX_SECRET
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data.access_token;
}

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OnTrak API running on port ${PORT}`));

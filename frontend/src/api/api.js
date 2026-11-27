const API_URL = "http://127.0.0.1:8000";

// =========================================================
// HANDLE API RESPONSE
// =========================================================

async function handleResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      detail: text || "Server returned an invalid response.",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        `Server error: ${response.status}`
    );
  }

  return data;
}


// =========================================================
// GET AUTHENTICATION TOKEN
// =========================================================

function getToken() {
  return localStorage.getItem("token");
}


// =========================================================
// CREATE AUTH HEADERS
// =========================================================

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}


// =========================================================
// REGISTER USER
// =========================================================

export async function registerUser(userData) {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  return await handleResponse(response);
}


// =========================================================
// LOGIN USER
// =========================================================

export async function loginUser(userData) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  const data = await handleResponse(response);


  // Save authentication token
  if (data.access_token) {
    localStorage.setItem(
      "token",
      data.access_token
    );
  }


  // Save user information
  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }


  return data;
}


// =========================================================
// ANALYZE NEWS ARTICLE
// =========================================================

export async function analyzeNews(article) {

  const response = await fetch(
    `${API_URL}/news/analyze`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify({
        article: article,
      }),
    }
  );


  // IMPORTANT:
  // This will now return the actual backend error
  return await handleResponse(response);
}


// =========================================================
// ANALYZE NEWS URL
// =========================================================

export async function analyzeURL(url) {

  const response = await fetch(
    `${API_URL}/news/analyze-url`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify({
        url: url,
      }),
    }
  );


  return await handleResponse(response);
}


// =========================================================
// ANALYZE PDF
// =========================================================

export async function analyzePDF(file) {

  const token = getToken();

  const formData = new FormData();

  formData.append(
    "file",
    file
  );


  const response = await fetch(
    `${API_URL}/news/analyze-pdf`,
    {
      method: "POST",

      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },

      body: formData,
    }
  );


  return await handleResponse(response);
}


// =========================================================
// DOWNLOAD PDF REPORT
// =========================================================

export async function downloadReport(result) {

  console.log(
    "DOWNLOAD RESULT =",
    result
  );


  const response = await fetch(
    `${API_URL}/news/download-report`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify({
        analysis: result,
      }),
    }
  );


  if (!response.ok) {

    let errorMessage =
      "Failed to generate report";

    try {

      const data =
        await response.json();

      errorMessage =
        data.detail ||
        data.message ||
        errorMessage;

    } catch {
      // Ignore JSON parsing error
    }


    throw new Error(
      errorMessage
    );
  }


  const blob =
    await response.blob();


  const downloadUrl =
    window.URL.createObjectURL(
      blob
    );


  const link =
    document.createElement("a");


  link.href =
    downloadUrl;


  link.download =
    "NewsCredAI_Report.pdf";


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  window.URL.revokeObjectURL(
    downloadUrl
  );
}


// =========================================================
// GET HISTORY
// =========================================================

export async function getHistory() {

  const response = await fetch(
    `${API_URL}/history`,
    {
      method: "GET",

      headers: {
        ...(getToken() && {
          Authorization:
            `Bearer ${getToken()}`,
        }),
      },
    }
  );


  return await handleResponse(
    response
  );
}


// =========================================================
// GET SINGLE HISTORY ITEM
// =========================================================

export async function getHistoryItem(
  historyId
) {

  const response = await fetch(
    `${API_URL}/history/${historyId}`,
    {
      method: "GET",

      headers: {
        ...(getToken() && {
          Authorization:
            `Bearer ${getToken()}`,
        }),
      },
    }
  );


  return await handleResponse(
    response
  );
}


// =========================================================
// DELETE HISTORY
// =========================================================

export async function deleteHistory(
  historyId
) {

  const token = getToken();


  if (!token) {
    throw new Error(
      "You are not logged in."
    );
  }


  const response = await fetch(
    `${API_URL}/history/${historyId}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );


  return await handleResponse(
    response
  );
}
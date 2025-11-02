/**
 * Shared Dropbox OAuth token generation utility
 * Generates fresh access tokens on-demand from refresh token
 */

export async function generateAccessToken(
  appKey: string,
  appSecret: string,
  refreshToken: string
): Promise<string> {
  console.log("Generating fresh Dropbox access token from refresh token...");
  
  // Create Basic auth header
  const credentials = btoa(`${appKey}:${appSecret}`);
  
  const response = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate access token: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log("Access token generated successfully");
  
  return data.access_token;
}

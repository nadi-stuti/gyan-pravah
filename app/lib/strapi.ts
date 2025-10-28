const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function fetchFromStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Strapi fetch failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching from Strapi:", error);
    throw error;
  }
}

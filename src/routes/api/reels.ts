import { APIEvent } from "@solidjs/start/server";
import instagramGetUrl from 'instagram-url-direct';

async function fetchVid(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.blob();
}

export async function POST({ request }: APIEvent) {
  const { url } = await request.json();
  
  if (!url || !url.includes('instagram.com')) {
    return new Response(JSON.stringify({ error: "Invalid Instagram URL" }), {
      status: 400,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  try {
    // Use instagram-url-direct to get direct URLs
    const result = await instagramGetUrl(url);

    if (!result.url_list || result.url_list.length === 0) {
      throw new Error("No media URLs found");
    }

    const vidData = {
      url: result.url_list[0],
      thumbnail: result.thumbnail_url || null,
    };

    const blob = await fetchVid(vidData.url);
    const arrayBuffer = await blob.arrayBuffer();
    const base64Blob = Buffer.from(arrayBuffer).toString("base64");

    const data = {
      video: {
        url: vidData.url,
        thumbnail: vidData.thumbnail,
        blob: {
          type: blob.type,
          size: blob.size,
          base64: base64Blob,
        },
      },
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to fetch media" }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
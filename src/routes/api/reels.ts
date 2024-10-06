import type { APIEvent } from "@solidjs/start/server";
import pkg from "nayan-media-downloader";
const { ndown } = pkg;

export async function POST({ request }: APIEvent) {
  const body = await new Response(request.body).json();
  let URL = await ndown(body.url);

  if (!URL.status || (URL.msg && URL?.msg?.includes("off"))) {
    return new Response(JSON.stringify({ error: "Post not found" }), {
      status: 404,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  const fetchVid = async (vid: string) => {
    const response = await fetch(vid, { method: "GET" });

    if (!response.ok) {
      throw new Error("Failed to fetch video");
    }

    const blob = await response.blob();
    return blob;
  };

  const vidData = URL.data[0];

  try {
    const blob = await fetchVid(vidData?.url);
    const arrayBuffer = await blob.arrayBuffer();
    const base64Blob = Buffer.from(arrayBuffer).toString("base64");

    const data = {
      video: {
        url: vidData?.url,
        thumbnail: vidData?.thumbnail,
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "content-type": "application/json",
      },
    });
  }
}

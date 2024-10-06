import { createEffect, createSignal, onCleanup } from "solid-js";

export default function Home() {
  const [url, setUrl] = createSignal("");
  const [thumbnail, setThumb] = createSignal("");
  const [vid, setVid] = createSignal("");
  const [src, setSrc] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [type, setType] = createSignal("");

  const [timeCount, setTimeCount] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);
  let interval: NodeJS.Timeout;

  const startTimer = () => {
    if (!isRunning()) {
      setIsRunning(true);
      interval = setInterval(() => {
        setTimeCount((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    clearInterval(interval);
    setIsRunning(false);
  };

  onCleanup(() => cleanup());

  function cleanup() {
    setTimeCount(0);
    stopTimer();
    setType("");
    setError("");
    setVid("");
    setSrc("");
    setThumb("");
  }

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  const handleClick = () => {
    cleanup();
    if (!url()) return setError("Please enter a URL");
    setUrl(url().trim().split("/?")[0].split("com/")[1])
    setLoading(true);
    startTimer();

    fetch("/api/reels", {
      method: "POST",
      body: JSON.stringify({
        url: url().startsWith("https://instagram.com")
          ? url()
          : `https://instagram.com/reels/${url()}`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        stopTimer();
        if (data.error) {
          setLoading(false);
          return setError(data.error);
        } else {
          setThumb(data.video.thumbnail);
          setSrc(data.video.url);
          setLoading(false);
          const blobObj = data.video.blob;
          const mimeType = blobObj?.type;

          const blob = base64ToBlob(blobObj?.base64, mimeType);
          setType(mimeType);

          setVid(URL.createObjectURL(blob));
        }
      })
      .catch((e) => {
        setLoading(false);
        stopTimer();
        setError(e);
        console.error("Error:", e);
      });
  };
  return (
    <main class="text-center mx-auto flex items-center flex-col justify-center gap-6 w-screen h-screen px-3">
      <title>Reelster</title>
      <div
        class={`flex flex-col bg-[#0e0e0e] ${
          error() ? "border-2 border-red-400" : ""
        } ${
          type().includes("image")
            ? "aspect-[1/1.05] w-[500px]"
            : "min-h-[70vh] aspect-[9/16.65]"
        } rounded-[1.1rem] p-0.5`}
      >
        {vid() ? (
          <>
            {type().includes("image") ? (
              <img
                class="rounded-2xl max-w-[500px] aspect-square"
                src={thumbnail()}
              />
            ) : (
              <video
                autoplay
                class="rounded-2xl max-h-[70vh]"
                controls
                src={vid()}
              />
            )}

            <a
              class="text-white my-2 text-xs opacity-30 w-full font-mono underline overflow-hidden"
              href={src()}
              download
              target="_blank"
            >
              Download
            </a>
          </>
        ) : (
          <div class="w-full opacity-10 h-full flex items-center justify-center flex-col gap-2">
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 448 512"
              height="60px"
              width="60px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
            </svg>
            {error() && <p class="text-white font-semibold">{error()}</p>}
            {timeCount() >= 0 && loading() && (
              <h1 class="mt-4 text-xl font-semibold"><span class="text-5xl">{timeCount()}</span>s</h1>
            )}
          </div>
        )}
      </div>

      <div
        class={`flex transition-all duration-200 bg-[#19191b] rounded-full p-0.5 w-[90%] ${
          loading() ? "max-w-[280px]" : "max-w-[350px]"
        } mx-auto`}
      >
        {!loading() && (
          <>
            <input
              class="bg-transparent px-4 w-full text-white outline-none focus-within:outline-none"
              type="text"
              value={url()}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              required
            />
            <button
              class={`${
                error() ? "bg-red-400" : "bg-white"
              } p-3 px-6 text-black rounded-full hover:px-7 active:px-5 transition-all duration-200`}
              onClick={handleClick}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 384 512"
                height="20px"
                width="16px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
              </svg>
            </button>
          </>
        )}

        <button
          class={`bg-white p-3 w-full px-6 items-center gap-3 justify-start text-black rounded-full transition-all duration-200 ${
            loading() ? "opacity-100 flex" : "opacity-0 hidden"
          }`}
          onClick={handleClick}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 24 24"
            height="24px"
            width="24px"
            class="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3.05469 13H5.07065C5.55588 16.3923 8.47329 19 11.9998 19C15.5262 19 18.4436 16.3923 18.9289 13H20.9448C20.4474 17.5 16.6323 21 11.9998 21C7.36721 21 3.55213 17.5 3.05469 13ZM3.05469 11C3.55213 6.50005 7.36721 3 11.9998 3C16.6323 3 20.4474 6.50005 20.9448 11H18.9289C18.4436 7.60771 15.5262 5 11.9998 5C8.47329 5 5.55588 7.60771 5.07065 11H3.05469Z"></path>
          </svg>
          <p class="font-semibold">Fetching...</p>
        </button>
      </div>
    </main>
  );
}

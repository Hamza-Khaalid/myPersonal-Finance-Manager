if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then((registration) => {
      console.log("Service Worker Registered");

      // Listen for updates to the Service Worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;

        installingWorker.onstatechange = () => {
          if (
            installingWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("New content is available; refreshing...");

            // Force page refresh
            window.location.reload();
          }
        };
      };
    })
    .catch((err) => console.log("Service Worker Registration Failed:", err));
}

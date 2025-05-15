chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    const funcToInject = (cmd) => {
      const updateAllVideoSpeeds = (rateUpdater) => {
        const videos = Array.from(document.querySelectorAll('video'));
        if (videos.length === 0) return;

        let updatedRate = null;

        videos.forEach(video => {
          if (typeof video.playbackRate === "number") {
            const newRate = rateUpdater(video.playbackRate);
            video.playbackRate = newRate;
            updatedRate = newRate;
          }
        });

        if (updatedRate !== null) {
          let popup = document.getElementById('speed-popup');
          if (!popup) {
            popup = document.createElement('div');
            popup.id = 'speed-popup';
            document.body.appendChild(popup);
          }

          Object.assign(popup.style, {
            position: 'fixed',
            bottom: '60px',
            right: '20px',
            backgroundImage: 'linear-gradient(45deg, #D4145A, #FF4B2B)',
            color: '#fff',
            padding: '8px 14px',
            fontSize: '14px',
            borderRadius: '6px',
            fontFamily: 'Arial, sans-serif',
            zIndex: '9999',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            border: '2px solid white',
            opacity: '1'
          });

          popup.textContent = `Speed: ${updatedRate.toFixed(2)}x`;

          clearTimeout(popup._timer);
          popup._timer = setTimeout(() => {
            popup.style.opacity = '0';
          }, 2000);
        }
      };

      const commandHandlers = {
        "increase-speed": (current) => Math.round((current + 0.25) * 100) / 100,
        "decrease-speed": (current) => Math.max(0.25, Math.round((current - 0.25) * 100) / 100),
        "speed-1x": () => 1,
        "speed-10x": () => 10
      };

      if (cmd in commandHandlers) {
        updateAllVideoSpeeds(commandHandlers[cmd]);
      }
    };

    // Inject script into main page
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      func: funcToInject,
      args: [command]
    });
  });
});

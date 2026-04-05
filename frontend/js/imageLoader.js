// Image Loader Utility - Robust image loading with fallbacks and retry logic

const ImageLoader = {
  fallbackImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2314b8a6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230d9488;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad1)" width="600" height="400"/%3E%3Ctext x="50%25" y="40%25" text-anchor="middle" fill="white" font-size="72" font-family="Arial"%3E✈️%3C/text%3E%3Ctext x="50%25" y="70%25" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="18" font-family="Arial" font-weight="bold"%3ETravel Adventure%3C/text%3E%3C/svg%3E',

  loadingImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f3f4f6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23e5e7eb;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad1)" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236b7280" font-size="16" font-family="Arial"%3ELoading...%3C/text%3E%3C/svg%3E',

  // Preload image with timeout and fallback
  loadImage: function(primaryUrl, fallbackUrl = null, timeout = 5000) {
    return new Promise((resolve) => {
      // If no primary URL, use fallback immediately
      if (!primaryUrl || primaryUrl.trim() === '') {
        resolve(fallbackUrl || this.fallbackImage);
        return;
      }

      const img = new Image();
      
      // Set timeout for image loading
      const timeoutId = setTimeout(() => {
        if (fallbackUrl && fallbackUrl !== primaryUrl) {
          this.loadImage(fallbackUrl, null, timeout).then(resolve);
        } else {
          resolve(this.fallbackImage);
        }
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(primaryUrl);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        if (fallbackUrl && fallbackUrl !== primaryUrl) {
          this.loadImage(fallbackUrl, null, timeout).then(resolve);
        } else {
          resolve(this.fallbackImage);
        }
      };

      if (primaryUrl && primaryUrl.startsWith(window.location.origin)) {
        img.crossOrigin = 'anonymous';
      }

      img.src = primaryUrl;
    });
  },

  // Batch load multiple images
  loadImages: async function(trips) {
    const loadedUrls = {};
    const promises = trips.map(async (trip) => {
      const url = await this.loadImage(trip.imageUrl, trip.fallbackUrl);
      loadedUrls[trip._id] = url;
    });

    await Promise.all(promises);
    return loadedUrls;
  },

  // Apply loaded image to element with smooth transition
  applyImage: function(img, url, fadeIn = true) {
    if (!img || !url) return;

    img.onerror = () => {
      img.onerror = null;
      if (url !== this.fallbackImage) {
        img.src = this.fallbackImage;
      }
    };

    if (fadeIn) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease-in';
    }

    img.src = url;

    if (fadeIn) {
      setTimeout(() => {
        img.style.opacity = '1';
      }, 50);
    }
  }
};

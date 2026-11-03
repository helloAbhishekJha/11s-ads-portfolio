(function () {
  "use strict";

  var PLAYLIST_URL = "data/youtube-playlists.json";
  var THUMB = "https://i.ytimg.com/vi/VIDEO_ID/mqdefault.jpg";
  var tileTimes = Object.create(null);
  var modalPlayer = null;
  var modalVideoId = null;
  var ytApiLoading = false;
  var ytApiReady = false;
  var pendingInits = [];

  function thumbUrl(videoId) {
    return THUMB.replace("VIDEO_ID", videoId);
  }

  function canHoverPreview() {
    return !window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  }

  function buildEmbedUrl(videoId, opts) {
    var start = Math.max(0, Math.floor(opts.start || 0));
    var q =
      "autoplay=" +
      (opts.autoplay ? "1" : "0") +
      "&mute=" +
      (opts.mute ? "1" : "0") +
      "&controls=" +
      (opts.controls ? "1" : "0") +
      "&modestbranding=1&rel=0&playsinline=1&enablejsapi=1" +
      "&origin=" +
      encodeURIComponent(window.location.origin) +
      "&start=" +
      start;
    return (
      "https://www.youtube.com/embed/" +
      encodeURIComponent(videoId) +
      "?" +
      q
    );
  }

  function loadYouTubeApi(callback) {
    if (ytApiReady) {
      callback();
      return;
    }
    pendingInits.push(callback);
    if (ytApiLoading) return;
    ytApiLoading = true;
    window.onYouTubeIframeAPIReady = function () {
      ytApiReady = true;
      pendingInits.forEach(function (fn) {
        fn();
      });
      pendingInits = [];
    };
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function commitPreviewTime(tile) {
    var key = tile.dataset.tileKey;
    if (!key || tile.dataset.previewHoverAt == null) return;
    var start = parseFloat(tile.dataset.previewStart, 10) || 0;
    var hoverAt = parseFloat(tile.dataset.previewHoverAt, 10);
    if (!hoverAt) return;
    tileTimes[key] = start + (Date.now() - hoverAt) / 1000;
  }

  function stopTilePreview(tile) {
    commitPreviewTime(tile);
    var mount = tile.querySelector(".yt-tile-player");
    if (mount) mount.innerHTML = "";
    tile.classList.remove("is-playing");
    delete tile.dataset.previewStart;
    delete tile.dataset.previewHoverAt;
  }

  function pauseOtherTiles(exceptKey) {
    document.querySelectorAll(".yt-tile.is-playing").forEach(function (tile) {
      if (tile.dataset.tileKey === exceptKey) return;
      stopTilePreview(tile);
    });
  }

  function startTilePreview(tile) {
    var videoId = tile.dataset.videoId;
    var key = tile.dataset.tileKey;
    var startAt = tileTimes[key] || 0;
    var mount = tile.querySelector(".yt-tile-player");
    if (!mount) return;

    tile.dataset.previewStart = String(startAt);
    tile.dataset.previewHoverAt = String(Date.now());
    tile.classList.add("is-playing");
    mount.innerHTML = "";

    var iframe = document.createElement("iframe");
    iframe.setAttribute("allowfullscreen", "");
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.title = tile.dataset.title || "Video preview";
    iframe.src = buildEmbedUrl(videoId, {
      autoplay: 1,
      mute: 1,
      controls: 0,
      start: startAt,
    });
    mount.appendChild(iframe);
  }

  function onTileEnter(tile) {
    if (!canHoverPreview()) return;
    pauseOtherTiles(tile.dataset.tileKey);
    startTilePreview(tile);
  }

  function onTileLeave(tile) {
    stopTilePreview(tile);
  }

  function closeModal() {
    var overlay = document.getElementById("yt-lightbox");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("yt-modal-open");
    if (modalPlayer && modalVideoId) {
      try {
        if (typeof modalPlayer.getCurrentTime === "function") {
          tileTimes[modalVideoId] = modalPlayer.getCurrentTime();
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (modalPlayer && modalPlayer.pauseVideo) {
      try {
        modalPlayer.pauseVideo();
      } catch (e) {
        /* ignore */
      }
    }
  }

  function openModal(tile) {
    commitPreviewTime(tile);
    stopTilePreview(tile);

    var videoId = tile.dataset.videoId;
    var key = tile.dataset.tileKey;
    var title = tile.dataset.title || "";
    var startAt = tileTimes[key] || 0;

    var overlay = document.getElementById("yt-lightbox");
    var titleEl = document.getElementById("yt-lightbox-title");
    var mount = document.getElementById("yt-lightbox-player");
    if (!overlay || !mount) return;

    titleEl.textContent = title;
    overlay.hidden = false;
    document.body.classList.add("yt-modal-open");
    modalVideoId = key;

    loadYouTubeApi(function () {
      if (modalPlayer) {
        try {
          modalPlayer.destroy();
        } catch (e) {
          /* ignore */
        }
        modalPlayer = null;
      }
      mount.innerHTML = "";
      modalPlayer = new YT.Player(mount, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: Math.floor(startAt),
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: function (ev) {
            if (startAt > 0) ev.target.seekTo(startAt, true);
            ev.target.playVideo();
          },
        },
      });
    });
  }

  function scrollCarousel(track, direction) {
    var tile = track.querySelector(".yt-tile");
    var step = tile ? tile.offsetWidth + 12 : 280;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  function buildPlaylistSection(playlist) {
    var section = document.createElement("section");
    section.className = "playlist-carousel";
    section.id = "playlist-" + playlist.id;

    var head = document.createElement("div");
    head.className = "playlist-carousel-head";
    head.innerHTML =
      "<div><h3>" +
      escapeHtml(playlist.title) +
      "</h3><p>" +
      escapeHtml(playlist.description) +
      '</p></div><a class="playlist-yt-link" href="https://www.youtube.com/playlist?list=' +
      encodeURIComponent(playlist.youtubeListId) +
      '" rel="noopener noreferrer">Open on YouTube ↗</a>';

    var shell = document.createElement("div");
    shell.className = "carousel-shell";

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "carousel-nav carousel-prev";
    prev.setAttribute("aria-label", "Scroll previous");
    prev.textContent = "‹";

    var next = document.createElement("button");
    next.type = "button";
    next.className = "carousel-nav carousel-next";
    next.setAttribute("aria-label", "Scroll next");
    next.textContent = "›";

    var track = document.createElement("div");
    track.className = "carousel-track";
    track.setAttribute("role", "list");

    playlist.videos.forEach(function (video) {
      var tileKey = playlist.id + "-" + video.id;
      var tile = document.createElement("div");
      tile.className = "yt-tile";
      tile.tabIndex = 0;
      tile.setAttribute("role", "listitem");
      tile.setAttribute(
        "aria-label",
        video.title + " — hover preview, click to expand"
      );
      tile.dataset.videoId = video.id;
      tile.dataset.tileKey = tileKey;
      tile.dataset.title = video.title;
      tile.innerHTML =
        '<span class="yt-tile-thumb" style="background-image:url(\'' +
        thumbUrl(video.id) +
        '\')"></span>' +
        '<div class="yt-tile-player" aria-hidden="true"></div>' +
        '<span class="yt-tile-label">' +
        escapeHtml(video.title) +
        "</span>" +
        '<span class="yt-tile-hint">Hover preview · Click expand</span>';

      tile.addEventListener("mouseenter", function () {
        onTileEnter(tile);
      });
      tile.addEventListener("mouseleave", function () {
        onTileLeave(tile);
      });
      tile.addEventListener("click", function () {
        openModal(tile);
      });
      tile.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openModal(tile);
        }
      });

      track.appendChild(tile);
    });

    prev.addEventListener("click", function () {
      scrollCarousel(track, -1);
    });
    next.addEventListener("click", function () {
      scrollCarousel(track, 1);
    });

    shell.appendChild(prev);
    shell.appendChild(track);
    shell.appendChild(next);
    section.appendChild(head);
    section.appendChild(shell);
    return section;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureLightbox() {
    if (document.getElementById("yt-lightbox")) return;
    var overlay = document.createElement("div");
    overlay.id = "yt-lightbox";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="yt-lightbox-backdrop" data-close="1"></div>' +
      '<div class="yt-lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="yt-lightbox-title">' +
      '<button type="button" class="yt-lightbox-close" aria-label="Close">×</button>' +
      '<p id="yt-lightbox-title" class="yt-lightbox-title"></p>' +
      '<div id="yt-lightbox-player" class="yt-lightbox-player"></div>' +
      "</div>";
    document.body.appendChild(overlay);
    overlay.querySelector(".yt-lightbox-backdrop").addEventListener("click", closeModal);
    overlay.querySelector(".yt-lightbox-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !overlay.hidden) closeModal();
    });
  }

  function mountPlaylists() {
    var root = document.getElementById("youtube-playlist-carousels");
    if (!root) return;
    fetch(PLAYLIST_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("playlist data");
        return res.json();
      })
      .then(function (data) {
        ensureLightbox();
        (data.playlists || []).forEach(function (pl) {
          root.appendChild(buildPlaylistSection(pl));
        });
      })
      .catch(function () {
        root.innerHTML =
          '<p class="playlist-error">Could not load playlist videos. Use the YouTube links below.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPlaylists);
  } else {
    mountPlaylists();
  }
})();

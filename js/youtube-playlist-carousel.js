(function () {
  "use strict";

  var PLAYLIST_URL = "data/youtube-playlists.json";
  var THUMB = "https://i.ytimg.com/vi/VIDEO_ID/mqdefault.jpg";
  var activeHoverId = null;
  var tilePlayers = Object.create(null);
  var tileTimes = Object.create(null);
  var modalPlayer = null;
  var modalVideoId = null;
  var ytApiLoading = false;
  var ytApiReady = false;
  var pendingInits = [];

  function thumbUrl(videoId) {
    return THUMB.replace("VIDEO_ID", videoId);
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

  function pauseOtherTiles(exceptKey) {
    Object.keys(tilePlayers).forEach(function (key) {
      if (key === exceptKey) return;
      var entry = tilePlayers[key];
      if (!entry || !entry.player) return;
      try {
        tileTimes[key] = entry.player.getCurrentTime();
        entry.player.pauseVideo();
      } catch (e) {
        /* player not ready */
      }
    });
  }

  function ensureTilePlayer(tile, videoId, autoplay) {
    var key = tile.dataset.tileKey;
    if (tilePlayers[key] && tilePlayers[key].player) {
      return tilePlayers[key].player;
    }
    var mount = tile.querySelector(".yt-tile-player");
    if (!mount) return null;
    tilePlayers[key] = { player: null, videoId: videoId };
    var startAt = tileTimes[key] || 0;
    tilePlayers[key].player = new YT.Player(mount, {
      videoId: videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        mute: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        start: Math.floor(startAt),
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: function (ev) {
          tile.classList.add("is-playing");
          if (autoplay) {
            ev.target.playVideo();
          }
          if (startAt > 0) {
            ev.target.seekTo(startAt, true);
          }
        },
      },
    });
    return tilePlayers[key].player;
  }

  function onTileEnter(tile) {
    if (window.matchMedia("(hover: none)").matches) return;
    var videoId = tile.dataset.videoId;
    var key = tile.dataset.tileKey;
    activeHoverId = key;
    loadYouTubeApi(function () {
      pauseOtherTiles(key);
      ensureTilePlayer(tile, videoId, true);
      var entry = tilePlayers[key];
      if (entry && entry.player && entry.player.playVideo) {
        try {
          var t = tileTimes[key];
          if (t > 0) entry.player.seekTo(t, true);
          entry.player.playVideo();
        } catch (e) {
          /* not ready yet */
        }
      }
    });
  }

  function onTileLeave(tile) {
    var key = tile.dataset.tileKey;
    if (activeHoverId === key) activeHoverId = null;
    var entry = tilePlayers[key];
    if (entry && entry.player && entry.player.getCurrentTime) {
      try {
        tileTimes[key] = entry.player.getCurrentTime();
        entry.player.pauseVideo();
      } catch (e) {
        /* ignore */
      }
    }
    tile.classList.remove("is-playing");
  }

  function closeModal() {
    var overlay = document.getElementById("yt-lightbox");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("yt-modal-open");
    if (modalPlayer && modalVideoId) {
      tileTimes[modalVideoId] = modalPlayer.getCurrentTime();
    }
    if (modalPlayer && modalPlayer.pauseVideo) {
      modalPlayer.pauseVideo();
    }
  }

  function openModal(tile) {
    var videoId = tile.dataset.videoId;
    var key = tile.dataset.tileKey;
    var title = tile.dataset.title || "";
    var startAt = tileTimes[key] || 0;
    if (tilePlayers[key] && tilePlayers[key].player) {
      try {
        startAt = tilePlayers[key].player.getCurrentTime();
        tileTimes[key] = startAt;
        tilePlayers[key].player.pauseVideo();
      } catch (e) {
        /* ignore */
      }
    }

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

    playlist.videos.forEach(function (video, index) {
      var tileKey = playlist.id + "-" + video.id;
      var tile = document.createElement("button");
      tile.type = "button";
      tile.className = "yt-tile";
      tile.setAttribute("role", "listitem");
      tile.dataset.videoId = video.id;
      tile.dataset.tileKey = tileKey;
      tile.dataset.title = video.title;
      tile.innerHTML =
        '<span class="yt-tile-thumb" style="background-image:url(\'' +
        thumbUrl(video.id) +
        '\')"></span>' +
        '<span class="yt-tile-player" aria-hidden="true"></span>' +
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

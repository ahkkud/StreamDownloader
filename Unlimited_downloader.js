// ==UserScript==
// @name         Video Stream Downloader
// @namespace    http://your-namespace.com
// @version      0.1
// @description  Download video streams from any webpage
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let mediaSource;
    let videoSourceBuffer;
    let audioSourceBuffer;
    let videoBufferArray = [];
    let audioBufferArray = [];

    function initializeMediaSource() {
        mediaSource = new MediaSource();
        const video = document.createElement('video');
        video.src = URL.createObjectURL(mediaSource);
        video.controls = true;
        document.body.appendChild(video);

        mediaSource.addEventListener('sourceopen', handleSourceOpen);
    }

    function handleSourceOpen() {
        videoSourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
        audioSourceBuffer = mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');

        videoSourceBuffer.addEventListener('updateend', handleUpdateEnd);
        audioSourceBuffer.addEventListener('updateend', handleUpdateEnd);

        // Hook the appendBuffer method
        const originalAppendBuffer = videoSourceBuffer.appendBuffer;
        videoSourceBuffer.appendBuffer = function(data) {
            videoBufferArray.push(new Uint8Array(data));
            originalAppendBuffer.apply(videoSourceBuffer, arguments);
        };

        const originalAppendBufferAudio = audioSourceBuffer.appendBuffer;
        audioSourceBuffer.appendBuffer = function(data) {
            audioBufferArray.push(new Uint8Array(data));
            originalAppendBufferAudio.apply(audioSourceBuffer, arguments);
        };
    }

    function handleUpdateEnd() {
        if (mediaSource.readyState === 'open') {
            // Check if video and audio buffers are both ready
            if (videoSourceBuffer.updating || audioSourceBuffer.updating) {
                return;
            }

            // Create Blobs from buffer arrays
            const videoBlob = new Blob(videoBufferArray, { type: 'video/mp4' });
            const audioBlob = new Blob(audioBufferArray, { type: 'audio/mp4' });

            // Do something with the blobs (e.g., save or process)
            console.log('Video Blob:', videoBlob);
            console.log('Audio Blob:', audioBlob);

            // Reset buffer arrays for the next round
            videoBufferArray = [];
            audioBufferArray = [];
        }
    }

    // Initialize the MediaSource when the document is ready
    document.addEventListener('DOMContentLoaded', initializeMediaSource);
})();

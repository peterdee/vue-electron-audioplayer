<template>
  <div>
    <div
      class="modal-background"
      @click="setContextMenuVisibility(false)"
    />
    <div class="flex direction-column justify-content-space-between content">
      <div class="fs-18">
        {{ formatName(track.name) }}
      </div>
      <div class="flex direction-column justify-content-start text-left fs-16">
        <div class="flex justify-content-space-between data-line noselect">
          <div class="data-name">
            Added
          </div>
          <div class="data-value">
            {{ formatDate(track.added) }}
          </div>
        </div>
        <div class="flex justify-content-space-between data-line noselect">
          <div class="data-name">
            Format
          </div>
          <div class="data-value">
            {{ getFormat(track.name) }}
          </div>
        </div>
        <div class="flex justify-content-space-between data-line">
          <div class="data-name noselect">
            Full path
          </div>
          <div class="data-value">
            <input
              class="data-input"
              name="path"
              readonly="true"
              type="text"
              :value="track.path"
            />
          </div>
        </div>
        <div class="flex justify-content-space-between data-line noselect">
          <div class="data-name">
            File size
          </div>
          <div class="data-value">
            {{ formatSize(track.size) }}
          </div>
        </div>
      </div>
      <div
        v-if="current.id === contextTrackId && !paused"
        class="noselect"
      >
        File is playing
      </div>
      <div
        v-else-if="!track.available"
        class="error noselect"
      >
        Track is not available!
      </div>
      <div
        v-else
        class="noselect"
      >
        <button
          class="action-button menu-button"
          @click="handlePlay"
          type="button"
        >
          Play
        </button>
      </div>
      <button
        v-if="!inQueue"
        class="action-button menu-button noselect"
        @click="handleAddToQueue"
        :disabled="!track.available"
        type="button"
      >
        Add to queue
      </button>
      <button
        v-else
        class="action-button menu-button noselect"
        @click="handleRemoveFromQueue"
        type="button"
      >
        Remove from queue
      </button>
      <button
        class="action-button menu-button noselect"
        @click="handleDelete"
        type="button"
      >
        Delete
      </button>
      <button
        class="action-button menu-button noselect"
        @click="setContextMenuVisibility(false)"
        type="button"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import { EVENTS } from '../../configuration';
import formatTrackName from '../../utilities/format-track-name';
import getFileExtension from '../../utilities/get-file-extension';
import getNextTrackId from '../../utilities/get-next-track';
import months from '../../utilities/months';

export default {
  name: 'ContextMenu',
  props: {
    paused: {
      required: true,
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters({
      trackIds: 'playlist/getTrackIds',
    }),
    ...mapState({
      contextTrackId: ({ contextMenu }) => contextMenu.trackId,
      current: ({ track }) => track.track,
      loop: ({ settings }) => settings.loop,
      playbackQueue: ({ playbackQueue }) => playbackQueue.queue,
      tracks: ({ playlist }) => playlist.tracks,
    }),
    inQueue() {
      return this.playbackQueue.includes(this.contextTrackId);
    },
    /**
     * Get track data
     */
    track() {
      const [track = {}] = this.tracks.filter((item) => item.id === this.contextTrackId);
      return track;
    },
  },
  methods: {
    ...mapActions({
      addToQueue: 'playbackQueue/addTrack',
      clearTrack: 'track/clearTrack',
      deleteTrackFromPlaylist: 'playlist/deleteTrack',
      removeFromQueue: 'playbackQueue/deleteTrack',
      setContextMenuTrackId: 'contextMenu/setTrackId',
      setContextMenuVisibility: 'contextMenu/setVisibility',
    }),
    /**
     * Format track name
     * @param {string} name - track name
     * @returns {string}
     */
    formatName(name = '') {
      return formatTrackName(name, false);
    },
    /**
     * Handle adding track to the playback queue
     * @returns {Promise<void>}
     */
    async handleAddToQueue() {
      await this.addToQueue(this.contextTrackId);
      await this.setContextMenuTrackId('');

      // Websockets
      if (this.$io().connected) {
        // emit the UPDATE_QUEUE event
        this.$io().emit(
          EVENTS.UPDATE_QUEUE,
          {
            queue: this.playbackQueue.length,
          },
        );
      }

      return this.setContextMenuVisibility(false);
    },
    /**
     * Handle the 'Delete' button
     * @returns {Promise<void>}
     */
    async handleDelete() {
      // check if track is playing / selected
      if (this.contextTrackId === this.current.id) {
        const nextId = getNextTrackId(this.trackIds, this.current.id, this.loop);
        await this.clearTrack();
        this.$emit('handle-track-selection', nextId);
      }

      await this.deleteTrackFromPlaylist(this.contextTrackId);
      await this.removeFromQueue(this.contextTrackId);
      await this.setContextMenuTrackId('');
      return this.setContextMenuVisibility(false);
    },
    /**
     * Handle the 'Play' button
     * @returns {Promise<void>}
     */
    async handlePlay() {
      await this.clearTrack();
      this.$emit('handle-track-selection', this.contextTrackId);
      await this.setContextMenuTrackId('');
      return this.setContextMenuVisibility(false);
    },
    /**
     * Handle removing track from the playback queue
     * @returns {Promise<void>}
     */
    async handleRemoveFromQueue() {
      await this.removeFromQueue(this.contextTrackId);
      await this.setContextMenuTrackId('');

      // Websockets
      if (this.$io().connected) {
        // emit the UPDATE_QUEUE event
        this.$io().emit(
          EVENTS.UPDATE_QUEUE,
          {
            queue: this.playbackQueue.length,
          },
        );
      }

      return this.setContextMenuVisibility(false);
    },
    /**
     * Format date
     * @param {number} stamp - timestamp
     * @returns {string}
     */
    formatDate(stamp = 0) {
      const date = new Date(stamp);
      const year = date.getFullYear();
      const month = months[date.getMonth()];
      const day = date.getDate() > 9
        ? date.getDate()
        : `0${date.getDate()}`;
      const hours = date.getHours() > 9
        ? date.getHours()
        : `0${date.getHours()}`;
      const minutes = date.getMinutes() > 9 
        ? date.getMinutes()
        : `0${date.getMinutes()}`;
      return `${month} ${day}, ${year}, at ${hours}:${minutes}`;
    },
    /**
     * Format file size
     * @param {number} size - file size in bytes
     * @returns {string}
     */
    formatSize(size = 0) {
      // bytes  
      if (size < 1024) {
        return `${size}B`;
      }

      // kilobytes
      if (size < (1024 * 1024)) {
        return `${(size / 1024).toFixed(1)}KB`;
      }

      // megabytes
      return `${(size / 1024 / 1024).toFixed(1)}MB`;
    },
    /**
     * Get file format
     * @param {string} name - track name
     * @returns {string}
     */
    getFormat(name = '') {
      if (!name) {
        return 'Not available';
      }
      const format = getFileExtension(name);
      return format.toUpperCase();
    },
  },
};
</script>

<style src="./ContextMenu.css" scoped />

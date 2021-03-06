import * as actionTypes from './action-types';
import randomize from '../../../utilities/randomize';

export default {
  /**
   * Add multiple tracks to the playlist via 'Open playlist'
   * @param {*} commit - commit function
   * @param {*} payload - payload
   * @returns {void}
   */
  addMultipleTracks({ commit }, payload) {
    return commit(actionTypes.PLAYLIST_ADD_MULTIPLE_TRACKS, payload);
  },
  /**
   * Add a single track to the playlist
   * @param {*} commit - commit function
   * @param {*} state - Playlist state
   * @param {*} payload - payload
   * @returns {void}
   */
  addTrack({ commit }, payload) {
    return commit(actionTypes.PLAYLIST_ADD_TRACK, payload);
  },
  /**
   * Clear playlist: delete all tracks
   * @param {*} commit - commit function
   * @returns {void}
   */
  clearPlaylist({ commit }) {
    return commit(actionTypes.PLAYLIST_CLEAR_PLAYLIST);
  },
  /**
   * Delete a single track from the playlist
   * @param {*} commit - commit function
   * @param {*} payload - payload
   * @returns {void}
   */
  deleteTrack({ commit }, payload) {
    return commit(actionTypes.PLAYLIST_DELETE_TRACK, payload);
  },
  /**
   * Randomize playlist tracks: place them in a random order
   * @param {*} commit - commit function
   * @param {*} state - Playlist state
   * @returns {void}
   */
  randomizeTracks({ commit, state }) {
    return commit(actionTypes.PLAYLIST_RANDOMIZE_TRACKS, randomize(state.tracks));
  },
  /**
   * Reshuffle tracks
   * @param {*} commit - commit function
   * @param {string[]} payload - track IDs
   * @returns {void}
   */
  reshuffle({ commit }, payload = []) {
    const reshuffled = randomize(payload);
    return commit(
      actionTypes.PLAYLIST_RESHUFFLE,
      reshuffled.map((id) => ({
        id,
        played: false,
      })),
    );
  },
  /**
   * Set track availability
   * @param {*} commit - commit function
   * @param {*} state - Playlist state
   * @param {*} payload - availability state
   * @returns {void}
   */
  setAvailability({ commit, state }, payload = {}) {
    const updated = state.tracks.reduce((arr, track) => {
      const mutable = { ...track };
      if (mutable.id === payload.id) {
        mutable.available = payload.available;
      }
      arr.push(mutable);
      return arr;
    }, []);
    return commit(actionTypes.PLAYLIST_SET_TRACKS, updated);
  },
  /**
   * Set shuffled track as played
   * @param {*} commit - commit function
   * @param {*} state - Playlist state
   * @param {string} payload - track ID
   * @returns {void}
   */
  setShuffledTrackAsPlayed({ commit, state }, payload = '') {
    const { shuffled = [] } = state;
    const updated = shuffled.reduce((arr, item) => {
      if (item.id === payload) {
        arr.push({
          ...item,
          played: true,
        });
        return arr;
      }
      arr.push(item);
      return arr;
    }, []);
    return commit(actionTypes.PLAYLIST_SET_SHUFFLED, updated);
  },
  /**
   * Sort playlist tracks by date
   * @param {*} commit - commit function
   * @param {*} state - Playlist state
   * @returns {void}
   */
  sortByDate({ commit, state }) {
    return commit(
      actionTypes.PLAYLIST_SET_TRACKS,
      state.tracks.sort((a, b) => a.added - b.added),
    );
  },
  /**
   * Sort playlist tracks by name
   * @param {*} commit - commit function
   * @param {*} state - Playlist state
   * @returns {void}
   */
  sortByName({ commit, state }) {
    return commit(
      actionTypes.PLAYLIST_SET_TRACKS,
      state.tracks.sort((a, b) => a.name.localeCompare(b.name)),
    );
  },
};

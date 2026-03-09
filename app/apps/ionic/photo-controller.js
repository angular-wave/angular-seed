import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

/**
 * @typedef {Object} UserPhoto
 * @property {string} filepath - The file path to the user's photo.
 * @property {string} base64Data - Base64 representation of the photo.
 */

export class PhotoController {
  static $inject = ["$scope"];

  constructor(/** @type {any} */ $scope) {
    /** @type {UserPhoto[]} */
    this.photos = [];
    this.$scope = $scope;
  }

  async addPhotoToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
  }

  /**
   * @param {import('@capacitor/camera').Photo} photo
   * @returns {Promise<UserPhoto>}
   */
  async savePicture(photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + ".jpeg";

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      base64Data: base64Data,
    };
  }

  /**
   * Convert a Blob to a base64 string.
   * @param {import('@capacitor/camera').Photo} photo
   * @returns {Promise<string>}
   */
  async readAsBase64(photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    if (!photo.webPath) {
      throw new Error("Photo webPath is undefined");
    }
    const response = await fetch(photo.webPath);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob);
  }

  /**
   * @private
   * @param {Blob} blob
   * @returns {Promise<string>}
   */
  convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(/** @type {string} */ (reader.result));
      reader.readAsDataURL(blob);
    });
  }
}

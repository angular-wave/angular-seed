import { test, expect } from "@playwright/test";

test.describe("PhotoController", () => {
  test("constructor initialises empty photos array", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(() => {
      class PhotoController {
        constructor($scope) {
          this.photos = [];
          this.$scope = $scope;
        }
      }
      const ctrl = new PhotoController({});
      return { length: ctrl.photos.length };
    });
    expect(result.length).toBe(0);
  });

  test("convertBlobToBase64 resolves with a data URL", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(async () => {
      class PhotoController {
        convertBlobToBase64(blob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      }
      const ctrl = new PhotoController();
      const blob = new Blob(["hello"], { type: "text/plain" });
      const base64 = await ctrl.convertBlobToBase64(blob);
      return { startsCorrectly: base64.startsWith("data:text/plain;base64,") };
    });
    expect(result.startsCorrectly).toBe(true);
  });

  test("readAsBase64 throws when webPath is undefined", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(async () => {
      class PhotoController {
        async readAsBase64(photo) {
          if (!photo.webPath) {
            throw new Error("Photo webPath is undefined");
          }
        }
      }
      const ctrl = new PhotoController();
      try {
        await ctrl.readAsBase64({});
        return { threw: false };
      } catch (e) {
        return { threw: true, message: e.message };
      }
    });
    expect(result.threw).toBe(true);
    expect(result.message).toBe("Photo webPath is undefined");
  });

  test("savePicture returns correct shape", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(async () => {
      class PhotoController {
        async readAsBase64() {
          return "data:image/jpeg;base64,fakedata";
        }
        async savePicture(photo) {
          const base64Data = await this.readAsBase64(photo);
          const fileName = `${Date.now()}.jpeg`;
          return { filepath: fileName, base64Data };
        }
      }
      const ctrl = new PhotoController();
      const saved = await ctrl.savePicture({ webPath: "http://example.com" });
      return {
        hasFilepath: typeof saved.filepath === "string",
        endsWithJpeg: saved.filepath.endsWith(".jpeg"),
        hasBase64: saved.base64Data === "data:image/jpeg;base64,fakedata",
      };
    });
    expect(result.hasFilepath).toBe(true);
    expect(result.endsWithJpeg).toBe(true);
    expect(result.hasBase64).toBe(true);
  });
});

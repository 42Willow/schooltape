export default defineBackground(() => {
  checkForUpdates()


  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      logger.info('[background] Opening wiki page after install');
      browser.tabs.create({ url: "https://schooltape.github.io/installed" });
    } else if (reason === "update") {
      logger.info("[background] Notifying user about the update");
      browser.notifications.create("updated", {
        title: "Schooltape updated",
        type: "basic",
        iconUrl: browser.runtime.getURL("/icon/128.png"),
        message: "Click here to look at the release notes.",
      });
    }
  });

  browser.notifications.onClicked.addListener(function (notifID) {
    if (notifID === "update") {
      browser.tabs.create({
        url: "https://github.com/schooltape/schooltape/releases/latest",
      });
    }
    if (notifID === "updated") {
      browser.tabs.create({ url: `https://github.com/schooltape/schooltape/releases/tag/v${browser.runtime.getManifest().version}` });
    }
  });

  // watch for global toggle
  globalSettings.watch((newSettings, oldSettings) => {
    if (newSettings.global !== oldSettings.global) {
      logger.info(`[background] Global toggle changed to ${newSettings.global}`);
      // update icon
      browser.action.setIcon({
        path: {
          16: newSettings.global ? "/icon/16.png" : "/icon/16-disabled.png",
          32: newSettings.global ? "/icon/32.png" : "/icon/32-disabled.png",
          48: newSettings.global ? "/icon/48.png" : "/icon/48-disabled.png",
          128: newSettings.global ? "/icon/128.png" : "/icon/128-disabled.png",
        },
      });
      // if global is enabled, check for updates
      if (newSettings.global) {
        checkForUpdates();
      }
    }
  });

  async function checkForUpdates(): Promise<boolean> {
    if (!navigator.onLine) {
      logger.error("[background] Failed to check for updates: offline");
      return false;
    }
    try {
      const response = await fetch("https://api.github.com/repos/schooltape/schooltape/releases/latest");
      if (!response.ok) {
        throw new Error(`Failed to fetch latest release: ${response.statusText}`);
      }
      const data = await response.json();
      const latestVersion = data.tag_name.replace("v", "");
      const currentVersion = browser.runtime.getManifest().version;
      if (latestVersion !== currentVersion) {
        logger.info(`[background] Found new version: ${latestVersion}`);
        if ((await globalSettings.getValue()).updates.desktop) {
          browser.notifications.create("update", {
            title: "Available update",
            type: "basic",
            iconUrl: browser.runtime.getURL("/icon/128.png"),
            message: `Click here to update to v${latestVersion}`,
          });
        }
        return true;
      }
    } catch (error) {
      logger.error(`[background] Failed to check for updates: ${error}`);
      return false;
    }
    return false;
  }

});




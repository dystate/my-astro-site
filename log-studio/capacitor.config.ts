import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dystate.bluejournal",
  appName: "蓝笺",
  webDir: "mobile-dist",
  backgroundColor: "#f3f7ff",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "BlueJournal",
  },
};

export default config;

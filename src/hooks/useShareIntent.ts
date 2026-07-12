import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import ReceiveSharingIntent from "react-native-receive-sharing-intent";
import { NavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation.types";

interface SharedFile {
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  contentUri?: string;
  text?: string;
}

/**
 * Listens for files shared to the app from other apps (share sheet / intent).
 * When a supported file is received, navigates to SubmitDocumentScreen with
 * the file pre-filled so the user only needs to search for a vendor.
 *
 * Must be called inside the NavigationContainer so navigation is available.
 */
export function useShareIntent(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>
) {
  const navigateToSubmit = useCallback(
    (uri: string, name: string, mimeType: string) => {
      const nav = navigationRef.current;
      if (!nav) return;

      nav.navigate("Main", {
        screen: "DocumentsTab",
        params: {
          screen: "SubmitDocument",
          params: {
            sharedFileUri: uri,
            sharedFileName: name,
            sharedFileMimeType: mimeType,
          },
        },
      } as any);
    },
    [navigationRef]
  );

  /**
   * Tries to navigate immediately. If the navigator isn't ready yet (cold
   * start), polls every 100 ms for up to 3 seconds before giving up.
   */
  const navigateWhenReady = useCallback(
    (uri: string, name: string, mimeType: string) => {
      const nav = navigationRef.current;
      if (nav?.isReady()) {
        navigateToSubmit(uri, name, mimeType);
        return;
      }

      const MAX_ATTEMPTS = 30; // 30 × 100 ms = 3 s
      let attempts = 0;

      const intervalId = setInterval(() => {
        attempts += 1;
        if (navigationRef.current?.isReady()) {
          clearInterval(intervalId);
          navigateToSubmit(uri, name, mimeType);
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(intervalId);
          console.warn("[useShareIntent] Navigation never became ready; dropping share intent.");
        }
      }, 100);
    },
    [navigationRef, navigateToSubmit]
  );

  const handleSharedFiles = useCallback(
    (files: SharedFile[]) => {
      if (!files || files.length === 0) return;

      const first = files[0];
      // Prefer contentUri (Android) over filePath, fall back gracefully
      const uri = first.contentUri ?? first.filePath;
      if (!uri) return;

      const name =
        first.fileName ?? uri.split("/").pop() ?? "shared_file";
      const mimeType = first.mimeType ?? "application/octet-stream";

      // Clear the intent AFTER we've captured the data we need, so
      // a synchronous throw can't clear it before we've used it.
      ReceiveSharingIntent.clearReceivedFiles();

      navigateWhenReady(uri, name, mimeType);
    },
    [navigateWhenReady]
  );

  useEffect(() => {
    if (Platform.OS === "web") return;

    // Subscribe to incoming share intents (fires when app is opened via share)
    ReceiveSharingIntent.getReceivedFiles(
      handleSharedFiles,
      (error: unknown) => {
        console.warn("[useShareIntent] Failed to receive shared files:", error);
      },
      // Android: the activity this intent was sent to (matches app package)
      "com.uploaddoc.app"
    );

    return () => {
      ReceiveSharingIntent.clearReceivedFiles();
    };
  }, [handleSharedFiles]);
}


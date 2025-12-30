import { Disposable, WebviewPanel } from "vscode";

/**
 * Manager for WebviewPanels to allow central control of creation, reuse and disposing.
 */
export class WebviewPanelManager implements Disposable {

  /**
   *
   */
  private readonly groups: Map<string, Map<string, WebviewPanel>> = new Map();

  /**
   *
   */
  private readonly counters: Map<string, number> = new Map();

  /**
   *
   */
  private readonly disposables: Disposable[] = [];

  /**
   *
   */
  public dispose(): void {
    for (const group of this.groups.values()) {
      for (const panel of group.values()) {
        panel.dispose();
      }
      group.clear();
    }
    this.groups.clear();
    this.counters.clear();

    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }
}

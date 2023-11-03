export function updateFileProgress(file: string, progress: number) {
  if (typeof window !== "undefined") {
    if(! (<any>window).chatvrm_loading_progress) {
      (<any>window).chatvrm_loading_progress = {};
      (<any>window).chatvrm_loading_progress_cnt = 0;
    }
  }

  if (progress === 100) {
    delete (<any>window).chatvrm_loading_progress[file];
  } else {
    (<any>window).chatvrm_loading_progress[file] = progress;
  }

  (<any>window).chatvrm_loading_progress_cnt++;
}

import { useEffect, useState } from "react";

type LoadingFile = {
  file: string;
  progress: number;
}

export function LoadingProgress() {
  if (typeof window !== "undefined") {
    if(! (window as any).chatvrm_loading_progress) {
      (window as any).chatvrm_loading_progress = {};
      (window as any).chatvrm_loading_progress_cnt = 0;
    }
  }

  const [files, setFiles] = useState<LoadingFile[]>([]);
  const [progressCnt, setProgressCnt] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const progress = (window as any).chatvrm_loading_progress;
        const cnt = (window as any).chatvrm_loading_progress_cnt;
        if (progressCnt !== cnt) {
          setFiles(Object.entries(progress).map(([k, v]) => ({
            file: k as string,
            progress: v as number,
          })));
          setProgressCnt(cnt);
        }
      }
    }, 100);
  }, []);

  return (
    <div className="absolute top-0 right-0 p-4 w-20 text-white text-xs z-5">
      {files.map((row) => (
        <div key={row.file}>
          {row.file}: {row.progress}%
        </div>
      ))}
    </div>
  );
}

import { buildUrl } from "@/utils/buildUrl";

export const GitHubLink = () => {
  return (
    <a
      draggable={false}
      href="https://github.com/semperai/amica"
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="p-8 rounded-16 bg-[#1F2328] hover:bg-[#33383E] active:bg-[565A60] inline-flex">
        <img
          alt="https://github.com/semperai/amica"
          height={24}
          width={24}
          src={buildUrl("/github-mark-white.svg")}
        ></img>
        <div className="mx-4 text-white font-bold">Open Source</div>
      </div>
    </a>
  );
};
